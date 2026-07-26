import Image from "next/image";

const supporters = [
  { name: "DEP", logo: "/supporters/dep.png" },
  { name: "DEVNIC", logo: "/supporters/devnic.png" },
  { name: "PFAI", logo: "/supporters/pfai.png" },
  { name: "POPH", logo: "/supporters/poph.png" },
  { name: "DOST", logo: "/supporters/dost.png" },
  { name: "DND", logo: "/supporters/dnd.png" },
  { name: "GABAY", logo: "/supporters/gabay.png" },
  { name: "K Asia Pacific", logo: "/supporters/k-asia-pacific.png" },
  { name: "ChaseChem", logo: "/supporters/chasechem.png" },
];

export default function SupportedBy() {
  return (
    <section className="py-16 md:py-20 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            Partners & Supporters
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
            Supported By
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {supporters.map((supporter) => (
            <div
              key={supporter.name}
              className="group flex items-center justify-center w-28 h-20 sm:w-36 sm:h-24 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={supporter.logo}
                alt={supporter.name}
                width={120}
                height={80}
                className="object-contain w-full h-full p-2"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
