import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "REQUEST_FAILED",
  ) {
    super(message);
  }
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return Response.json({ data }, { status: 200, ...init });
}

export function jsonCreated(data: unknown) {
  return Response.json({ data }, { status: 201 });
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Gönderilen alanlar geçersiz.",
          fields: error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }
  console.error("Unhandled API error", error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Beklenmeyen bir hata oluştu." } },
    { status: 500 },
  );
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Geçerli bir JSON gövdesi gerekli.", "INVALID_JSON");
  }
}

