import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  Play,
  Square,
  Box as Cube,
  Rotate3d,
  Users,
  Target,
  MousePointer,
  RotateCw,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import BaseLevelComponent from "./BaseLevelComponent";

interface Level5ComponentProps {
  onComplete?: (results: any) => void;
}

const Level5ComponentSimple: React.FC<Level5ComponentProps> = ({ onComplete }) => {
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [simulation3D, setSimulation3D] = useState({
    isActive: false,
    viewAngle: { x: -20, y: 45, z: 0 },
    zoom: 1,
    focusMode: false,
    selectedStudent: null as any
  });
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [cheatingEvents, setCheatingEvents] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const students = [
    { id: 'student_1', name: 'Current User', status: 'active', suspicionLevel: 0 }
  ];

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
    if (isActive && simulation3D.isActive) {
      analysisInterval = setInterval(() => {
        const suspicion = Math.floor(Math.random() * 100);
        setSuspicionScore(suspicion);
        
        if (Math.random() > 0.9) {
          setCheatingEvents(prev => prev + 1);
          if (suspicion > 75) {
            setViolations(prev => prev + 1);
          }
        }
      }, 800);
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, simulation3D.isActive]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setSimulation3D(prev => ({
      ...prev,
      viewAngle: {
        ...prev.viewAngle,
        y: prev.viewAngle.y + deltaX * 0.5,
        x: Math.max(-90, Math.min(90, prev.viewAngle.x + deltaY * 0.5))
      }
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    
    setSimulation3D(prev => ({
      ...prev,
      zoom: Math.max(0.2, Math.min(5, prev.zoom * zoomDelta))
    }));
  };

  const selectStudent = (student: any) => {
    setSimulation3D(prev => ({
      ...prev,
      selectedStudent: student,
      focusMode: true
    }));
    toast.success(`Focused on ${student.name}`);
  };

  const resetView = () => {
    setSimulation3D(prev => ({
      ...prev,
      viewAngle: { x: -20, y: 45, z: 0 },
      zoom: 1,
      selectedStudent: null,
      focusMode: false
    }));
    toast.info("View reset to default");
  };

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
        setSimulation3D(prev => ({ ...prev, isActive: true }));
        toast.success("3D simulation session started!");
      }
    } catch (error) {
      console.error('3D camera access failed:', error);
      toast.error("3D camera access failed");
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setSimulation3D(prev => ({ ...prev, isActive: false }));

    if (frontVideoRef.current?.srcObject) {
      const tracks = (frontVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      frontVideoRef.current.srcObject = null;
    }

    const results = {
      level: 5,
      totalTime: sessionTime,
      violations,
      suspicionScore,
      cheatingEvents,
      simulation3D: {
        eventsRecorded: cheatingEvents,
        totalDuration: sessionTime,
        reconstructionQuality: 95
      }
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.success("3D simulation completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BaseLevelComponent level={5} onComplete={onComplete} loadingMessage="Initializing 3D simulation engine...">
      <div className="space-y-6">
        {/* Ultimate Header */}
        <Card className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-full">
                  <Cube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Level 5: 3D Simulation & Analysis</h2>
                  <p className="text-sm text-purple-200">Interactive 3D Environment • Multi-Camera • AI Forensics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-800 text-purple-100 border-purple-400">
                  Ultimate AI
                </Badge>
                {simulation3D.isActive && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Rotate3d className="w-3 h-3 mr-1" />
                    3D Active
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-purple-300">{formatTime(sessionTime)}</div>
                <div className="text-xs text-purple-200">Session</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{violations}</div>
                <div className="text-xs text-purple-200">Violations</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400">{suspicionScore}%</div>
                <div className="text-xs text-purple-200">Suspicion</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{cheatingEvents}</div>
                <div className="text-xs text-purple-200">Events</div>
              </div>
              <div>
                <div className="text-lg font-bold text-pink-400">{Math.round(simulation3D.zoom * 100)}%</div>
                <div className="text-xs text-purple-200">Zoom</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Focus Panel */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">Student Focus Mode</span>
              </div>
              <div className="flex items-center gap-2">
                {students.map((student) => (
                  <Button
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    variant={simulation3D.selectedStudent?.id === student.id ? "default" : "outline"}
                    size="sm"
                  >
                    <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                    {student.name}
                  </Button>
                ))}
                <Button onClick={resetView} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
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
                  className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start 3D Simulation
                </Button>
              ) : (
                <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                  <Square className="w-5 h-5 mr-2" />
                  Stop Simulation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interactive 3D Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rotate3d className="w-5 h-5" />
              Interactive 3D Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 min-h-96 relative overflow-hidden cursor-grab select-none"
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: `scale(${simulation3D.zoom})`,
                transformOrigin: 'center center'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              
              {/* Mode Indicator */}
              <div className="absolute top-4 left-4 z-20">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  <MousePointer className="w-3 h-3 mr-1" />
                  INTERACTIVE MODE
                </Badge>
              </div>

              {/* Focus Indicator */}
              {simulation3D.focusMode && simulation3D.selectedStudent && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge variant="default" className="bg-indigo-600 animate-pulse">
                    <Target className="w-3 h-3 mr-1" />
                    FOCUSED: {simulation3D.selectedStudent.name}
                  </Badge>
                </div>
              )}
              
              {/* 3D Scene */}
              <div 
                className="relative z-10 h-full flex items-center justify-center"
                style={{
                  transform: `
                    perspective(1000px) 
                    rotateX(${simulation3D.viewAngle.x}deg) 
                    rotateY(${simulation3D.viewAngle.y}deg) 
                  `
                }}
              >
                {simulation3D.isActive ? (
                  <div className="text-center text-white space-y-4 relative">
                    <div className="relative w-80 h-80">
                      {/* Student Avatar */}
                      <div 
                        className="absolute w-16 h-16 bg-blue-500 rounded-full transition-all duration-500 cursor-pointer hover:scale-110"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => selectStudent(students[0])}
                      >
                        <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-pulse" />
                        {simulation3D.selectedStudent && (
                          <div className="absolute inset-0 rounded-full ring-4 ring-white scale-125" />
                        )}
                      </div>
                      
                      {/* Room boundaries */}
                      <div className="absolute inset-0 border-2 border-gray-600 border-dashed rounded-lg opacity-60" />
                      
                      {/* Camera positions */}
                      <div className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white top-4 left-4">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-green-400 bg-black/70 px-2 py-1 rounded">
                          Primary
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold">Interactive 3D Simulation</div>
                    <div className="text-sm text-gray-300">
                      Events: {cheatingEvents} • Zoom: {Math.round(simulation3D.zoom * 100)}% • Angle: {Math.round(simulation3D.viewAngle.y)}°
                    </div>
                    <div className="text-xs text-gray-400">
                      🖱️ Drag to rotate • 🎯 Scroll to zoom • 👆 Click student to focus
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Cube className="w-24 h-24 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Interactive 3D Simulation Ready</p>
                    <p className="text-sm">Start session to begin 3D reconstruction</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              {simulation3D.isActive && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button onClick={resetView} size="sm" variant="secondary">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white text-sm bg-black/50 px-3 py-1 rounded">
                    <span>Zoom: {Math.round(simulation3D.zoom * 100)}%</span>
                    <span>Angle: {Math.round(simulation3D.viewAngle.y)}°</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3D Controls Panel */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="font-medium flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  View Controls
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-12">Y Angle:</span>
                    <Slider
                      value={[simulation3D.viewAngle.y]}
                      onValueChange={([value]) => setSimulation3D(prev => ({
                        ...prev,
                        viewAngle: { ...prev.viewAngle, y: value }
                      }))}
                      min={0}
                      max={360}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs w-10">{Math.round(simulation3D.viewAngle.y)}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-12">Zoom:</span>
                    <Slider
                      value={[simulation3D.zoom]}
                      onValueChange={([value]) => setSimulation3D(prev => ({
                        ...prev,
                        zoom: value
                      }))}
                      min={0.2}
                      max={5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs w-10">{Math.round(simulation3D.zoom * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Session Stats
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-purple-600">{cheatingEvents}</div>
                    <div className="text-xs text-gray-600">Events Detected</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-600">{suspicionScore}%</div>
                    <div className="text-xs text-gray-600">Risk Level</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLevelComponent>
  );
};

export default Level5ComponentSimple;
