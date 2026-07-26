"use client";

import Image from "next/image";

interface NewsItem {
  url: string;
  title: string;
  description: string;
}

interface NewsData {
  heading?: string;
  subheading?: string;
  items?: NewsItem[];
}

const defaultItems: NewsItem[] = [
  { url: "https://circular-valley.org/batch10", title: "Circular Valley Batch 10", description: "Pili AdheSeal featured in Circular Valley's 10th batch of sustainable innovators." },
  { url: "https://www.youtube.com/watch?v=ZCmU5ihuEHg", title: "Pili AdheSeal Story", description: "Watch our journey of transforming agricultural waste into high-performance industrial solutions." },
  { url: "https://www.tatlerasia.com/people/mark-kennedy-bantugon?listId=382", title: "Tatler Asia Profile", description: "Meet Mark Kennedy Bantugon, the visionary behind Pili AdheSeal's sustainable innovation." },
  { url: "https://www.youtube.com/watch?v=rC4V_KQ8Bgs", title: "Pili Tree Innovation", description: "Discover how we harness the power of the Pili tree for eco-friendly adhesives and sealants." },
  { url: "https://www.tatlerasia.com/power-purpose/innovation/mark-kennedy-bantugon-pili-tree", title: "Power & Purpose", description: "Read about our mission to create sustainable value for industries and farming communities." },
  { url: "https://www.youtube.com/watch?v=rG2hI1f4qz4", title: "Sustainable Future", description: "Join us in redefining the future of industrial materials through bio-based solutions." },
];

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function News({ data }: { data?: NewsData | null }) {
  const d = {
    heading: "News",
    subheading: "Stay updated with our latest features, partnerships, and milestones.",
    items: defaultItems,
    ...data,
  };

  return (
    <section id="news" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{d.heading}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {d.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {d.items.map((item, index) => {
            const ytId = getYouTubeId(item.url);
            return (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  {ytId ? (
                    <>
                      <Image
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]">
                      <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  <span className="inline-block mt-3 text-sm text-[var(--color-accent)] font-medium">
                    {ytId ? "Watch video →" : "Read more →"}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
