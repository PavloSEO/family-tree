import { useEffect, useRef, type ReactNode } from "react";

export type MdDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
  quick?: boolean;
};

/**
 * Управляемый `md-dialog`: закрытие по scrim / Escape через события `closed` и `cancel`.
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
