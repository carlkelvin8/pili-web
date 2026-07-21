import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const defaultContent: Record<string, unknown> = {
  hero: {
    badge: "Proudly Filipino-Engineered",
    heading: "Pili AdheSeal",
    highlight: "Sustainable Solutions",
    subheading: "Transforming agricultural waste into innovative yet high-performance solutions that create value for industries, empower farming communities, and protect the environment.",
    ctaPrimary: "View Our Products",
    ctaPrimaryLink: "#products",
    ctaSecondary: "Get in Touch",
    ctaSecondaryLink: "#contact",
    productTags: ["Pili Adhesive", "Pili Glue", "Pili Glue Stick", "Pili Seal", "Pili Hybrid Sealant"],
  },
  about: {
    heading: "About Pili AdheSeal Inc.",
    visionTitle: "Our Vision",
    visionText: "Redefining the future of industrial materials through sustainable, bio-based solutions and circular innovation.",
    missionTitle: "Our Mission",
    missionText: "At Pili AdheSeal, we transform agricultural waste into innovative yet high-performance solutions that create value for industries, empower farming communities, and protect the environment.",
  },
  products: {
    sectionBadge: "Our Products",
    sectionHeading: "Engineered for Performance",
    sectionSubheading: "Five core product lines, each customizable to your industry's specific requirements.",
    items: [
      {
        name: "Pili Adhesive",
        tagline: "Engineered for Stronger Bonds. Inspired by Nature.",
        description: "A next-generation bio-based adhesive that delivers exceptional bonding performance while supporting a more sustainable future. Built for industrial reliability and everyday versatility.",
        image: "/products/pili-adhesive.svg",
      },
      {
        name: "Pili Glue",
        tagline: "Powerful Bonding. Naturally Better.",
        description: "An eco-conscious multi-purpose glue that combines dependable adhesion with renewable materials—perfect for home, office, education, and light industrial applications.",
        image: "/products/pili-glue.svg",
      },
      {
        name: "Pili Glue Stick",
        tagline: "Smooth Application. Strong Hold. Zero Mess.",
        description: "A premium glue stick designed for clean, effortless use with reliable bonding performance. Ideal for schools, offices, creative projects, and everyday tasks.",
        image: "/products/pili-glue.svg",
      },
      {
        name: "Pili Seal",
        tagline: "Seal with Confidence. Protect for Years.",
        description: "A high-performance, bio-based sealant that creates durable, weather-resistant seals while promoting a more sustainable approach to modern construction and manufacturing.",
        image: "/products/pili-seal.svg",
      },
      {
        name: "Pili Hybrid Sealant",
        tagline: "Where Adhesive Meets Sealant.",
        description: "A revolutionary 2-in-1 hybrid solution that delivers superior adhesion, long-lasting flexibility, and outstanding weather resistance—engineered for demanding industrial applications.",
        image: "/products/pili-hybrid.svg",
      },
    ],
  },
  news: {
    heading: "News",
    subheading: "Stay updated with our latest features, partnerships, and milestones.",
    items: [
      { url: "https://circular-valley.org/batch10", title: "Circular Valley Batch 10", description: "Pili AdheSeal featured in Circular Valley's 10th batch of sustainable innovators." },
      { url: "https://www.youtube.com/watch?v=ZCmU5ihuEHg", title: "Pili AdheSeal Story", description: "Watch our journey of transforming agricultural waste into high-performance industrial solutions." },
      { url: "https://www.tatlerasia.com/people/mark-kennedy-bantugon?listId=382", title: "Tatler Asia Profile", description: "Meet Mark Kennedy Bantugon, the visionary behind Pili AdheSeal's sustainable innovation." },
      { url: "https://www.youtube.com/watch?v=rC4V_KQ8Bgs", title: "Pili Tree Innovation", description: "Discover how we harness the power of the Pili tree for eco-friendly adhesives and sealants." },
      { url: "https://www.tatlerasia.com/power-purpose/innovation/mark-kennedy-bantugon-pili-tree", title: "Power & Purpose", description: "Read about our mission to create sustainable value for industries and farming communities." },
      { url: "https://www.youtube.com/watch?v=rG2hI1f4qz4", title: "Sustainable Future", description: "Join us in redefining the future of industrial materials through bio-based solutions." },
    ],
  },
  contact: {
    heading: "Contact Us",
    subheading: "Connect with us on social media or reach out directly.",
    linkedin: "https://www.linkedin.com/company/piliadheseal/",
    facebook: "https://www.facebook.com/piliadheseal",
    instagram: "https://www.instagram.com/piliadheseal",
  },
  footer: {
    description: "High-performance sealants, adhesives, and bonding solutions customized for every industry. Proudly Filipino-engineered.",
    linkedin: "https://www.linkedin.com/company/piliadheseal/",
    facebook: "https://www.facebook.com/piliadheseal",
    instagram: "https://www.instagram.com/piliadheseal",
    products: ["Pili Adhesive", "Pili Glue", "Pili Glue Stick", "Pili Seal", "Pili Hybrid Sealant"],
    quickLinks: [
      { label: "About Us", href: "#about" },
      { label: "News", href: "#news" },
      { label: "Contact", href: "#contact" },
      { label: "Messages", href: "/messages" },
    ],
  },
};

async function main() {
  for (const [section, content] of Object.entries(defaultContent)) {
    await prisma.pageContent.upsert({
      where: { section },
      update: { content: content as Prisma.InputJsonValue },
      create: { section, content: content as Prisma.InputJsonValue },
    });
    console.log(`Seeded: ${section}`);
  }
  console.log("CMS content seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
