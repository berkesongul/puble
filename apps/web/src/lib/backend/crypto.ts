import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ApiError } from "./http";

function key() {
  const secret = process.env.PUBLE_CREDENTIALS_SECRET;
  if (!secret || secret.length < 32) {
    throw new ApiError(503, "Kimlik bilgisi şifreleme anahtarı yapılandırılmamış.", "MISSING_SECRET");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptCredential(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptCredential(payload: string) {
  const [version, ivPart, tagPart, dataPart] = payload.split(".");
  if (version !== "v1" || !ivPart || !tagPart || !dataPart) throw new Error("Invalid credential payload");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
