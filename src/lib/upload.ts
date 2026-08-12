import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

function assertImage(file: File) {
  const ext = extensionFor(file);
  const looksLikeImage =
    file.type.startsWith("image/") ||
    ["jpg", "png", "webp", "gif"].includes(ext);
  if (!looksLikeImage) {
    throw new Error("Envie apenas imagens (JPG, PNG, WEBP ou GIF).");
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

async function ensureBucket(
  supabase: ReturnType<typeof createClient>
) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (exists) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(
      `Não foi possível criar o bucket "${BUCKET}": ${error.message}`
    );
  }
}

async function saveToSupabase(file: File, prefix: string) {
  const supabase = getServiceSupabase();
  if (!supabase) return null;

  const ext = assertImage(file);
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await ensureBucket(supabase);

  const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
    contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: false,
  });

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
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
  const remote = await saveToSupabase(file, prefix);
  if (remote) return remote;

  if (process.env.VERCEL) {
    throw new Error(
      "Configure SUPABASE_SERVICE_ROLE_KEY na Vercel para salvar fotos (o disco local não persiste)."
    );
  }

  return saveLocally(file, prefix);
}
