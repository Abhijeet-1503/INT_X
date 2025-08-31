import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import heroImage from "@/assets/smartproctor-hero.jpg";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Hero = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen && typeof window !== 'undefined' && (window as any).mermaid) {
      setTimeout(() => {
        (window as any).mermaid.init();
      }, 100);
    }
  }, [isDialogOpen]);

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Architecture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  SmartProctor-X System Architecture
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">SmartProctor-X System Architecture</h3>
                    <p className="text-sm text-gray-600">Complete multi-layer proctoring system overview</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Frontend Layer */}
                    <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-800 mb-2">🖥️ Frontend Layer</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• React/TypeScript UI</li>
                        <li>• 5 Proctoring Levels</li>
                        <li>• Camera Setup & Config</li>
                        <li>• Admin Dashboard</li>
                        <li>• 3D Simulation (Level 5)</li>
                      </ul>
                    </div>
                    
                    {/* Backend Layer */}
                    <div className="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-purple-800 mb-2">⚙️ Backend Processing</h4>
                      <ul className="text-xs text-purple-700 space-y-1">
                        <li>• Python FastAPI Server</li>
                        <li>• MediaPipe Face Detection</li>
                        <li>• OpenCV Image Processing</li>
                        <li>• Real-time Analysis</li>
                        <li>• Report Generation</li>
                      </ul>
                    </div>
                    
                    {/* AI Services */}
                    <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-green-800 mb-2">🤖 AI Services</h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Google Gemini AI</li>
                        <li>• OpenAI GPT Analysis</li>
                        <li>• Local ML Models</li>
                        <li>• Behavioral Analysis</li>
                        <li>• Predictive Detection</li>
                      </ul>
                    </div>
                    
                    {/* Camera Sources */}
                    <div className="bg-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-bold text-orange-800 mb-2">📹 Camera Sources</h4>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• PC Webcam (Primary)</li>
                        <li>• Phone IP Camera (Side)</li>
                        <li>• External CCTV</li>
                        <li>• Multi-angle Analysis</li>
                        <li>• Frame Synchronization</li>
                      </ul>
                    </div>
                    
                    {/* Database Layer */}
                    <div className="bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-bold text-yellow-800 mb-2">💾 Data Storage</h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Supabase Database</li>
                        <li>• Firebase Authentication</li>
                        <li>• Local JSON Reports</li>
                        <li>• Screenshot Evidence</li>
                        <li>• Session Analytics</li>
                      </ul>
                    </div>
                    
                    {/* Real-time Features */}
                    <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-bold text-red-800 mb-2">⚡ Real-time Features</h4>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• WebSocket Connections</li>
                        <li>• Live Monitoring</li>
                        <li>• Instant Alerts</li>
                        <li>• Event Streaming</li>
                        <li>• Admin Notifications</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-2">🔄 Data Flow</h4>
                      <p className="text-xs text-gray-600">
                        Camera Input → Frame Analysis → AI Processing → Violation Detection → 
                        Scoring → Screenshot → Report Generation → Database Storage
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete system architecture showing all components and data flows
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 rounded"></div>
                      <span>Frontend Layer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-100 rounded"></div>
                      <span>Backend Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      <span>AI Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-100 rounded"></div>
                      <span>Data Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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