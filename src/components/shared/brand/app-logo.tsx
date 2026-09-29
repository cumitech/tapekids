import { APP_LOGO_SRC, APP_NAME } from "@/constants/brand";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  showWordmark?: boolean;
  title?: string;
  /** Sky bar and footer are teal. Keep the wood mark on a light plate so it stays readable. */
  onDark?: boolean;
};

export function AppLogo({
  className,
  showWordmark = true,
  title = APP_NAME,
  onDark = false,
}: AppLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={APP_LOGO_SRC}
      alt={title}
      className={cn(
        "object-contain object-center",
        showWordmark ? "h-10 w-auto" : "size-9",
        onDark && "rounded-md bg-[#f6f3ee]",
        className
      )}
    />
  );
}

export function AppLogoMark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return <AppLogo showWordmark={false} onDark={onDark} className={className} />;
}
