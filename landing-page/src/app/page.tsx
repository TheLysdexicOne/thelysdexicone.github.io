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
    image: '/images/T_ITEM_Supporters_Logo_2.png',
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
    <div className="app-shell">
      <div className="app-container max-w-5xl">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h1 className="font-pixel text-2xl leading-snug tracking-wide text-primary sm:text-4xl sm:tracking-widest lg:text-5xl">
            TheLysdexicOne
          </h1>
          <p className="mt-3 text-base text-secondary sm:text-lg">
            Gaming Companion Sites
          </p>
        </header>

        {/* Projects Grid */}
        <main className="project-grid">
          {projects.map(project => (
            <a
              key={project.id}
              href={project.href}
              className="group relative flex h-full min-h-80 flex-col rounded-lg border-2 border-primary bg-card p-4 transition-all hover:border-secondary hover:bg-hover sm:p-6"
            >
              {/* Pin Badge */}
              {project.isPinned && (
                <div className="absolute right-4 top-4 rounded-full bg-highlight px-2 py-1 text-xs font-bold text-primary">
                  📌
                </div>
              )}

              {/* Project Image */}
              <div className="mb-4 flex justify-center">
                <Image
                  src={project.image}
                  alt={project.name}
                  width={192}
                  height={192}
                  className="h-36 w-36 rounded bg-nav object-contain opacity-90 transition-opacity group-hover:opacity-100 sm:h-44 sm:w-44"
                />
              </div>

              {/* Project Info */}
              <h2 className="text-balance text-center font-pixel text-lg leading-snug tracking-wide text-primary group-hover:text-secondary sm:text-xl sm:tracking-widest lg:text-2xl">
                {project.name}
              </h2>
              {/* <p className="mt-2 text-sm text-secondary">
                {project.description}
              </p> */}

              {/* Coming Soon Badge */}
              {project.comingSoon ? (
                <div className="text-main mt-4 inline-block rounded bg-secondary px-4 py-2 text-center text-sm font-bold opacity-70">
                  Coming Soon
                </div>
              ) : (
                <div className="mt-4 inline-block rounded bg-btn-primary px-4 py-2 text-center text-sm text-primary transition-colors group-hover:bg-btn-primary-highlight">
                  Visit →
                </div>
              )}
            </a>
          ))}
        </main>

        {/* About */}
        <section className="app-section rounded-lg border-2 border-primary bg-card p-4 sm:p-6">
          <h2 className="font-pixel text-xl tracking-widest text-primary sm:text-2xl">
            About
          </h2>
          <p className="mt-3 text-sm text-secondary sm:mt-4 sm:text-base">
            These are fan-made companion sites for games I enjoy. They provide
            helpful tools, progression tracking, and detailed game information.
          </p>
        </section>
      </div>
    </div>
  );
}
