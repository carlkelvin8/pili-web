import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import News from "@/components/News";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ScrollReveal from "@/components/ScrollReveal";
import FloatingChat from "@/components/FloatingChat";

export default function Home() {
  return (
    <main>
      <CustomCursor />
      <ScrollReveal />
      <Header />
      <Hero />
      <About />
      <Products />
      <News />
      <Contact />
      <Footer />
      <FloatingChat />
    </main>
  );
}