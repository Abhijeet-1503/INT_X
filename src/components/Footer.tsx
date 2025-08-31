const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t bg-muted/30">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SmartProctor-X
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Revolutionary AI-powered proctoring system developed by Synaptic Overloaders team.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Built with privacy-first architecture</p>
              <p>Advancing ethical AI in education</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#levels" className="hover:text-foreground transition-colors">Detection Levels</a></li>
              <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Team</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Synaptic Overloaders</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Research Paper</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SmartProctor-X by Synaptic Overloaders. Advancing ethical AI in education.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;