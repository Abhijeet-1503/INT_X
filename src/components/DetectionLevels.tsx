import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Users, Mic, Brain, Target, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const levels = [
  {
    level: 1,
    title: "Baseline Monitoring",
    icon: Camera,
    features: ["Face verification", "Basic microphone monitoring", "Identity confirmation"],
    complexity: "Basic"
  },
  {
    level: 2,
    title: "Behavior Detection", 
    icon: Eye,
    features: ["Gaze tracking", "Head movement analysis", "Multi-screen detection"],
    complexity: "Intermediate"
  },
  {
    level: 3,
    title: "Environment Awareness",
    icon: Users,
    features: ["Multi-person detection", "Background analysis", "Suspicious object recognition"],
    complexity: "Advanced"
  },
  {
    level: 4,
    title: "Audio-Visual Analysis",
    icon: Mic,
    features: ["Speech recognition", "Whisper detection", "Environmental noise classification"],
    complexity: "Expert"
  },
  {
    level: 5,
    title: "Adaptive AI Decision",
    icon: Brain,
    features: ["Transformer models", "Behavioral risk assessment", "Time-series analysis"],
    complexity: "AI-Powered"
  }
];

const DetectionLevels = () => {
  return (
    <section id="levels" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            5-Level <span className="bg-gradient-primary bg-clip-text text-transparent">Detection Architecture</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your security level. Start basic and upgrade as needed with our modular approach.
          </p>
        </div>
        
        <div className="grid gap-6">
          {levels.map((level, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <level.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="secondary" className="text-sm font-bold">
                        Level {level.level}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${
                        level.complexity === 'AI-Powered' ? 'border-accent text-accent' :
                        level.complexity === 'Expert' ? 'border-primary text-primary' :
                        level.complexity === 'Advanced' ? 'border-primary/60 text-primary/60' :
                        'border-muted-foreground text-muted-foreground'
                      }`}>
                        {level.complexity}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{level.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {level.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <Link to={`/level${level.level}`}>
                    {level.level === 1 ? "Try Our Basic Model" : `Explore Level ${level.level}`}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetectionLevels;