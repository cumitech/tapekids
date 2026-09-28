import { APP_LOGO_SRC, APP_NAME } from "@/constants/brand";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  showWordmark?: boolean;
  title?: string;
};

export function AppLogo({
  className,
  showWordmark = true,
  title = APP_NAME,
}: AppLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={APP_LOGO_SRC}
      alt={title}
      className={cn(
        "object-contain object-left",
        showWordmark ? "h-10 w-auto" : "size-9",
        className
      )}
    />
  );
}

export function AppLogoMark({ className }: { className?: string }) {
  return <AppLogo showWordmark={false} className={className} />;
}
