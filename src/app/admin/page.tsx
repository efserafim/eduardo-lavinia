import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { FiligreeCorner, FloralWash, Ornament } from "@/components/Ornament";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 py-16">
        <FloralWash />
        <FiligreeCorner position="tl" className="top-6 left-6" />
        <FiligreeCorner position="tr" className="top-6 right-6" />

        <div className="relative z-10 mx-auto w-full max-w-sm">
          <div className="text-center">
            <p className="eyebrow">Área do casal</p>
            <h1 className="font-script mt-3 text-5xl text-marsala">Entrar</h1>
            <Ornament className="mt-6" />
            <p className="mt-4 text-sm text-ink-soft">
              Use o e-mail e a senha criados no Supabase Auth.
            </p>
          </div>
          <div className="mt-10">
            <LoginForm />
          </div>
          <Link
            href="/"
            className="mt-10 block text-center text-[0.68rem] tracking-[0.22em] text-ink-faint uppercase transition hover:text-marsala"
          >
            Voltar ao site
          </Link>
        </div>
      </main>
    );
  }

  const [items, photos] = await Promise.all([
    prisma.item.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        donations: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.photo.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const serializedItems = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    donations: item.donations.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  }));

  return (
    <main>
      <AdminDashboard items={serializedItems} photos={photos} />
    </main>
  );
}
