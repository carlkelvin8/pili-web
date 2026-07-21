"use client";

export default function News() {
  const news = [
    {
      url: "https://circular-valley.org/batch10",
      title: "Circular Valley Batch 10",
      description: "Pili AdheSeal featured in Circular Valley's 10th batch of sustainable innovators.",
    },
    {
      url: "https://www.youtube.com/watch?v=ZCmU5ihuEHg",
      title: "Pili AdheSeal Story",
      description: "Watch our journey of transforming agricultural waste into high-performance industrial solutions.",
    },
    {
      url: "https://www.tatlerasia.com/people/mark-kennedy-bantugon?listId=382",
      title: "Tatler Asia Profile",
      description: "Meet Mark Kennedy Bantugon, the visionary behind Pili AdheSeal's sustainable innovation.",
    },
    {
      url: "https://www.youtube.com/watch?v=rC4V_KQ8Bgs",
      title: "Pili Tree Innovation",
      description: "Discover how we harness the power of the Pili tree for eco-friendly adhesives and sealants.",
    },
    {
      url: "https://www.tatlerasia.com/power-purpose/innovation/mark-kennedy-bantugon-pili-tree",
      title: "Power & Purpose",
      description: "Read about our mission to create sustainable value for industries and farming communities.",
    },
    {
      url: "https://www.youtube.com/watch?v=rG2hI1f4qz4",
      title: "Sustainable Future",
      description: "Join us in redefining the future of industrial materials through bio-based solutions.",
    },
  ];

  return (
    <section id="news" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">News</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with our latest features, partnerships, and milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <span className="text-green-600 font-medium hover:text-green-700">
                Read more →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}