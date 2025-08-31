import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SmartProctor-X
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#levels" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Detection Levels
          </a>
          <a href="#privacy" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Contact
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/config">API Config</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity" asChild>
            <Link to="/start">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;