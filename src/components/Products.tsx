import Image from "next/image";

interface ProductItem {
  name: string;
  tagline: string;
  description: string;
  image: string;
}

interface ProductsData {
  sectionBadge?: string;
  sectionHeading?: string;
  sectionSubheading?: string;
  items?: ProductItem[];
}

const defaultItems: ProductItem[] = [
  { name: "Pili Adhesive", tagline: "Engineered for Stronger Bonds. Inspired by Nature.", description: "A next-generation bio-based adhesive that delivers exceptional bonding performance while supporting a more sustainable future. Built for industrial reliability and everyday versatility.", image: "/products/pili-adhesive.svg" },
  { name: "Pili Glue", tagline: "Powerful Bonding. Naturally Better.", description: "An eco-conscious multi-purpose glue that combines dependable adhesion with renewable materials—perfect for home, office, education, and light industrial applications.", image: "/products/pili-glue.svg" },
  { name: "Pili Glue Stick", tagline: "Smooth Application. Strong Hold. Zero Mess.", description: "A premium glue stick designed for clean, effortless use with reliable bonding performance. Ideal for schools, offices, creative projects, and everyday tasks.", image: "/products/pili-glue.svg" },
  { name: "Pili Seal", tagline: "Seal with Confidence. Protect for Years.", description: "A high-performance, bio-based sealant that creates durable, weather-resistant seals while promoting a more sustainable approach to modern construction and manufacturing.", image: "/products/pili-seal.svg" },
  { name: "Pili Hybrid Sealant", tagline: "Where Adhesive Meets Sealant.", description: "A revolutionary 2-in-1 hybrid solution that delivers superior adhesion, long-lasting flexibility, and outstanding weather resistance—engineered for demanding industrial applications.", image: "/products/pili-hybrid.svg" },
];

export default function Products({ data }: { data?: ProductsData | null }) {
  const d = {
    sectionBadge: "Our Products",
    sectionHeading: "Engineered for Performance",
    sectionSubheading: "Five core product lines, each customizable to your industry's specific requirements.",
    items: defaultItems,
    ...data,
  };

  return (
    <section id="products" className="py-20 md:py-28 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto scroll-reveal">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            {d.sectionBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-primary)]">
            {d.sectionHeading}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {d.sectionSubheading}
          </p>
        </div>

        <div className="mt-16 space-y-20">
          {d.items.map((product, index) => (
            <div
              key={product.name}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 items-center ${index % 2 === 0 ? "scroll-reveal-left" : "scroll-reveal-right"}`}
            >
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

              <div className="w-full lg:w-1/2">
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
                  {product.name}
                </h3>
                <p className="mt-2 text-[var(--color-accent)] font-semibold text-lg">
                  {product.tagline}
                </p>
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
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
