import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import News from "@/components/News";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollProgress from "@/components/ScrollProgress";
import FloatingChat from "@/components/FloatingChat";
import { getAllCmsContent } from "@/lib/cms";

export default async function Home() {
  const cms = await getAllCmsContent();

  return (
    <main>
      <CustomCursor />
      <ScrollProgress />
      <ScrollReveal />
      <Header />
      <Hero data={cms.hero} />
      <About data={cms.about} />
      <Products data={cms.products} />
      <News data={cms.news} />
      <Contact data={cms.contact} />
      <Footer data={cms.footer} />
      <FloatingChat />
    </main>
  );
}
