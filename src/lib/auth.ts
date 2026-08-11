import { createServerSupabase } from "@/lib/supabase/server";

function allowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const allow = allowedAdminEmails();
  if (allow.length > 0 && !allow.includes(user.email.toLowerCase())) {
    return null;
  }

  return user;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const user = await getAdminUser();
  return Boolean(user);
}
