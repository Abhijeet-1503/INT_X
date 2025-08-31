import Level2Component from "@/components/levels/Level2ComponentSimple";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Level2 = () => {
  const navigate = useNavigate();

  console.log('Level2 component loaded');

  const handleSessionComplete = (results: any) => {
    console.log('Level 2 session completed:', results);
    toast.success('Level 2 session completed successfully!');

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
              <h1 className="text-2xl font-bold">Level 2 Proctoring</h1>
              <p className="text-muted-foreground">Gaze tracking and head movement analysis</p>
            </div>
          </div>
          <Level2Component onComplete={handleSessionComplete} />
        </div>
      </main>
    </div>
  );
};

export default Level2;
