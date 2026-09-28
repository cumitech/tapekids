"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

export function AppModalProvider({ children }: { children: ReactNode }) {
  const translate = useTranslate();
  const [content, setContent] = useState<ModalContent | null>(null);
  const [busy, setBusy] = useState(false);

  const closeModal = useCallback(() => {
    setBusy(false);
    setContent(null);
  }, []);

  const openModal = useCallback((next: ModalContent) => {
    setBusy(false);
    setContent(next);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      openModal({
        title: options.title,
        description: options.description,
        className: "sm:max-w-md",
        body: (
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={busy}>
              {options.cancelLabel ?? translate("actions.cancel")}
            </Button>
            <Button
              type="button"
              variant={options.destructive ? "destructive" : "default"}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await options.onConfirm();
                  closeModal();
                } catch {
                  setBusy(false);
                }
              }}
            >
              {options.confirmLabel ?? translate("actions.delete")}
            </Button>
          </DialogFooter>
        ),
      });
    },
    [closeModal, openModal, translate]
  );

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
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
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
          <div className="min-w-0 overflow-x-hidden overflow-y-auto">{content?.body}</div>
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
