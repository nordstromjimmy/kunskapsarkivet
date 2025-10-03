"use client";

import { useEffect, useRef, useState } from "react";
import ConfirmLeaveModal from "./ConfirmLeaveModal";

type Props = { when: boolean };

/**
 * Guards against leaving the page when `when` is true.
 * - Custom modal for in-app <a> navigation.
 * - Native prompt for reload/close/back via beforeunload.
 */
export default function UnsavedChangesGuard({ when }: Props) {
  const [open, setOpen] = useState(false);
  const nextHrefRef = useRef<string | null>(null);
  const bypassRef = useRef(false); // set to true when we intentionally navigate

  // 1) Native prompt on reload/close/back
  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!bypassRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  // 2) Intercept clicks on <a> links for custom modal
  useEffect(() => {
    if (!when) return;

    const onClickCapture = (e: MouseEvent) => {
      if (bypassRef.current) return;

      // Only left clicks without modifiers
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const el = (e.target as Element)?.closest(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!el) return;

      // Ignore anchors that open in new tab or explicitly bypass
      if (
        el.target === "_blank" ||
        el.hasAttribute("download") ||
        el.dataset.bypass === "true"
      )
        return;

      const href = el.href;
      // Skip same-page hash changes and same URL
      if (!href || href === window.location.href || href.startsWith("#"))
        return;

      // At this point, prevent navigation and show modal
      e.preventDefault();
      e.stopPropagation();
      nextHrefRef.current = href;
      setOpen(true);
    };

    // Use capture so we run before Next.js Link handler
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [when]);

  const confirmLeave = () => {
    bypassRef.current = true;
    const href = nextHrefRef.current;
    if (href) window.location.href = href;
    else window.history.back(); // fallback
  };

  const cancelLeave = () => {
    nextHrefRef.current = null;
    setOpen(false);
  };

  return (
    <ConfirmLeaveModal
      open={open}
      onConfirm={confirmLeave}
      onCancel={cancelLeave}
    />
  );
}
