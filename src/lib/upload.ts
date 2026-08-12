import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

const BUCKET = "uploads";

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/jpeg" || file.type === "image/jpg") return "jpg";
  return "jpg";
}

function assertImage(file: File) {
  const ext = extensionFor(file);
  const looksLikeImage =
    (file.type && file.type.startsWith("image/")) ||
    ["jpg", "png", "webp", "gif"].includes(ext);
  if (!looksLikeImage) {
    throw new Error("Envie apenas imagens (JPG, PNG, WEBP ou GIF).");
  }
  if (file.type === "image/heic" || file.type === "image/heif" || ext === "heic") {
    throw new Error("Formato HEIC não suportado. Envie JPG ou PNG.");
  }
  return ext;
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensurePublicBucket(supabase: SupabaseClient) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    // Sem permissão para listar — tenta upload direto.
    return;
  }
  if (buckets?.some((b) => b.name === BUCKET)) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw new Error(
      `Crie o bucket público "${BUCKET}" no Supabase (Storage) e tente de novo. (${error.message})`
    );
  }
}

async function uploadWithClient(
  supabase: SupabaseClient,
  file: File,
  prefix: string,
  canManageBuckets: boolean
) {
  const ext = assertImage(file);
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (canManageBuckets) {
    await ensurePublicBucket(supabase);
  }

  const contentType =
    file.type && file.type.startsWith("image/")
      ? file.type
      : `image/${ext === "jpg" ? "jpeg" : ext}`;

  let { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });

  if (error && /bucket not found/i.test(error.message) && canManageBuckets) {
    await ensurePublicBucket(supabase);
    ({ error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    }));
  }

  if (error) {
    throw new Error(
      error.message.includes("row-level security") ||
        error.message.includes("policy")
        ? `Sem permissão no Storage. Crie o bucket público "${BUCKET}" e permita upload para usuários autenticados.`
        : `Falha no upload: ${error.message}`
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  if (!data?.publicUrl) {
    throw new Error("Upload ok, mas não foi possível obter a URL pública.");
  }
  return data.publicUrl;
}

async function saveLocally(file: File, prefix: string) {
  const ext = assertImage(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}

export async function saveUploadedImage(file: File, prefix = "item") {
  const service = getServiceSupabase();
  if (service) {
    return uploadWithClient(service, file, prefix, true);
  }

  try {
    const sessionClient = await createServerSupabase();
    return await uploadWithClient(sessionClient, file, prefix, false);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no upload.";
    // Em local, sem Storage configurado, grava no disco.
    if (!process.env.VERCEL && /bucket|permissão|Storage|configurado/i.test(message)) {
      return saveLocally(file, prefix);
    }
    if (!process.env.VERCEL) {
      try {
        return await saveLocally(file, prefix);
      } catch {
        throw err;
      }
    }
    throw err;
  }
}
