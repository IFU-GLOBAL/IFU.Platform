import Link from "next/link";
import { ArrowLeft, Clock3, KeyRound } from "lucide-react";

type AuthPlaceholderPageProps = {
  title: string;
  route: string;
  description: string;
  nextStep: string;
};

export function AuthPlaceholderPage({
  title,
  route,
  description,
  nextStep,
}: AuthPlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-[#f6f8f4] text-[#18231d]">
      <section className="border-b border-[#dce4d7] bg-[#102f24] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Discovery center
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b9d66c]">
                Milestone 5 prep
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                {description}
              </p>
            </div>

            <div className="rounded-md border border-white/15 bg-white/10 p-5">
              <Clock3 className="h-5 w-5 text-[#b9d66c]" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/65">
                Status
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">Coming soon</p>
              <p className="mt-4 font-mono text-sm text-white/70">{route}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="rounded-md border border-[#d7e2d1] bg-[#f9fbf6] p-6">
            <KeyRound className="h-5 w-5 text-[#357244]" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-[#16241c]">
              Authentication wiring is pending Cognito setup.
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-[#536157]">{nextStep}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
