import Link from "next/link";

const STATS = [
  { value: "520+", label: "Veterans supported (demo)" },
  { value: "180+", label: "Employer partners" },
  { value: "3", label: "Focus areas: work, family, wellbeing" },
];

const ROLES = [
  {
    title: "Veteran",
    description:
      "Create your profile, follow your reintegration plan, and track tasks across employment, family, and wellbeing with your counsellor.",
    href: "/signup",
  },
  {
    title: "Counsellor",
    description:
      "Manage cases, add stages and tasks, and coordinate with employers so every veteran has a clear path forward.",
    href: "/signup",
  },
  {
    title: "Employer",
    description:
      "See tasks assigned to your organisation and mark them complete when you have finished your part of the journey.",
    href: "/signup",
  },
];

const RESOURCES = [
  { name: "Kiran Mental Health Helpline", detail: "9152987821", href: "tel:9152987821" },
  { name: "PM-SYM (Ex-servicemen welfare)", detail: "Government schemes portal", href: "https://www.mygov.in/" },
  { name: "Rally for Rivers / CSR partners", detail: "Explore hiring programmes", href: "/login" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white shadow-sm">
              SS
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Shaurya Setu</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/resources"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Resources
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-amber-50/80 via-white to-zinc-50 dark:border-zinc-800 dark:from-amber-950/30 dark:via-zinc-950 dark:to-zinc-950">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-600/10" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Veteran reintegration platform
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
                Supporting veterans back into civilian life
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Shaurya Setu connects veterans, counsellors, and employers in one structured journey—employment,
                family, and wellbeing—so no one navigates transition alone.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="rounded-xl bg-zinc-900 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none dark:hover:bg-zinc-200"
                >
                  Get started
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl border border-zinc-300 bg-white/80 px-8 py-3.5 text-base font-semibold text-zinc-900 backdrop-blur hover:bg-white dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{s.value}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Who it&apos;s for</h3>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
            Each role sees a tailored dashboard—sign up and your experience matches your responsibilities.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ROLES.map((role) => (
              <div
                key={role.title}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{role.title}</h4>
                <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{role.description}</p>
                <Link
                  href={role.href}
                  className="mt-6 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Join as {role.title.toLowerCase()} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-100/50 py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">How it works</h3>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Create profile",
                  text: "Veterans register and add service details; admins can verify records.",
                },
                {
                  step: "2",
                  title: "Get your plan",
                  text: "A counsellor opens a case with Employment, Family, and Wellbeing stages.",
                },
                {
                  step: "3",
                  title: "Track together",
                  text: "Tasks flow to employers and back—everyone sees progress in one place.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-md">
                    {item.step}
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Resources & helplines</h3>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
            Quick links for awareness and support (demo content for your presentation).
          </p>
          <ul className="mx-auto mt-10 max-w-2xl divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {RESOURCES.map((r) => (
              <li key={r.name}>
                <a
                  href={r.href}
                  className="flex flex-col gap-0.5 px-5 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{r.name}</span>
                  <span className="text-sm text-amber-700 dark:text-amber-400">{r.detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Shaurya Setu — bridging service and civilian life.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/resources" className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300">
              Full resources page
            </Link>
            <Link href="/login" className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300">
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
