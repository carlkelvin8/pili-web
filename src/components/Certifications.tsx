export default function Certifications() {
  const certs = [
    { name: "ISO 9001", desc: "Quality Management" },
    { name: "ISO 14001", desc: "Environmental" },
    { name: "MIL-SPEC", desc: "Military Standard" },
    { name: "ASTM", desc: "Testing Standards" },
    { name: "DOST", desc: "DOST Accredited" },
    { name: "DTI", desc: "DTI Registered" },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
            Standards & Certifications
          </h3>
          <p className="mt-2 text-gray-500 text-sm">
            Our products are developed in compliance with international and local standards.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {certs.map((cert) => (
            <div
              key={cert.name}
              className="group flex flex-col items-center justify-center p-5 rounded-xl border border-gray-200 hover:border-[var(--color-primary-light)] hover:shadow-md transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-light)] flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-colors duration-300">
                <span className="text-xs font-bold text-[var(--color-accent)] group-hover:text-white transition-colors duration-300">
                  {cert.name}
                </span>
              </div>
              <span className="mt-3 text-xs text-gray-500 text-center font-medium">
                {cert.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
