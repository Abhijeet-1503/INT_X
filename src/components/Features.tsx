import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Brain, Lock, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "5-Level Detection System",
    description: "Upgradeable architecture from basic monitoring to advanced AI decision layers"
  },
  {
    icon: Lock,
    title: "Privacy-First Design", 
    description: "Local processing with minimal cloud exposure, ensuring data never leaves your device"
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Multi-modal detection using computer vision, audio analysis, and behavioral patterns"
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description: "Live gaze tracking, facial recognition, and environmental awareness during exams"
  },
  {
    icon: Zap,
    title: "Hybrid Framework",
    description: "Seamless integration of hardware sensors with advanced software pipelines"
  },
  {
    icon: Users,
    title: "Institutional Scalability",
    description: "LMS integration and standalone deployment options for educational institutions"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Revolutionary <span className="bg-gradient-primary bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SmartProctor-X combines cutting-edge AI technology with ethical privacy practices
            to deliver the most advanced proctoring solution available.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;