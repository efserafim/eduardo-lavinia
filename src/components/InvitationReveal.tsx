"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "el-invite-opened";

type Phase = "pending" | "idle" | "closed" | "opening" | "leaving";

function InviteDoors() {
  return (
    <>
      <span className="invite-door invite-door--left" aria-hidden>
        <span className="invite-door-face" />
        <span className="invite-door-shine" />
        <span className="invite-door-seam" />
      </span>
      <span className="invite-door invite-door--right" aria-hidden>
        <span className="invite-door-face" />
        <span className="invite-door-shine" />
        <span className="invite-door-seam" />
      </span>
    </>
  );
}

export function InvitationReveal() {
  const [phase, setPhase] = useState<Phase>("pending");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("idle");
        return;
      }
    } catch {
      // ignore storage errors
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("idle");
      return;
    }

    setPhase("closed");
  }, []);

  useEffect(() => {
    if (phase === "idle" || phase === "leaving") {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "opening") return;

    const leaveTimer = window.setTimeout(() => setPhase("leaving"), 1250);
    const doneTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("idle");
    }, 2000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase]);

  function openInvite() {
    if (phase !== "closed") return;
    setPhase("opening");
  }

  if (phase === "idle") return null;

  if (phase === "pending") {
    return (
      <div className="invite-overlay invite-overlay--closed" aria-hidden>
        <div className="invite-gate">
          <InviteDoors />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`invite-overlay invite-overlay--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Convite de Eduardo e Lavínia"
    >
      <button
        type="button"
        className="invite-gate"
        onClick={openInvite}
        disabled={phase !== "closed"}
        aria-label="Abrir convite"
      >
        <InviteDoors />

        <span className="invite-front" aria-hidden={phase !== "closed"}>
          <span className="invite-front-ornament invite-front-ornament--top" />
          <span className="invite-front-eyebrow">Vocês estão convidados</span>
          <span className="invite-front-names">Eduardo & Lavínia</span>
          <span className="invite-front-rule" />
          <span className="invite-front-lead">Nosso Casamento</span>
          <span className="invite-front-ornament invite-front-ornament--bottom" />
        </span>

        <span className="invite-seal" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wax-seal.png?v=2" alt="" className="invite-seal-img" />
        </span>
      </button>

      {phase === "closed" ? (
        <p className="invite-hint">Toque no selo para abrir o convite</p>
      ) : null}
    </div>
  );
}
