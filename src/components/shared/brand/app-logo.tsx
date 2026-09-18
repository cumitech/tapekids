import { APP_NAME } from "@/constants/brand";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  showWordmark?: boolean;
  title?: string;
};

function LogoMarkGraphic() {
  return (
    <>
      <rect
        x="3.5"
        y="3.5"
        width="89"
        height="89"
        rx="26"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        fill="#f59f21"
        d="M48 13.5l2.1 6.4 6.7.2-5.3 4.1 1.9 6.4L48 26.7l-5.4 3.9 1.9-6.4-5.3-4.1 6.7-.2z"
      />
      <circle cx="30" cy="33" r="7.2" fill="currentColor" />
      <path
        fill="currentColor"
        d="M21.5 42.5c2.4-1.2 6.2-1 8.5.6 2.1-1.4 6.2-1.8 8.8-.2-1.2 8.6-3.4 14.8-8.7 20.4-5.2-5.4-8-11.8-8.6-20.8Z"
      />
      <path
        fill="currentColor"
        d="M26.2 62.2c-.8 6.4-2.6 11.2-5.2 14.3h7.4c1.4-4.2 2-8.6 2.1-13.2-1.6.2-3 .1-4.3-1.1Z"
      />
      <path
        fill="currentColor"
        d="M37.4 61.4c.8 5.2 1.2 9.6.4 14.1h7.2c-2.2-3.4-3.8-8.2-4.6-14.6-1.2.4-2.2.6-3 .5Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.2"
        d="M23 41.5c-6.5-7.2-11.2-5.6-14 2"
      />
      <circle cx="64.5" cy="25.5" r="3.1" fill="currentColor" />
      <circle cx="71.2" cy="30.2" r="3.4" fill="currentColor" />
      <circle cx="66" cy="34.5" r="7.4" fill="currentColor" />
      <path
        fill="currentColor"
        d="M56.8 44.2c2.8-2 7.4-2.6 10.4-.4 2.6-1.4 6.8-1.2 9.2.8-.2 8.2-2.6 15-8.2 21.2-6.2-5.6-10-12.4-11.4-21.6Z"
      />
      <path
        fill="currentColor"
        d="M62.4 64c.4 5.6.2 10.2-1.4 14.2h7.6c1.6-4 2.6-8.6 2.8-14.4-3 .6-5.8.6-9 0Z"
      />
      <path
        fill="currentColor"
        d="M73.2 64.8c1.2 5.4 3.2 9.8 6.4 13.4h-7.2c-.8-4.2-1.4-8.6-1.6-13.2 1 .2 1.7.1 2.4-.2Z"
      />
      <rect
        x="37"
        y="47"
        width="22"
        height="18"
        rx="3"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path stroke="currentColor" strokeWidth="2.2" d="M37 53.2h22" />
      <rect x="41.2" y="43.6" width="2.4" height="6.2" rx="1" fill="currentColor" />
      <rect x="52.4" y="43.6" width="2.4" height="6.2" rx="1" fill="currentColor" />
      <rect x="40.6" y="56.4" width="3.6" height="3.6" rx="0.7" fill="currentColor" />
      <rect x="46.2" y="56.4" width="3.6" height="3.6" rx="0.7" fill="#f59f21" />
      <rect x="51.8" y="56.4" width="3.6" height="3.6" rx="0.7" fill="currentColor" />
    </>
  );
}

export function AppLogo({
  className,
  showWordmark = true,
  title = APP_NAME,
}: AppLogoProps) {
  if (!showWordmark) {
    return (
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
        className={cn("size-9 text-foreground", className)}
      >
        <title>{title}</title>
        <LogoMarkGraphic />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 430 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("h-10 w-auto text-foreground", className)}
    >
      <title>{title}</title>
      <g>
        <LogoMarkGraphic />
      </g>
      <text
        x="112"
        y="34"
        fill="currentColor"
        className="font-serif"
        fontSize="22"
        fontWeight="600"
      >
        Kids
      </text>
      <text
        x="112"
        y="68"
        fill="currentColor"
        className="font-sans"
        fontSize="34"
        fontWeight="800"
        letterSpacing="-0.04em"
      >
        Events
      </text>
      <text
        x="112"
        y="88"
        fill="currentColor"
        fillOpacity="0.78"
        className="font-sans"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.32em"
      >
        CAMEROON
      </text>
    </svg>
  );
}

export function AppLogoMark({ className }: { className?: string }) {
  return <AppLogo showWordmark={false} className={className} />;
}
