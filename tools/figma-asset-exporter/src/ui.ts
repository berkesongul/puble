import JSZip from "jszip";

type CategorySummary = { name: string; count: number };
type ExportFormat = "SVG" | "PNG";
type ExportManifestItem = {
  nodeId: string;
  nodeName: string;
  category: string;
  file: string;
  format: ExportFormat;
};

type PluginMessage =
  | {
      type: "scan-result";
      pageName: string;
      assetCount: number;
      categories: CategorySummary[];
    }
  | { type: "export-start"; pageName: string; total: number }
  | {
      type: "asset";
      bytes: Uint8Array;
      item: ExportManifestItem;
      completed: number;
      total: number;
    }
  | {
      type: "export-complete";
      pageName: string;
      manifest: ExportManifestItem[];
    }
  | { type: "error"; message: string };

const pageNameInput = getElement<HTMLInputElement>("page-name");
const formatSelect = getElement<HTMLSelectElement>("format");
const pngScaleSelect = getElement<HTMLSelectElement>("png-scale");
const scanButton = getElement<HTMLButtonElement>("scan");
const exportButton = getElement<HTMLButtonElement>("export");
const closeButton = getElement<HTMLButtonElement>("close");
const status = getElement<HTMLDivElement>("status");
const summary = getElement<HTMLDivElement>("summary");
const categoryList = getElement<HTMLUListElement>("categories");
const progress = getElement<HTMLProgressElement>("progress");

let zip: JSZip | null = null;
let isBusy = false;

scanButton.addEventListener("click", scan);
exportButton.addEventListener("click", startExport);
closeButton.addEventListener("click", () => post({ type: "close" }));
formatSelect.addEventListener("change", updateFormatControls);

window.onmessage = async (event: MessageEvent<{ pluginMessage?: PluginMessage }>) => {
  const message = event.data.pluginMessage;
  if (!message) return;

  if (message.type === "scan-result") {
    renderScanResult(message);
    setBusy(false);
    return;
  }

  if (message.type === "export-start") {
    zip = new JSZip();
    progress.hidden = false;
    progress.max = message.total;
    progress.value = 0;
    setStatus(`${message.total} asset hazırlanıyor…`);
    return;
  }

  if (message.type === "asset") {
    zip?.file(message.item.file, message.bytes);
    progress.value = message.completed;
    setStatus(`${message.completed}/${message.total}: ${message.item.file}`);
    return;
  }

  if (message.type === "export-complete") {
    await finishExport(message.pageName, message.manifest);
    return;
  }

  if (message.type === "error") {
    setStatus(message.message, true);
    setBusy(false);
  }
};

updateFormatControls();

function scan() {
  setBusy(true);
  setStatus("Sayfa taranıyor…");
  post({ type: "scan", pageName: pageNameInput.value });
}

function startExport() {
  setBusy(true);
  summary.hidden = true;
  setStatus("Export başlatılıyor…");
  post({
    type: "export",
    pageName: pageNameInput.value,
    format: formatSelect.value as ExportFormat,
    pngScale: Number(pngScaleSelect.value),
  });
}

function renderScanResult(message: Extract<PluginMessage, { type: "scan-result" }>) {
  pageNameInput.value = message.pageName;
  categoryList.replaceChildren();

  for (const category of message.categories) {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const count = document.createElement("strong");
    name.textContent = category.name;
    count.textContent = String(category.count);
    item.append(name, count);
    categoryList.append(item);
  }

  summary.hidden = false;
  exportButton.disabled = message.assetCount === 0;
  setStatus(
    message.assetCount > 0
      ? `${message.categories.length} klasörde ${message.assetCount} asset hazır.`
      : "Dışa aktarılabilecek asset bulunamadı.",
    message.assetCount === 0,
  );
}

async function finishExport(pageName: string, manifest: ExportManifestItem[]) {
  if (!zip) {
    setStatus("ZIP oluşturulamadı.", true);
    setBusy(false);
    return;
  }

  zip.file(
    "assets-manifest.json",
    JSON.stringify(
      {
        sourcePage: pageName,
        exportedAt: new Date().toISOString(),
        assets: manifest,
      },
      null,
      2,
    ),
  );

  setStatus("ZIP paketleniyor…");
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(pageName)}-assets.zip`;
  anchor.click();
  URL.revokeObjectURL(url);

  progress.hidden = true;
  setStatus(`${manifest.length} asset indirildi.`);
  setBusy(false);
}

function updateFormatControls() {
  pngScaleSelect.disabled = formatSelect.value !== "PNG";
}

function setBusy(busy: boolean) {
  isBusy = busy;
  scanButton.disabled = busy;
  exportButton.disabled = busy;
  pageNameInput.disabled = busy;
  formatSelect.disabled = busy;
  pngScaleSelect.disabled = busy || formatSelect.value !== "PNG";
}

function setStatus(message: string, isError = false) {
  status.textContent = message;
  status.dataset.error = String(isError);
}

function post(message: Record<string, unknown>) {
  parent.postMessage({ pluginMessage: message }, "*");
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "figma";
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing UI element: ${id}`);
  return element as T;
}
