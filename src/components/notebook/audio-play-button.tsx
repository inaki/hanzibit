"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, Loader2, Lock } from "lucide-react";

interface AudioPlayButtonProps {
  text: string;
  type?: "word" | "sentence" | "dynamic";
  size?: "sm" | "md";
  className?: string;
}

type AudioState = "idle" | "loading" | "playing" | "locked";

export function AudioPlayButton({
  text,
  type = "word",
  size = "sm",
  className = "",
}: AudioPlayButtonProps) {
  const [state, setState] = useState<AudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const play = useCallback(async () => {
    if (state === "locked") return;

    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");

    try {
      const res = await fetch(
        `/api/tts?text=${encodeURIComponent(text)}&type=${type}`
      );

      if (res.status === 401 || res.status === 403) {
        setState("locked");
        return;
      }

      if (!res.ok) {
        setState("idle");
        return;
      }

      // Revoke previous blob URL before creating a new one
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      blobUrlRef.current = objectUrl;

      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = objectUrl;

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        blobUrlRef.current = null;
        setState("idle");
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        blobUrlRef.current = null;
        setState("idle");
      };

      setState("playing");
      audio.play().catch(() => setState("idle"));
    } catch {
      setState("idle");
    }
  }, [text, type, state]);

  const iconSize = size === "sm" ? 14 : 16;
  const btnSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  if (state === "locked") {
    return (
      <span
        title="Pro required"
        className={`inline-flex items-center justify-center rounded-full text-muted-foreground/40 ${btnSize} ${className}`}
      >
        <Lock size={iconSize} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Play pronunciation of ${text}`}
      className={`inline-flex items-center justify-center rounded-full transition-colors
        text-muted-foreground hover:text-foreground hover:bg-muted
        ${btnSize} ${className}`}
    >
      {state === "loading" ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Volume2 size={iconSize} className={state === "playing" ? "text-primary" : ""} />
      )}
    </button>
  );
}
