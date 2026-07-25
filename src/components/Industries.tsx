const industries = [
  {
    name: "Defense & Security",
    description:
      "Specialized sealants and adhesives meeting stringent military specifications. Engineered for extreme conditions — temperature resistance, chemical exposure, and structural integrity.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: "Construction & Infrastructure",
    description:
      "Durable, weather-resistant bonding solutions for structural joints, curtain walls, flooring, and roofing. Formulated for long-term outdoor performance.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Aviation & Aerospace",
    description:
      "Lightweight, high-strength bonding solutions for airframe assembly, fuel tank sealing, and composite joining. Meets aerospace-grade performance standards.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    name: "Automotive & Transportation",
    description:
      "Vibration-dampening adhesives and flexible sealants for body panels, windshields, and engine components. Resistant to oils, fuels, and temperature cycling.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m-8 4h4m-2 8H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-3m-6 0v-4m0 4h6m-6 0H9" />
      </svg>
    ),
  },
  {
    name: "Furniture & Woodworking",
    description:
      "Precision adhesives and sealants designed for wood bonding, furniture assembly, and finishing applications. Delivers clean, durable results across various wood types.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: "Packaging & Consumer Goods",
    description:
      "Eco-friendly adhesives for sustainable packaging solutions, product assembly, and consumer goods applications. Safe, reliable, and environmentally responsible.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: "Industrial Manufacturing",
    description:
      "Versatile adhesive and sealant technologies for diverse industrial applications. Engineered for performance, durability, and seamless integration into production lines.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    name: "General Industrial Applications",
    description:
      "Flexible, customizable bonding and sealing solutions adaptable to a wide range of general industrial needs. From maintenance to specialized applications.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Industries() {
  return (
    <section id="industries" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto scroll-reveal">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            Industries We Serve
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-primary)]">
            Tailored for Your Sector
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Engineered for Diverse Industries. Customized for Your Application.
          </p>
          <p className="mt-2 text-gray-500">
            We develop innovative bio-based solutions tailored to the unique technical, environmental, and operational requirements of every industry.
          </p>
        </div>

        <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
          {industries.map((industry) => (
            <div
              key={industry.name}
              className="group border border-gray-200 rounded-2xl p-6 hover:border-[var(--color-accent)] hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--color-light)] flex items-center justify-center text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                {industry.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--color-primary)]">
                {industry.name}
              </h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                {industry.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
