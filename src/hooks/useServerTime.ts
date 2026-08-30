"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LaunchCountdownState } from "@/lib/types";

interface UseServerTimeOptions {
  targetTimestamp?: string | number | null;
  onZero?: () => void;
  freeze?: boolean;
}

export function useServerTime({ targetTimestamp, onZero, freeze = false }: UseServerTimeOptions = {}) {
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const onZeroTriggered = useRef<boolean>(false);

  // Sync server time offset on mount
  useEffect(() => {
    let isMounted = true;
    async function syncTime() {
      try {
        const start = performance.now();
        const res = await fetch("/api/time", { cache: "no-store" });
        if (res.ok && isMounted) {
          const data = await res.json();
          const latency = (performance.now() - start) / 2;
          const trueServerTime = data.serverTime + latency;
          const offset = trueServerTime - Date.now();
          setServerOffset(offset);
          setIsSynced(true);
        }
      } catch (e) {
        // If offline, default to 0 offset gracefully
        if (isMounted) setIsSynced(true);
      }
    }
    syncTime();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live ticking every second
  useEffect(() => {
    if (freeze) return;

    const interval = setInterval(() => {
      setNow(Date.now() + serverOffset);
    }, 1000);

    return () => clearInterval(interval);
  }, [serverOffset, freeze]);

  // Compute countdown against target
  const countdown: LaunchCountdownState = useCallback(() => {
    if (!targetTimestamp) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
        totalSeconds: 0,
        isExpired: true,
      };
    }

    const target =
      typeof targetTimestamp === "number"
        ? targetTimestamp
        : new Date(targetTimestamp).getTime();

    const current = freeze ? now : Date.now() + serverOffset;
    const diffMs = target - current;

    if (isNaN(diffMs) || diffMs <= 0) {
      if (!onZeroTriggered.current && onZero) {
        onZeroTriggered.current = true;
        onZero();
      }
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
        totalSeconds: 0,
        isExpired: true,
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return {
      days: String(d).padStart(2, "0"),
      hours: String(h).padStart(2, "0"),
      minutes: String(m).padStart(2, "0"),
      seconds: String(s).padStart(2, "0"),
      totalSeconds,
      isExpired: false,
    };
  }, [targetTimestamp, serverOffset, now, freeze, onZero])();

  return {
    now,
    serverOffset,
    isSynced,
    countdown,
  };
}
