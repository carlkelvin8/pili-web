import Image from "next/image";

const products = [
  {
    name: "Pili Seal",
    description:
      "High-performance sealant designed to create watertight, airtight barriers. Customized for construction joints, defense enclosures, and industrial sealing applications.",
    features: ["Waterproof", "UV Resistant", "Flexible Cure"],
    image: "/products/pili-seal.svg",
  },
  {
    name: "Pili Adhesive",
    description:
      "Industrial-strength adhesive engineered for permanent bonding across diverse substrates — metal, wood, plastic, and composites.",
    features: ["High Tensile Strength", "Fast Setting", "Multi-Surface"],
    image: "/products/pili-adhesive.svg",
  },
  {
    name: "Pili Hybrid Sealant",
    description:
      "Combines the best properties of sealants and adhesives. Provides elastic sealing with strong adhesion — ideal for dynamic joints and vibration-prone environments.",
    features: ["Elastic Bonding", "Paintable", "No Shrinkage"],
    image: "/products/pili-hybrid.svg",
  },
  {
    name: "Pili Glue",
    description:
      "Versatile, fast-bonding glue for general and specialized applications. Available in various viscosities and cure times to match your process requirements.",
    features: ["Quick Bond", "Clear Finish", "Customizable Viscosity"],
    image: "/products/pili-glue.svg",
  },
];

export default function Products() {
  return (
    <section id="products" className="py-20 md:py-28 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto scroll-reveal">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            Our Products
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-primary)]">
            Engineered for Performance
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Four core product lines, each customizable to your industry&apos;s specific requirements.
          </p>
        </div>

        <div className="mt-16 space-y-20">
          {products.map((product, index) => (
            <div
              key={product.name}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 items-center ${index % 2 === 0 ? "scroll-reveal-left" : "scroll-reveal-right"}`}
            >
              {/* Product Image */}
              <div className="w-full lg:w-1/2">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary-light)]/20 to-[var(--color-accent)]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group-hover:shadow-xl transition-shadow duration-500">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="w-full lg:w-1/2">
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
                  {product.name}
                </h3>
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {product.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-[var(--color-primary-light)]/10 text-[var(--color-accent)] border border-[var(--color-primary-light)]/20"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 mt-8 text-[var(--color-accent)] font-semibold hover:text-[var(--color-primary)] transition-colors group/link"
                >
                  Request Custom Formulation
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
