import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DetectionLevels from "@/components/DetectionLevels";
import Privacy from "@/components/Privacy";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <DetectionLevels />
        <Privacy />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;