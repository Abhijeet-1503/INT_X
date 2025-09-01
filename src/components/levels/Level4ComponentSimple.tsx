import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Play,
  Square,
  Brain,
  Sparkles,
  BarChart3,
  Cpu
} from "lucide-react";
import { toast } from "sonner";
import BaseLevelComponent from "./BaseLevelComponent";

interface Level4ComponentProps {
  onComplete?: (results: any) => void;
}

const Level4ComponentSimple: React.FC<Level4ComponentProps> = ({ onComplete }) => {
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [aiProcessingActive, setAiProcessingActive] = useState(false);
  const [aiProcessingLoad, setAiProcessingLoad] = useState(0);
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [behaviorScore, setBehaviorScore] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive && aiProcessingActive) {
      analysisInterval = setInterval(() => {
        setAiProcessingLoad(Math.floor(60 + Math.random() * 40));
        setFaceConfidence(Math.floor(80 + Math.random() * 20));
        setBehaviorScore(Math.floor(70 + Math.random() * 30));
        
        const suspicion = Math.floor(Math.random() * 100);
        setSuspicionScore(suspicion);
        
        if (suspicion > 75) {
          setViolations(prev => prev + 1);
        }
      }, 1000);
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, aiProcessingActive]);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 }, 
          facingMode: 'user' 
        },
        audio: true
      });

      if (frontVideoRef.current) {
        frontVideoRef.current.srcObject = stream;
        setIsActive(true);
        setAiProcessingActive(true);
        toast.success("AI-enhanced proctoring session started!");
      }
    } catch (error) {
      console.error('AI camera access failed:', error);
      toast.error("AI camera access failed");
    }
  };

  // Patch: Do not send client-side metrics, only notify completion
  const stopSession = () => {
    setIsActive(false);
    setAiProcessingActive(false);

    if (frontVideoRef.current?.srcObject) {
      const tracks = (frontVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      frontVideoRef.current.srcObject = null;
    }

    // Do not send metrics, only notify completion
    if (onComplete) {
      onComplete({ level: 4, completed: true });
    }

    toast.success("AI-enhanced session completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BaseLevelComponent level={4} onComplete={onComplete} loadingMessage="Initializing AI analysis engine...">
      <div className="space-y-6">
        {/* AI Header */}
        <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-900">Level 4: AI-Enhanced Analysis</h2>
                  <p className="text-sm text-indigo-600">Advanced AI • Behavioral Analysis • Predictive Detection</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                  AI-Powered
                </Badge>
                {aiProcessingActive && (
                  <Badge variant="default" className="bg-purple-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Active
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-indigo-600">{formatTime(sessionTime)}</div>
                <div className="text-xs text-gray-600">Session</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-500">{violations}</div>
                <div className="text-xs text-gray-600">Violations</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-500">{suspicionScore}%</div>
                <div className="text-xs text-gray-600">AI Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-500">{faceConfidence}%</div>
                <div className="text-xs text-gray-600">Face ID</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">{behaviorScore}%</div>
                <div className="text-xs text-gray-600">Behavior</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Processing Status */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium text-purple-900">AI Processing Engine</div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <Progress value={aiProcessingLoad} className="h-2" />
                    <div className="text-xs text-purple-700 mt-1">Processing Load: {aiProcessingLoad}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-800">
                      {aiProcessingActive ? 'Active' : 'Standby'}
                    </div>
                    <div className="text-xs text-purple-600">
                      {aiProcessingActive ? 'Real-time analysis' : 'Ready to start'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center gap-4">
              {!isActive ? (
                <Button 
                  onClick={startSession} 
                  size="lg" 
                  className="px-8 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start AI Analysis
                </Button>
              ) : (
                <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                  <Square className="w-5 h-5 mr-2" />
                  Stop AI Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Camera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              AI-Enhanced Camera Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={frontVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xl">AI Analysis Ready</p>
                    <p className="text-sm">Advanced behavioral monitoring</p>
                  </div>
                </div>
              )}
              {isActive && (
                <>
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="animate-pulse text-xs bg-indigo-600">
                      ● AI ANALYZING
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 space-y-1">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Face: {faceConfidence}%
                    </div>
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Behavior: {behaviorScore}%
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{faceConfidence}%</div>
                <div className="text-sm text-gray-600">Face Recognition</div>
                <Progress value={faceConfidence} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{behaviorScore}%</div>
                <div className="text-sm text-gray-600">Behavior Analysis</div>
                <Progress value={behaviorScore} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{suspicionScore}%</div>
                <div className="text-sm text-gray-600">Risk Assessment</div>
                <Progress value={suspicionScore} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLevelComponent>
  );
};

export default Level4ComponentSimple;
