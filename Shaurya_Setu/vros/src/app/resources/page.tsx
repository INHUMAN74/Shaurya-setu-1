import Link from "next/link";

const SECTIONS = [
  {
    title: "Mental health & crisis",
    items: [
      {
        name: "Kiran Mental Health Helpline",
        detail: "9152987821 · 24×7 tele-mental health support",
        href: "tel:9152987821",
      },
      {
        name: "Vandrevala Foundation",
        detail: "Crisis helpline — search current national numbers for your region.",
        href: "https://www.google.com/search?q=vandrevala+foundation+helpline",
      },
    ],
  },
  {
    title: "Employment & skills",
    items: [
      {
        name: "National Career Service (India)",
        detail: "Job matching, career guidance, skill courses.",
        href: "https://www.ncs.gov.in/",
      },
      {
        name: "Skill India / NSDC",
        detail: "Training and certification pathways.",
        href: "https://www.skillindia.gov.in/",
      },
    ],
  },
  {
    title: "Veterans & ex-servicemen welfare",
    items: [
      {
        name: "Indian Army — Veterans",
        detail: "Official information and welfare pointers.",
        href: "https://indianarmy.nic.in/",
      },
      {
        name: "MyGov — schemes & updates",
        detail: "Central government programmes (verify eligibility locally).",
        href: "https://www.mygov.in/",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white shadow-sm">
              SS
            </span>
            <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Shaurya Setu</span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Home
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Resources</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Curated pointers for awareness and support. Shaurya Setu does not endorse or operate these services—use official
          channels and local guidance for eligibility and emergencies. Suitable for demos and project documentation.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</h2>
              <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="block px-4 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.detail}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500 dark:text-zinc-400 sm:px-6 lg:px-8">
          <Link href="/" className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
            ← Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
