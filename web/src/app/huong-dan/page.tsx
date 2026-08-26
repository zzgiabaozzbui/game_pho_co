"use client";

import Link from "next/link";
import {
  Coins,
  HelpCircle,
  MapPin,
  RotateCcw,
  Store,
  Trophy,
  WifiOff,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

const STEPS = [
  { n: 1, title: "guide.s1_go", desc: "guide.s1_go_desc" },
  { n: 2, title: "guide.s1_checkin", desc: "guide.s1_checkin_desc" },
  { n: 3, title: "guide.s1_solve", desc: "guide.s1_solve_desc" },
  { n: 4, title: "guide.s1_chest", desc: "guide.s1_chest_desc" },
] as const;

const FAQS = [
  ["guide.faq_q1", "guide.faq_a1"],
  ["guide.faq_q2", "guide.faq_a2"],
  ["guide.faq_q3", "guide.faq_a3"],
  ["guide.faq_q4", "guide.faq_a4"],
] as const;

function SectionHeading({
  id,
  icon,
  label,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream ring-1 ring-line"
      >
        {icon}
      </span>
      <h2 id={id} className="font-display text-xl font-semibold text-ink-strong">
        {label}
      </h2>
    </div>
  );
}

export default function HuongDanPage() {
  const { t, toggle } = useLang();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8 pb-[calc(2rem_+_env(safe-area-inset-bottom))]">
      <button
        onClick={toggle}
        className="self-end rounded-full border border-line bg-cream px-3 py-1 text-sm font-medium hover:bg-gold-soft"
      >
        {t("lang.switch")}
      </button>

      <header className="mt-6">
        <h1 className="font-display text-3xl font-black leading-tight text-ink-strong">
          {t("guide.title")}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">
          {t("guide.subtitle")}
        </p>
        <div className="mt-4 flex justify-end">
          <Link
            href="/play"
            className="btn-primary px-5 py-2.5 text-sm active:scale-[0.99]"
          >
            {t("guide.start_cta")}
          </Link>
        </div>
      </header>

      <div className="lattice-divider mt-9" role="presentation" />

      <section aria-labelledby="gd-s1" className="mt-8">
        <SectionHeading
          id="gd-s1"
          icon={
            <MapPin className="h-5 w-5 text-clay-deep" strokeWidth={2} />
          }
          label={t("guide.s1_title")}
        />
        <ol className="mt-4 space-y-4">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-soft font-display text-sm font-bold text-timber"
              >
                {step.n}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{t(step.title)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                  {t(step.desc)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="lattice-divider my-8" role="presentation" />

      <section aria-labelledby="gd-s2" className="mt-8">
        <SectionHeading
          id="gd-s2"
          icon={<Coins className="h-5 w-5 text-clay-deep" strokeWidth={2} />}
          label={t("guide.s2_title")}
        />
        <p className="mt-3 text-sm leading-relaxed text-ink/90">
          {t("guide.s2_desc")}
        </p>
      </section>

      <div className="lattice-divider my-8" role="presentation" />

      <section aria-labelledby="gd-s3" className="mt-8">
        <SectionHeading
          id="gd-s3"
          icon={<Trophy className="h-5 w-5 text-clay-deep" strokeWidth={2} />}
          label={t("guide.s3_title")}
        />
        <p className="mt-3 text-sm leading-relaxed text-ink/90">
          {t("guide.s3_desc_1")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/90">
          {t("guide.s3_desc_2")}
        </p>
      </section>

      <div className="lattice-divider my-8" role="presentation" />

      <section aria-labelledby="gd-s4" className="mt-8">
        <SectionHeading
          id="gd-s4"
          icon={<Store className="h-5 w-5 text-clay-deep" strokeWidth={2} />}
          label={t("guide.s4_title")}
        />
        <p className="mt-3 text-sm leading-relaxed text-ink/90">
          {t("guide.s4_desc")}
        </p>
      </section>

      <div className="lattice-divider my-8" role="presentation" />

      <section aria-labelledby="gd-s5" className="mt-8">
        <SectionHeading
          id="gd-s5"
          icon={
            <RotateCcw className="h-5 w-5 text-clay-deep" strokeWidth={2} />
          }
          label={t("guide.s5_title")}
        />
        <p className="mt-3 text-sm leading-relaxed text-ink/90">
          {t("guide.s5_desc")}
        </p>
      </section>

      <div className="lattice-divider my-8" role="presentation" />

      <section aria-labelledby="gd-s6" className="mt-8">
        <SectionHeading
          id="gd-s6"
          icon={<WifiOff className="h-5 w-5 text-clay-deep" strokeWidth={2} />}
          label={t("guide.s6_title")}
        />
        <p className="mt-3 text-sm leading-relaxed text-ink/90">
          {t("guide.s6_desc")}
        </p>
      </section>

      <div className="lattice-divider my-8" role="presentation" />

      <section aria-labelledby="gd-faq" className="mt-8">
        <SectionHeading
          id="gd-faq"
          icon={
            <HelpCircle className="h-5 w-5 text-clay-deep" strokeWidth={2} />
          }
          label={t("guide.faq_title")}
        />
        <div className="mt-4 space-y-2.5">
          {FAQS.map(([q, a]) => (
            <details
              key={q}
              className="rounded-xl bg-cream px-4 py-3 ring-1 ring-line"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {t(q)}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t(a)}
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-auto flex justify-center pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 self-center rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold-soft"
        >
          {t("guide.back_home")}
        </Link>
      </div>
    </main>
  );
}
