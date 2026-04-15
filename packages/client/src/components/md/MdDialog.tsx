import { useEffect, useRef, type ReactNode } from "react";

export type MdDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
  quick?: boolean;
};

/**
 * Controlled `md-dialog`: close on scrim / Escape via `closed` and `cancel` events.
 */
export function MdDialog({
  open,
  onOpenChange,
  children,
  className,
  quick,
}: MdDialogProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const end = () => {
      onOpenChange?.(false);
    };
    el.addEventListener("closed", end);
    el.addEventListener("cancel", end);
    return () => {
      el.removeEventListener("closed", end);
      el.removeEventListener("cancel", end);
    };
  }, [onOpenChange]);

  return (
    <md-dialog ref={ref} open={open} className={className} quick={quick}>
      {children}
    </md-dialog>
  );
}
