import { Tent } from "lucide-react";

import { eventImageSrc } from "@/lib/uploads/event-image";
import { cn } from "@/lib/utils";

type EventImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export function EventImage({ src, alt, className }: EventImageProps) {
  const resolved = eventImageSrc(src);

  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted", className)}>
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#182356] to-[#466d6b] text-white/80">
          <Tent className="size-10" />
        </div>
      )}
    </div>
  );
}
