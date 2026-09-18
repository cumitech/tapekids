"use client";

import { useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import { apiErrorMessage, apiUpload } from "@/lib/client/api";
import { eventImageSrc } from "@/lib/uploads/event-image";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  endpoint?: string;
};

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  endpoint = "/uploads/events",
}: ImageUploadProps) {
  const translate = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = eventImageSrc(value);

  async function onFile(file: File | undefined) {
    if (!file || disabled || busy) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const uploaded = await apiUpload<{ url: string }>(endpoint, file);
      onChange(uploaded.url);
    } catch (cause) {
      setError(apiErrorMessage(cause, translate("uploads.failed")));
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        disabled={disabled || busy}
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed bg-muted/40",
          preview ? "border-border" : "border-muted-foreground/30"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-40 w-full object-cover" />
        ) : (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            {busy ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <ImagePlus className="size-6" />
            )}
            <span>
              {busy ? translate("uploads.uploading") : translate("uploads.choose")}
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? translate("uploads.change") : translate("uploads.choose")}
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || busy}
            onClick={() => onChange("")}
          >
            <Trash2 className="size-4" />
            {translate("uploads.remove")}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
