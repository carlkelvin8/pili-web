interface AboutData {
  heading?: string;
  visionTitle?: string;
  visionText?: string;
  missionTitle?: string;
  missionText?: string;
}

const defaults: AboutData = {
  heading: "About Pili AdheSeal Inc.",
  visionTitle: "Our Vision",
  visionText: "Redefining the future of industrial materials through sustainable, bio-based solutions and circular innovation.",
  missionTitle: "Our Mission",
  missionText: "At Pili AdheSeal, we transform agricultural waste into innovative yet high-performance solutions that create value for industries, empower farming communities, and protect the environment.",
};

export default function About({ data }: { data?: AboutData | null }) {
  const d = { ...defaults, ...data };

  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-12">
            {d.heading}
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="bg-gradient-to-br from-[var(--color-light)] to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{d.visionTitle}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{d.visionText}</p>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-light)] to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{d.missionTitle}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{d.missionText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
