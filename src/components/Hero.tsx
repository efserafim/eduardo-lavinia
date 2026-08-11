import Image from "next/image";
import { FiligreeCorner, FloralWash, Ornament } from "./Ornament";

export function Hero() {
  return (
    <header className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <FloralWash />

      <FiligreeCorner position="tl" className="top-4 left-4 md:top-8 md:left-8" />
      <FiligreeCorner position="tr" className="top-4 right-4 md:top-8 md:right-8" />
      <FiligreeCorner position="bl" className="bottom-4 left-4 md:bottom-8 md:left-8" />
      <FiligreeCorner position="br" className="right-4 bottom-4 md:right-8 md:bottom-8" />

      <nav className="animate-fade-up relative z-10 flex items-center justify-center gap-8 px-6 pt-8 md:pt-10">
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

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-4 text-center md:pb-32">
        <div className="animate-soft-scale relative mx-auto w-full max-w-[min(88vw,420px)]">
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
          className="animate-fade-up mt-1 flex w-full max-w-md flex-col items-center md:mt-2"
          style={{ animationDelay: "0.25s" }}
        >
          <p className="script-title">Chá de Panela</p>
          <Ornament className="my-5" />
          <p className="section-lead mt-0">
            Cada carinho, no valor que o coração mandar, nos ajuda a montar o
            lar onde começamos juntos.
          </p>
          <div className="mt-8">
            <a href="#presentes" className="btn-primary">
              Presentear o casal
            </a>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-up pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-marsala/40 md:bottom-7"
        style={{ animationDelay: "0.55s" }}
        aria-hidden
      >
        <span className="font-display text-[0.8rem] tracking-[0.18em]">
          deslize
        </span>
        <span className="mt-2 block h-8 w-px bg-gradient-to-b from-marsala/35 to-transparent" />
      </div>
    </header>
  );
}
