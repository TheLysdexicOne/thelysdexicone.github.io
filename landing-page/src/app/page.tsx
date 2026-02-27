import Image from 'next/image';

const projects = [
  {
    id: 'ball-x-pit',
    name: 'Ball X Pit',
    description: 'Progression tracker and encyclopedia for the game BALL X PIT',
    href: '/ball-x-pit/',
    image: '/images/ball-x-pit.svg',
    isPinned: true,
    comingSoon: true,
  },
  {
    id: 'icarus',
    name: 'Icarus',
    description: 'Survival companion and resource guide for Icarus',
    href: '/icarus/',
    image: '/images/icarus.svg',
    isPinned: true,
    comingSoon: true,
  },
  {
    id: 'blue-prince',
    name: 'Blue Prince',
    description: 'Strategy guide and companion for Blue Prince',
    href: '/blue-prince/',
    image: '/images/blue-prince.svg',
    isPinned: false,
    comingSoon: true,
  },
  {
    id: 'factorio',
    name: 'Factorio',
    description: 'Factory optimization and blueprint library',
    href: '/factorio/',
    image: '/images/factorio.svg',
    isPinned: false,
    comingSoon: true,
  },
  {
    id: 'kingdom-come-deliverance-ii',
    name: 'Kingdom Come: Deliverance II',
    description: 'Quest guide and character progression tracker',
    href: '/kingdom-come-deliverance-ii/',
    image: '/images/kingdom-come-deliverance-ii.svg',
    isPinned: false,
    comingSoon: true,
  },
  {
    id: 'satisfactory',
    name: 'Satisfactory',
    description: 'Factory planning and resource calculator',
    href: '/satisfactory/',
    image: '/images/satisfactory.svg',
    isPinned: false,
    comingSoon: true,
  },
  {
    id: 'widget-inc',
    name: 'Widget Inc.',
    description: 'Production optimization and strategy guide',
    href: '/widget-inc/',
    image: '/images/widget-inc.svg',
    isPinned: false,
    comingSoon: true,
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
            <a
              key={project.id}
              href={project.href}
              className="group relative rounded-lg border-2 border-primary bg-card p-6 transition-all hover:border-secondary hover:bg-hover"
            >
              {/* Pin Badge */}
              {project.isPinned && (
                <div className="bg-accent text-main absolute right-4 top-4 -mx-2 -my-2 rounded-full px-0 py-0 text-xs font-bold">
                  📌
                </div>
              )}

              {/* Project Image */}
              <div className="mb-4 flex justify-center">
                <Image
                  src={project.image}
                  alt={project.name}
                  width={200}
                  height={150}
                  className="rounded opacity-90 transition-opacity group-hover:opacity-100"
                />
              </div>

              {/* Project Info */}
              <h2 className="font-pixel text-xl tracking-widest text-primary group-hover:text-secondary">
                {project.name}
              </h2>
              <p className="mt-2 text-sm text-secondary">
                {project.description}
              </p>

              {/* Coming Soon Badge */}
              {project.comingSoon ? (
                <div className="text-main mt-4 inline-block rounded bg-secondary px-4 py-2 text-sm font-bold opacity-70">
                  Coming Soon
                </div>
              ) : (
                <div className="mt-4 inline-block rounded bg-btn-primary px-4 py-2 text-sm text-primary transition-colors group-hover:bg-btn-primary-highlight">
                  Visit →
                </div>
              )}
            </a>
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
