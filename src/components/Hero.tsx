import Image from "next/image";
import { FiligreeCorner, FloralWash } from "./Ornament";

export function Hero() {
  return (
    <header className="relative flex min-h-[100svh] flex-col overflow-hidden md:min-h-[92svh]">
      <FloralWash />

      <FiligreeCorner position="tl" className="top-3 left-3 md:top-6 md:left-6" />
      <FiligreeCorner position="tr" className="top-3 right-3 md:top-6 md:right-6" />
      <FiligreeCorner position="bl" className="bottom-3 left-3 md:bottom-6 md:left-6" />
      <FiligreeCorner position="br" className="right-3 bottom-3 md:right-6 md:bottom-6" />

      <nav className="animate-fade-up relative z-10 flex items-center justify-center gap-7 px-6 pt-6 md:pt-8">
        <a
          href="#galeria"
          className="font-display text-[0.95rem] tracking-[0.08em] text-marsala/75 transition hover:text-marsala"
        >
          Nós
        </a>
        <span className="h-1 w-1 rotate-45 bg-gold-soft/70" aria-hidden />
        <a
          href="#presentes"
          className="font-display text-[0.95rem] tracking-[0.08em] text-marsala/75 transition hover:text-marsala"
        >
          Presentes
        </a>
      </nav>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-2 text-center md:pb-24">
        <div className="animate-soft-scale relative mx-auto w-full max-w-[min(78vw,340px)] md:max-w-[380px]">
          <div className="animate-float absolute inset-10 -z-10 rounded-full bg-[radial-gradient(circle,rgba(201,137,151,0.18),transparent_70%)] blur-xl" />
          <Image
            src="/logo-el.png"
            alt="Eduardo & Lavínia"
            width={920}
            height={1150}
            priority
            className="mx-auto h-auto w-full"
          />
        </div>

        <div
          className="animate-fade-up mt-0 flex w-full max-w-md flex-col items-center"
          style={{ animationDelay: "0.25s" }}
        >
          <p className="script-title">Chá de Panela</p>
          <p className="section-lead mt-3 max-w-sm">
            Cada carinho, no valor que o coração mandar, nos ajuda a montar o
            lar onde começamos juntos.
          </p>
          <div className="mt-6">
            <a href="#presentes" className="btn-primary">
              Presentear o casal
            </a>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-up pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-marsala/40 md:bottom-5"
        style={{ animationDelay: "0.55s" }}
        aria-hidden
      >
        <span className="font-display text-[0.75rem] tracking-[0.18em]">
          deslize
        </span>
        <span className="mt-1.5 block h-6 w-px bg-gradient-to-b from-marsala/35 to-transparent" />
      </div>
    </header>
  );
}
