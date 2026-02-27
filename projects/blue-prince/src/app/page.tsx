export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-accent">Blue Prince</h1>
        <div className="text-2xl text-secondary">
          <p>Coming Soon</p>
        </div>
        <p className="text-lg text-gray-400 max-w-2xl">
          This companion site is currently under development. Stay tuned for
          tools and resources to enhance your Blue Prince experience.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-accent text-main rounded-lg hover:bg-accent-dark transition-colors"
        >
          Back to Projects
        </a>
      </div>
    </main>
  );
}
