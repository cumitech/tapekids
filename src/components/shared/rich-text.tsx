import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize-html";

export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = sanitizeRichText(html);
  if (!clean) {
    return null;
  }

  return (
    <div
      className={cn(
        "max-w-none text-foreground [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_blockquote]:border-l-2 [&_blockquote]:border-secondary [&_blockquote]:pl-4 [&_blockquote]:italic [&_p]:mb-3 [&_p]:font-serif [&_p]:text-base [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline",
        className
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
