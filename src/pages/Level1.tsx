import Level1Component from "@/components/levels/Level1Component";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Level1 = () => {
  const navigate = useNavigate();

  console.log('Level1 component loaded');

  const handleSessionComplete = (results: any) => {
    console.log('Level 1 session completed:', results);
    toast.success('Level 1 session completed successfully!');

    // Navigate back to start page or dashboard
    setTimeout(() => {
      navigate('/start');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/start">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Start
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Level 1 Proctoring</h1>
              <p className="text-muted-foreground">Basic face verification and audio monitoring</p>
            </div>
          </div>
          <Level1Component onComplete={handleSessionComplete} />
        </div>
      </main>
    </div>
  );
};

export default Level1;