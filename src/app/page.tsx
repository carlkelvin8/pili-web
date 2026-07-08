import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Products from "@/components/Products";
import Process from "@/components/Process";
import Industries from "@/components/Industries";
import Testimonials from "@/components/Testimonials";
import WhyChooseUs from "@/components/WhyChooseUs";
import Certifications from "@/components/Certifications";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import Chatbot from "@/components/Chatbot";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <main>
      <LoadingScreen />
      <CustomCursor />
      <ScrollReveal />
      <ScrollProgress />
      <Header />
      <Hero />
      <Stats />
      <About />
      <Products />
      <Process />
      <Industries />
      <Testimonials />
      <WhyChooseUs />
      <Certifications />
      <FAQ />
      <CTA />
      <Contact />
      <Footer />
      <Chatbot />
    </main>
  );
}
