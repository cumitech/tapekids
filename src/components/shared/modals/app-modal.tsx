"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslate } from "@refinedev/core";
import { XIcon } from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { cn } from "@/lib/utils";

type ModalContent = {
  title: string;
  description?: string;
  body: ReactNode;
  className?: string;
};

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

type AppModalContextValue = {
  openModal: (content: ModalContent) => void;
  closeModal: () => void;
  confirm: (options: ConfirmOptions) => void;
};

const AppModalContext = createContext<AppModalContextValue | null>(null);
const ModalFrameContext = createContext(false);

export function ModalActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const inModal = useContext(ModalFrameContext);
  if (inModal) {
    return <DialogFooter className={className}>{children}</DialogFooter>;
  }
  return <div className={className}>{children}</div>;
}

export function AppModalProvider({ children }: { children: ReactNode }) {
  const translate = useTranslate();
  const [content, setContent] = useState<ModalContent | null>(null);
  const [confirming, setConfirming] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const confirmingRef = useRef<ConfirmOptions | null>(null);
  confirmingRef.current = confirming;

  const closeModal = useCallback(() => {
    setBusy(false);
    setConfirming(null);
    setContent(null);
  }, []);

  const openModal = useCallback((next: ModalContent) => {
    setBusy(false);
    setConfirming(null);
    setContent(next);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setBusy(false);
    setConfirming(options);
    setContent({
      title: options.title,
      description: options.description,
      className: "sm:max-w-md",
      body: null,
    });
  }, []);

  const runConfirm = useCallback(async () => {
    const options = confirmingRef.current;
    if (!options) {
      return;
    }
    setBusy(true);
    try {
      await options.onConfirm();
      closeModal();
    } catch {
      setBusy(false);
    }
  }, [closeModal]);

  const value = useMemo(
    () => ({ openModal, closeModal, confirm }),
    [openModal, closeModal, confirm]
  );

  return (
    <AppModalContext.Provider value={value}>
      {children}
      <Dialog open={Boolean(content)} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "flex max-h-[min(90dvh,40rem)] w-auto flex-col overflow-hidden sm:max-w-2xl",
            content?.className
          )}
        >
          <DialogHeader className="pr-12 sm:pr-10">
            <DialogTitle>{content?.title}</DialogTitle>
            {content?.description ? (
              <DialogDescription>{content.description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">
                {content?.title}
              </DialogDescription>
            )}
          </DialogHeader>
          <button
            type="button"
            className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 sm:top-4 sm:right-4 sm:size-8"
            onClick={closeModal}
            aria-label={translate("actions.cancel")}
            disabled={busy}
          >
            <XIcon className="size-4" />
          </button>
          <ModalFrameContext.Provider value>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
              {content?.body}
            </div>
            {confirming ? (
              <DialogFooter className="shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={busy}
                >
                  {confirming.cancelLabel ?? translate("actions.cancel")}
                </Button>
                <Button
                  type="button"
                  variant={confirming.destructive ? "destructive" : "default"}
                  disabled={busy}
                  onClick={() => void runConfirm()}
                >
                  {confirming.confirmLabel ?? translate("actions.delete")}
                </Button>
              </DialogFooter>
            ) : null}
          </ModalFrameContext.Provider>
        </DialogContent>
      </Dialog>
    </AppModalContext.Provider>
  );
}

export function useAppModal() {
  const context = useContext(AppModalContext);
  if (!context) {
    throw new Error("useAppModal must be used within AppModalProvider");
  }
  return context;
}
