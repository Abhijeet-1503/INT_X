import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Server, Eye } from "lucide-react";

const privacyFeatures = [
  {
    icon: Lock,
    title: "Local Processing First",
    description: "AI inference runs on your device, not in the cloud. Your data stays with you."
  },
  {
    icon: Shield,
    title: "Configurable Data Retention",
    description: "Choose to store, anonymize, or discard exam session data based on your policies."
  },
  {
    icon: Server,
    title: "Federated Learning Support", 
    description: "Improve models across institutions without sharing raw student data."
  },
  {
    icon: Eye,
    title: "Transparent Monitoring",
    description: "Students know exactly what is being monitored and how their data is used."
  }
];

const Privacy = () => {
  return (
    <section id="privacy" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Privacy-First</span> Architecture
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlike traditional proctoring tools, SmartProctor-X prioritizes student privacy
            while maintaining the highest security standards.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {privacyFeatures.map((feature, index) => (
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
        
        <Card className="bg-gradient-primary text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Privacy by Design Promise</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg opacity-90 leading-relaxed max-w-3xl mx-auto">
              We believe that exam security and student privacy are not mutually exclusive. 
              SmartProctor-X proves that advanced AI monitoring can coexist with ethical data practices, 
              building trust between institutions and students.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Privacy;