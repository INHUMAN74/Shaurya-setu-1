import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Shaurya Setu</h1>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              Supporting Veterans in Reintegration
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Shaurya Setu bridges the gap between veterans and their support network, providing structured
              reintegration plans across Employment, Family, and Wellbeing.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Get started
              </Link>
            </div>
          </div>
          <div className="mt-24">
            <h3 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">How it works</h3>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">1</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Create Profile</h4>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Veterans register and create their profile with service details.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">2</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Get Assigned</h4>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  A counsellor creates your reintegration case with three stages.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">3</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Track Progress</h4>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Monitor your progress through Employment, Family, and Wellbeing stages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
