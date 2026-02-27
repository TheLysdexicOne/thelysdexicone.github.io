import Link from 'next/link';

const projects = [
  {
    id: 'ball-x-pit-companion',
    name: 'BALL X PIT Companion',
    description:
      'Progression tracker and encyclopedia for the game BALL X PIT',
    href: '/ball-x-pit-companion/',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-main p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="font-pixel text-4xl tracking-widest text-primary sm:text-5xl">
            TheLysdexicOne
          </h1>
          <p className="mt-2 text-lg text-secondary">Gaming Companion Sites</p>
        </header>

        {/* Projects Grid */}
        <main className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Link
              key={project.id}
              href={project.href}
              className="group rounded-lg border-2 border-primary bg-card p-6 transition-all hover:border-secondary hover:bg-hover"
            >
              <h2 className="font-pixel text-2xl tracking-widest text-primary group-hover:text-secondary">
                {project.name}
              </h2>
              <p className="mt-2 text-secondary">{project.description}</p>
              <div className="mt-4 inline-block rounded bg-btn-primary px-4 py-2 text-sm text-primary transition-colors group-hover:bg-btn-primary-highlight">
                Visit →
              </div>
            </Link>
          ))}
        </main>

        {/* About */}
        <section className="mt-12 rounded-lg border-2 border-primary bg-card p-6">
          <h2 className="font-pixel text-2xl tracking-widest text-primary">
            About
          </h2>
          <p className="mt-4 text-secondary">
            These are fan-made companion sites for games I enjoy. They provide
            helpful tools, progression tracking, and detailed game information.
          </p>
        </section>
      </div>
    </div>
  );
}
