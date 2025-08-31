import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Github, Award, Users } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get In Touch with <span className="bg-gradient-primary bg-clip-text text-transparent">Synaptic Overloaders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with our team to learn more about SmartProctor-X and its innovative approach.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Innovation Showcase</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                SmartProctor-X showcases cutting-edge innovation in AI-powered educational technology, 
                demonstrating advanced proctoring capabilities.
              </CardDescription>
              <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                Team: Synaptic Overloaders
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Collaboration Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                Interested in implementing SmartProctor-X at your institution? 
                Let's discuss how we can customize the solution for your needs.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Team
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  View Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gradient-primary text-white max-w-2xl mx-auto">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Remote Examinations?</h3>
            <p className="text-lg opacity-90 mb-6">
              Join us in revolutionizing online proctoring with privacy-first AI technology.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Schedule a Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Contact;