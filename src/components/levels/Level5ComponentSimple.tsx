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
                    <div className="relative w-96 h-96 mx-auto">
                      {/* CCTV Style Overlay */}
                      <div className="absolute top-2 left-2 z-30 text-red-500 text-xs font-mono bg-black/80 px-2 py-1 rounded">
                        CCTV CAM-01 | REC • {new Date().toLocaleTimeString()}
                      </div>
                      
                      {/* Exam Room Environment */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                        {/* Desk */}
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-amber-900 rounded-sm shadow-lg" />
                        
                        {/* Computer Screen */}
                        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-blue-400 rounded-sm border border-gray-600 shadow-lg">
                          <div className="absolute inset-1 bg-white rounded-sm animate-pulse opacity-80" />
                          <div className="absolute top-1 left-1 right-1 h-1 bg-blue-600 rounded" />
                        </div>
                        
                        {/* Animated 3D Humanoid Student */}
                        <div 
                          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 transition-all duration-1000"
                          style={{
                            transform: `translate(-50%, 0) rotateY(${Math.sin(Date.now() / 3000) * 5}deg)`
                          }}
                        >
                          {/* Body */}
                          <div className="relative">
                            {/* Head */}
                            <div 
                              className="w-8 h-8 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full border border-amber-400 relative mx-auto"
                              style={{
                                transform: `rotateX(${Math.sin(Date.now() / 2000) * 10 - 5}deg) rotateY(${Math.sin(Date.now() / 4000) * 15}deg)`
                              }}
                            >
                              {/* Eyes */}
                              <div className="absolute top-2 left-1.5 w-1 h-1 bg-black rounded-full" />
                              <div className="absolute top-2 right-1.5 w-1 h-1 bg-black rounded-full" />
                              {/* Nose */}
                              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-amber-400 rounded-full" />
                              {/* Mouth */}
                              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-red-400 rounded-full" />
                            </div>
                            
                            {/* Neck */}
                            <div className="w-2 h-2 bg-amber-200 mx-auto" />
                            
                            {/* Torso */}
                            <div className="w-12 h-16 bg-gradient-to-b from-blue-600 to-blue-700 rounded-lg mx-auto border border-blue-800 relative">
                              {/* Shirt details */}
                              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-800 rounded" />
                              <div className="absolute top-3 left-2 w-1 h-1 bg-blue-800 rounded-full" />
                              <div className="absolute top-3 right-2 w-1 h-1 bg-blue-800 rounded-full" />
                            </div>
                            
                            {/* Arms */}
                            <div className="absolute top-10 -left-3 w-6 h-2 bg-amber-200 rounded-full transform rotate-12">
                              <div className="absolute -bottom-1 -right-1 w-3 h-6 bg-amber-200 rounded-full" />
                            </div>
                            <div 
                              className="absolute top-10 -right-3 w-6 h-2 bg-amber-200 rounded-full transform -rotate-12 transition-transform duration-2000"
                              style={{
                                transform: `rotate(${-12 + Math.sin(Date.now() / 1500) * 20}deg)`
                              }}
                            >
                              {/* Right hand typing motion */}
                              <div 
                                className="absolute -bottom-1 -right-1 w-3 h-6 bg-amber-200 rounded-full transition-transform duration-500"
                                style={{
                                  transform: `rotate(${Math.sin(Date.now() / 800) * 15}deg)`
                                }}
                              />
                            </div>
                            
                            {/* Legs */}
                            <div className="absolute top-24 left-2 w-3 h-8 bg-gray-700 rounded-lg" />
                            <div className="absolute top-24 right-2 w-3 h-8 bg-gray-700 rounded-lg" />
                          </div>
                          
                          {/* Chair */}
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-14 h-6 bg-gray-600 rounded-sm shadow-lg">
                            <div className="absolute -bottom-2 left-2 w-1 h-2 bg-gray-500" />
                            <div className="absolute -bottom-2 right-2 w-1 h-2 bg-gray-500" />
                          </div>
                        </div>
                        
                        {/* Typing Animation Indicators */}
                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
                              style={{
                                left: `${(i - 1) * 8}px`,
                                animationDelay: `${i * 200}ms`,
                                opacity: Math.sin(Date.now() / 500 + i) > 0 ? 1 : 0
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Room Details */}
                        <div className="absolute top-4 right-4 w-4 h-4 bg-red-600 rounded-full animate-pulse opacity-50" />
                        <div className="absolute bottom-4 left-4 w-8 h-2 bg-gray-600 rounded opacity-30" />
                        <div className="absolute top-1/2 right-2 w-1 h-16 bg-gray-700 rounded opacity-40" />
                        
                        {/* Suspicious Activity Indicators */}
                        {cheatingEvents > 0 && (
                          <div className="absolute top-8 right-8 animate-pulse">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />
                          </div>
                        )}
                        
                        {/* Focus Indicator */}
                        {simulation3D.selectedStudent && (
                          <div className="absolute inset-0 ring-4 ring-yellow-400 rounded-lg animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold">Live CCTV - Exam Room Surveillance</div>
                    <div className="text-sm text-gray-300">
                      Student Activity: {cheatingEvents > 0 ? '⚠️ Suspicious' : '✅ Normal'} • Events: {cheatingEvents} • Zoom: {Math.round(simulation3D.zoom * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      🎥 Real-time monitoring • 🖱️ Drag to rotate view • 🎯 Scroll to zoom
                    </div>
                    
                    {/* Behavioral Analysis */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                      <div className="bg-black/50 p-2 rounded">
                        <div className="text-green-400">✓ Typing Activity</div>
                        <div className="text-white">Normal</div>
                      </div>
                      <div className="bg-black/50 p-2 rounded">
                        <div className="text-blue-400">👁️ Gaze Pattern</div>
                        <div className="text-white">Screen Focused</div>
                      </div>
                      <div className="bg-black/50 p-2 rounded">
                        <div className={`${cheatingEvents > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {cheatingEvents > 0 ? '⚠️' : '✓'} Behavior
                        </div>
                        <div className="text-white">{cheatingEvents > 0 ? 'Flagged' : 'Normal'}</div>
                      </div>
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
