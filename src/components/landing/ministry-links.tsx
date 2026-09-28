"use client";

import { Caveat } from "next/font/google";
import { useTranslate } from "@refinedev/core";

import { cn } from "@/lib/utils";

const script = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const PARTNERS = [
  {
    href: "https://branham.org",
    labelKey: "landing.partners.vgr",
    art: "vgr",
  },
  {
    href: "https://branhamtabernacle.org",
    labelKey: "landing.partners.tabernacle",
    art: "tabernacle",
  },
  {
    href: "https://themessage.com",
    labelKey: "landing.partners.message",
    art: "message",
  },
] as const;

export function MinistryLinks() {
  const translate = useTranslate();

  return (
    <section className="bg-[#5e8d8b] px-4 py-8 md:px-6 md:py-10">
      <ul className="mx-auto grid w-full max-w-5xl list-none gap-8 sm:grid-cols-3 sm:gap-6">
        {PARTNERS.map((partner) => {
          const label = translate(partner.labelKey);
          return (
            <li key={partner.href}>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={translate("landing.partners.open", { name: label })}
                className="group flex flex-col items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#5e8d8b]"
              >
                <span className="block aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-[0_8px_20px_rgba(24,35,86,0.18)] transition duration-200 group-hover:-translate-y-0.5">
                  <PartnerArt kind={partner.art} />
                </span>
                <span className="text-center text-sm font-medium tracking-wide text-white">
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PartnerArt({ kind }: { kind: (typeof PARTNERS)[number]["art"] }) {
  if (kind === "vgr") return <VoiceOfGodArt />;
  if (kind === "tabernacle") return <TabernacleArt />;
  return <MessageArt />;
}

function VoiceOfGodArt() {
  return (
    <svg viewBox="0 0 360 220" className="size-full" aria-hidden>
      <defs>
        <linearGradient id="vgr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f1ee" />
          <stop offset="100%" stopColor="#c9c4bc" />
        </linearGradient>
        <linearGradient id="vgr-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9b5ae" />
          <stop offset="55%" stopColor="#8f8b84" />
          <stop offset="100%" stopColor="#6f6c67" />
        </linearGradient>
      </defs>
      <rect width="360" height="220" fill="url(#vgr-sky)" />
      <path
        d="M0 108c28-16 48-6 72-18 22-12 40 2 64-8 28-12 46 6 78-4 24-8 40 4 62-6 18-8 28 2 44-4 12-4 22 2 40-2v52H0Z"
        fill="#a39e96"
      />
      <path d="M18 102c8-18 16-18 24 0-8 2-16 2-24 0Z" fill="#6d6a64" />
      <path d="M34 96c10-22 18-20 28 4-10 2-18 2-28-4Z" fill="#5e5b56" />
      <path d="M292 90c9-20 18-18 26 6-8 2-16 2-26-6Z" fill="#6d6a64" />
      <rect x="128" y="92" width="148" height="26" fill="#e7e3dc" />
      <path d="M128 92h148l-8-8H136Z" fill="#d4cfc7" />
      <rect x="214" y="78" width="28" height="16" fill="#f4f1ec" />
      <rect x="146" y="58" width="5" height="36" fill="#4e4b47" />
      <path d="M148.5 44 154 58h-11Z" fill="#4e4b47" />
      <rect x="168" y="100" width="10" height="8" fill="#8a8680" />
      <rect x="186" y="100" width="10" height="8" fill="#8a8680" />
      <rect x="204" y="100" width="10" height="8" fill="#8a8680" />
      <path
        d="M0 146c70-16 120 8 190-2 48-8 90 6 170-8v84H0Z"
        fill="#7a766f"
      />
      <ellipse cx="148" cy="176" rx="128" ry="30" fill="url(#vgr-water)" />
      <ellipse cx="148" cy="170" rx="78" ry="8" fill="#ddd8d0" opacity="0.35" />
      <path d="M40 168c24 6 36 2 52-4" fill="none" stroke="#d8d3cb" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function TabernacleArt() {
  const courses = [88, 102, 116, 130, 144, 158, 172, 186];
  return (
    <svg viewBox="0 0 360 220" className="size-full" aria-hidden>
      <rect width="360" height="220" fill="#e8e4de" />
      <rect width="360" height="78" fill="#d9d4cc" />
      <path d="M0 26c120 18 240 8 360-8" fill="none" stroke="#8d8881" strokeWidth="1.2" />
      <path d="M0 40c120 16 240 6 360-10" fill="none" stroke="#8d8881" strokeWidth="1" />
      <rect x="248" y="18" width="3" height="62" fill="#7a756e" />
      <rect x="28" y="78" width="250" height="120" fill="#f6f3ee" />
      {courses.map((y) => (
        <line key={y} x1="28" x2="278" y1={y} y2={y} stroke="#e0dbd3" strokeWidth="1" />
      ))}
      <path d="M28 78 153 34l125 44Z" fill="#fbf9f6" stroke="#d5d0c8" />
      <text
        x="153"
        y="58"
        textAnchor="middle"
        fill="#5a564f"
        fontSize="8"
        letterSpacing="1.6"
        fontFamily="Inter, sans-serif"
      >
        BRANHAM
      </text>
      <text
        x="153"
        y="70"
        textAnchor="middle"
        fill="#5a564f"
        fontSize="7"
        letterSpacing="1.1"
        fontFamily="Inter, sans-serif"
      >
        TABERNACLE
      </text>
      <path d="M118 198V128c0-20 16-32 35-32s35 12 35 32v70Z" fill="#3c3936" />
      <rect x="146" y="146" width="14" height="52" fill="#2a2725" />
      <rect x="58" y="112" width="34" height="46" fill="#322f2c" />
      <rect x="64" y="118" width="22" height="34" fill="#1f1d1b" />
      <rect x="196" y="112" width="34" height="46" fill="#322f2c" />
      <rect x="202" y="118" width="22" height="34" fill="#1f1d1b" />
      <rect x="278" y="108" width="64" height="90" fill="#efebe5" />
      <line x1="278" x2="342" y1="126" y2="126" stroke="#e0dbd3" />
      <line x1="278" x2="342" y1="144" y2="144" stroke="#e0dbd3" />
      <line x1="278" x2="342" y1="162" y2="162" stroke="#e0dbd3" />
      <rect x="294" y="128" width="20" height="28" fill="#322f2c" />
      <rect x="28" y="196" width="314" height="24" fill="#cfc9c0" />
    </svg>
  );
}

function MessageArt() {
  return (
    <div className="flex size-full flex-col items-center justify-center bg-[#2c2c2c] px-4 text-center text-white">
      <p className={cn(script.className, "text-[1.85rem] leading-none sm:text-[2rem]")}>
        Jesus Christ
      </p>
      <p
        className={cn(
          script.className,
          "mt-1 text-[2rem] leading-none underline decoration-white decoration-2 underline-offset-[6px] sm:text-[2.15rem]"
        )}
      >
        The Same
      </p>
      <p className="mt-4 text-[0.62rem] font-semibold tracking-[0.28em]">
        HEBREWS 13:8
      </p>
    </div>
  );
}
