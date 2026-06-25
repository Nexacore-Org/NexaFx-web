import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f0e7] px-5 py-12">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#ffd552]/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#a0c3fd]/55 blur-3xl"
      />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_28px_90px_rgba(24,24,24,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-[#111] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#ffd552]">
            NexaFx
          </p>
          <div>
            <p className="max-w-sm text-4xl font-semibold leading-tight">
              Move money with clarity, not friction.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              Secure account access for every transfer, conversion, and payout.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Fast. Clear. Protected.
          </p>
        </div>

        <div className="p-7 sm:p-12 lg:p-14">
          <p className="mb-8 text-sm font-black uppercase tracking-[0.24em] text-[#9b6d00] lg:hidden">
            NexaFx
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="mt-7 text-center text-sm text-neutral-600">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export const inputClassName =
  "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-[#ffd552] disabled:bg-neutral-100";

export const buttonClassName =
  "flex w-full items-center justify-center rounded-xl bg-[#111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-[#ffd552] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
