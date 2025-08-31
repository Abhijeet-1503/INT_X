import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/smartproctor-hero.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20" variant="outline">
          Developed by Synaptic Overloaders
        </Badge>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-hero bg-clip-text text-transparent">
            SmartProctor-X
          </span>
          <br />
          <span className="text-foreground text-3xl md:text-4xl lg:text-5xl">
            AI-Powered Multi-Level Proctoring
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
          Revolutionary 5-level AI proctoring system with privacy-first architecture. 
          Secure remote examinations with advanced cheating detection and ethical deployment.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6" asChild>
            <Link to="/start">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            View Architecture
          </Button>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-20 blur-3xl"></div>
          <img 
            src={heroImage} 
            alt="SmartProctor-X AI Proctoring Dashboard Interface"
            className="relative rounded-2xl shadow-glow w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;