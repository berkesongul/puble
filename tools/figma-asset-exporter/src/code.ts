type ExportFormat = "SVG" | "PNG";

type ScanRequest = {
  type: "scan";
  pageName: string;
};

type ExportRequest = {
  type: "export";
  pageName: string;
  format: ExportFormat;
  pngScale: number;
};

type PluginRequest = ScanRequest | ExportRequest | { type: "close" };

type AssetCandidate = {
  node: SceneNode;
  category: string;
  filename: string;
};

type ExportManifestItem = {
  nodeId: string;
  nodeName: string;
  category: string;
  file: string;
  format: ExportFormat;
};

const DEFAULT_PAGE_NAME = "AI Implemention";
const CONTAINER_TYPES = new Set<SceneNode["type"]>([
  "SECTION",
  "FRAME",
  "GROUP",
  "COMPONENT_SET",
]);

figma.showUI(__html__, {
  width: 440,
  height: 640,
  themeColors: true,
});

figma.ui.onmessage = async (message: PluginRequest) => {
  try {
    if (message.type === "close") {
      figma.closePlugin();
      return;
    }

    if (message.type === "scan") {
      const result = await scanPage(message.pageName);
      figma.ui.postMessage({ type: "scan-result", ...result });
      return;
    }

    if (message.type === "export") {
      await exportAssets(message);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: "error", message: detail });
  }
};

void scanPage(DEFAULT_PAGE_NAME)
  .then((result) => figma.ui.postMessage({ type: "scan-result", ...result }))
  .catch((error) => {
    const detail = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: "error", message: detail });
  });

async function getPage(requestedName: string): Promise<PageNode> {
  const pageName = requestedName.trim() || DEFAULT_PAGE_NAME;
  await figma.loadAllPagesAsync();

  const page = figma.root.children.find(
    (candidate) => candidate.name.trim().toLocaleLowerCase() === pageName.toLocaleLowerCase(),
  );

  if (!page) {
    const availablePages = figma.root.children.map((candidate) => candidate.name).join(", ");
    throw new Error(
      `“${pageName}” sayfası bulunamadı. Dosyadaki sayfalar: ${availablePages || "yok"}`,
    );
  }

  await page.loadAsync();
  return page;
}

async function scanPage(pageName: string) {
  const page = await getPage(pageName);
  const candidates = collectCandidates(page);
  const categoryCounts = new Map<string, number>();

  for (const candidate of candidates) {
    categoryCounts.set(candidate.category, (categoryCounts.get(candidate.category) ?? 0) + 1);
  }

  return {
    pageName: page.name,
    assetCount: candidates.length,
    categories: Array.from(categoryCounts, ([name, count]) => ({ name, count })),
  };
}

function collectCandidates(page: PageNode): AssetCandidate[] {
  const candidates: AssetCandidate[] = [];
  const usedPaths = new Set<string>();

  for (const topLevelNode of page.children) {
    if (!isVisible(topLevelNode)) continue;

    if (CONTAINER_TYPES.has(topLevelNode.type) && "children" in topLevelNode) {
      const category = sanitizeSegment(topLevelNode.name, "uncategorized");
      for (const child of topLevelNode.children) {
        if (!isVisible(child) || !isExportable(child)) continue;
        candidates.push({
          node: child,
          category,
          filename: uniqueName(category, sanitizeSegment(child.name, "asset"), usedPaths),
        });
      }
      continue;
    }

    if (isExportable(topLevelNode)) {
      const category = "ungrouped";
      candidates.push({
        node: topLevelNode,
        category,
        filename: uniqueName(
          category,
          sanitizeSegment(topLevelNode.name, "asset"),
          usedPaths,
        ),
      });
    }
  }

  return candidates;
}

function isVisible(node: SceneNode): boolean {
  return node.visible !== false && !node.name.trim().startsWith(".");
}

function isExportable(node: SceneNode): node is SceneNode & ExportMixin {
  return "exportAsync" in node && typeof node.exportAsync === "function";
}

function sanitizeSegment(value: string, fallback: string): string {
  const sanitized = value
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+|\.+$/g, "")
    .trim();

  return sanitized || fallback;
}

function uniqueName(category: string, baseName: string, usedPaths: Set<string>): string {
  let candidate = baseName;
  let suffix = 2;

  while (usedPaths.has(`${category}/${candidate}`.toLocaleLowerCase())) {
    candidate = `${baseName}-${suffix}`;
    suffix += 1;
  }

  usedPaths.add(`${category}/${candidate}`.toLocaleLowerCase());
  return candidate;
}

async function exportAssets(request: ExportRequest) {
  const page = await getPage(request.pageName);
  const candidates = collectCandidates(page);

  if (candidates.length === 0) {
    throw new Error("Dışa aktarılabilecek görünür asset bulunamadı.");
  }

  const scale = Math.min(4, Math.max(1, Math.round(request.pngScale)));
  const extension = request.format.toLocaleLowerCase();
  const manifest: ExportManifestItem[] = [];

  figma.ui.postMessage({
    type: "export-start",
    pageName: page.name,
    total: candidates.length,
  });

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const bytes =
      request.format === "SVG"
        ? await candidate.node.exportAsync({
            format: "SVG",
            svgOutlineText: true,
            svgIdAttribute: true,
            contentsOnly: true,
          })
        : await candidate.node.exportAsync({
            format: "PNG",
            constraint: { type: "SCALE", value: scale },
            contentsOnly: true,
          });

    const file = `${candidate.category}/${candidate.filename}.${extension}`;
    const manifestItem: ExportManifestItem = {
      nodeId: candidate.node.id,
      nodeName: candidate.node.name,
      category: candidate.category,
      file,
      format: request.format,
    };

    manifest.push(manifestItem);
    figma.ui.postMessage({
      type: "asset",
      bytes,
      item: manifestItem,
      completed: index + 1,
      total: candidates.length,
    });
  }

  figma.ui.postMessage({
    type: "export-complete",
    pageName: page.name,
    manifest,
  });
}
