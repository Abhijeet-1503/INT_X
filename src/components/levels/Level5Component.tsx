import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  Smartphone,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertTriangle,
  Volume2,
  Eye,
  Brain,
  Activity,
  Target,
  Zap,
  Wifi,
  QrCode,
  Link,
  MonitorSpeaker,
  ScanLine,
  Cpu,
  BarChart3,
  TrendingUp,
  Sparkles,
  Bot,
  Radar,
  Layers,
  Microscope,
  Box as Cube,
  Video,
  Rotate3d,
  Zap as Lightning,
  Globe,
  Satellite,
  Shield,
  Crosshair,
  MapPin,
  Clock,
  Rewind,
  FastForward,
  RotateCcw,
  Settings,
  Maximize,
  Grid3x3,
  Cctv,
  Users,
  MousePointer,
  Move,
  RotateCw
} from "lucide-react";
import { toast } from "sonner";

interface Level5ComponentProps {
  onComplete?: (results: any) => void;
}

interface CheatingEvent {
  id: string;
  timestamp: Date;
  type: 'looking_away' | 'suspicious_object' | 'multiple_people' | 'unusual_behavior' | 'voice_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  camera: string;
  coordinates: { x: number; y: number; z?: number };
  duration: number;
  evidenceFrames: string[];
}

interface CameraFeed {
  id: string;
  name: string;
  type: 'primary' | 'side' | 'overhead' | 'cctv' | 'mobile';
  status: 'active' | 'inactive' | 'error';
  angle: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  quality: number;
  aiProcessing: boolean;
}

interface Student {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  status: 'active' | 'suspicious' | 'normal' | 'flagged';
  suspicionLevel: number;
  currentActivity: string;
  lastEvent?: CheatingEvent;
}

interface Simulation3D {
  isActive: boolean;
  currentTime: number;
  totalDuration: number;
  playbackSpeed: number;
  selectedEvent: CheatingEvent | null;
  selectedStudent: Student | null;
  focusMode: boolean;
  viewAngle: { x: number; y: number; z: number };
  zoom: number;
  maxZoom: number;
  minZoom: number;
  showTrajectory: boolean;
  showHeatmap: boolean;
  showStudentLabels: boolean;
  interactionMode: 'pan' | 'rotate' | 'zoom';
  reconstruction: {
    personPosition: { x: number; y: number; z: number };
    gazeDirection: { x: number; y: number; z: number };
    bodyPose: any;
    handPositions: { left: any; right: any };
    objects: Array<{ id: string; position: any; type: string; }>;
  };
}

const Level5Component: React.FC<Level5ComponentProps> = ({ onComplete }) => {
  // Camera references
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const sideVideoRef = useRef<HTMLVideoElement>(null);
  const overheadVideoRef = useRef<HTMLVideoElement>(null);
  const cctvVideoRef = useRef<HTMLVideoElement>(null);
  
  // Core state
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  
  // Camera feeds management
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([
    { id: 'primary', name: 'Primary Camera', type: 'primary', status: 'inactive', angle: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 1 }, quality: 0, aiProcessing: false },
    { id: 'side', name: 'Side Camera', type: 'side', status: 'inactive', angle: { x: 0, y: 90, z: 0 }, position: { x: 1, y: 0, z: 0 }, quality: 0, aiProcessing: false },
    { id: 'overhead', name: 'Overhead Camera', type: 'overhead', status: 'inactive', angle: { x: -90, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 }, quality: 0, aiProcessing: false },
    { id: 'cctv1', name: 'CCTV Corner 1', type: 'cctv', status: 'inactive', angle: { x: -45, y: 45, z: 0 }, position: { x: -1, y: 0.5, z: 1 }, quality: 0, aiProcessing: false },
    { id: 'cctv2', name: 'CCTV Corner 2', type: 'cctv', status: 'inactive', angle: { x: -45, y: -45, z: 0 }, position: { x: 1, y: 0.5, z: 1 }, quality: 0, aiProcessing: false }
  ]);
  
  // Students and events
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'student_1',
      name: 'Current User',
      position: { x: 0, y: 0, z: 0 },
      status: 'active',
      suspicionLevel: 0,
      currentActivity: 'Taking exam'
    }
  ]);
  const [cheatingEvents, setCheatingEvents] = useState<CheatingEvent[]>([]);
  const [activeView, setActiveView] = useState("3d-simulation");
  const [selectedCamera, setSelectedCamera] = useState("primary");
  
  // 3D Simulation state with interactive controls
  const [simulation3D, setSimulation3D] = useState<Simulation3D>({
    isActive: false,
    currentTime: 0,
    totalDuration: 0,
    playbackSpeed: 1,
    selectedEvent: null,
    selectedStudent: null,
    focusMode: false,
    viewAngle: { x: -20, y: 45, z: 0 },
    zoom: 1,
    maxZoom: 5,
    minZoom: 0.2,
    showTrajectory: true,
    showHeatmap: false,
    showStudentLabels: true,
    interactionMode: 'rotate',
    reconstruction: {
      personPosition: { x: 0, y: 0, z: 0 },
      gazeDirection: { x: 0, y: 0, z: 1 },
      bodyPose: null,
      handPositions: { left: null, right: null },
      objects: []
    }
  });
  
  // Interactive controls state
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isMouseOver3D, setIsMouseOver3D] = useState(false);
  
  // AI Analysis state
  const [aiProcessingLoad, setAiProcessingLoad] = useState(0);
  const [multiCameraSync, setMultiCameraSync] = useState(false);
  const [spatialAnalysis, setSpatialAnalysis] = useState({
    roomMapping: { width: 4, height: 3, depth: 4 },
    personTracking: { confidence: 0, trajectory: [] },
    objectDetection: { count: 0, suspicious: 0 },
    acousticAnalysis: { sources: 0, anomalies: 0 }
  });

  // Session timer
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

  // Advanced multi-camera AI analysis with 3D reconstruction
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive && multiCameraSync) {
      analysisInterval = setInterval(() => {
        // Simulate AI processing load
        setAiProcessingLoad(Math.floor(60 + Math.random() * 40));
        
        // Generate cheating events with 3D coordinates
        if (Math.random() > 0.85) { // 15% chance of event per interval
          const eventTypes = ['looking_away', 'suspicious_object', 'multiple_people', 'unusual_behavior', 'voice_anomaly'];
          const cameras = cameraFeeds.filter(cam => cam.status === 'active');
          
          if (cameras.length > 0) {
            const selectedCamera = cameras[Math.floor(Math.random() * cameras.length)];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as CheatingEvent['type'];
            const severity = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
            
            const newEvent: CheatingEvent = {
              id: `event_${Date.now()}_${Math.random()}`,
              timestamp: new Date(),
              type: eventType,
              severity: severity as CheatingEvent['severity'],
              confidence: Math.floor(70 + Math.random() * 30),
              description: getEventDescription(eventType, severity),
              camera: selectedCamera.name,
              coordinates: {
                x: (Math.random() - 0.5) * 2, // -1 to 1
                y: Math.random() * 0.5,       // 0 to 0.5
                z: (Math.random() - 0.5) * 2  // -1 to 1
              },
              duration: Math.floor(2 + Math.random() * 8), // 2-10 seconds
              evidenceFrames: [`frame_${Date.now()}_1.jpg`, `frame_${Date.now()}_2.jpg`]
            };
            
            setCheatingEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20 events
            
            if (severity === 'high') {
              setViolations(prev => prev + 1);
            }
          }
        }
        
        // Update spatial analysis
        setSpatialAnalysis(prev => ({
          ...prev,
          personTracking: {
            confidence: Math.floor(85 + Math.random() * 15),
            trajectory: [...prev.personTracking.trajectory, {
              x: (Math.random() - 0.5) * 0.5,
              y: 0,
              z: (Math.random() - 0.5) * 0.5,
              timestamp: Date.now()
            }].slice(-50) // Keep last 50 points
          },
          objectDetection: {
            count: Math.floor(Math.random() * 5),
            suspicious: Math.floor(Math.random() * 2)
          },
          acousticAnalysis: {
            sources: Math.floor(1 + Math.random() * 3),
            anomalies: Math.random() > 0.8 ? 1 : 0
          }
        }));
        
        // Update 3D simulation data
        setSimulation3D(prev => ({
          ...prev,
          totalDuration: sessionTime,
          reconstruction: {
            ...prev.reconstruction,
            personPosition: {
              x: (Math.random() - 0.5) * 0.3,
              y: 0,
              z: (Math.random() - 0.5) * 0.3
            },
            gazeDirection: {
              x: Math.sin(Date.now() / 5000) * 0.3,
              y: Math.sin(Date.now() / 7000) * 0.2,
              z: 1
            }
          }
        }));
        
        // Calculate overall suspicion score
        const eventSeverityScore = cheatingEvents.slice(0, 10).reduce((acc, event) => {
          const severityWeight = { low: 1, medium: 2, high: 4, critical: 6 };
          return acc + severityWeight[event.severity];
        }, 0);
        
        const newSuspicionScore = Math.min(
          Math.floor(
            eventSeverityScore * 3 +
            (spatialAnalysis.objectDetection.suspicious * 15) +
            (spatialAnalysis.acousticAnalysis.anomalies * 20)
          ),
          100
        );
        
        setSuspicionScore(newSuspicionScore);
        
      }, 800); // Every 0.8 seconds for maximum analysis
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, multiCameraSync, sessionTime, cameraFeeds, cheatingEvents]);

  const getEventDescription = (type: CheatingEvent['type'], severity: string): string => {
    const descriptions = {
      looking_away: {
        low: "Brief gaze deviation detected",
        medium: "Extended looking away from screen",
        high: "Prolonged attention diversion - possible external assistance"
      },
      suspicious_object: {
        low: "Unidentified object in frame",
        medium: "Potential unauthorized material detected",
        high: "Prohibited device or material confirmed"
      },
      multiple_people: {
        low: "Additional presence detected briefly",
        medium: "Multiple people in examination area",
        high: "Unauthorized assistance confirmed"
      },
      unusual_behavior: {
        low: "Minor behavioral anomaly",
        medium: "Suspicious movement pattern",
        high: "Highly irregular behavior indicating cheating"
      },
      voice_anomaly: {
        low: "Voice pattern variation",
        medium: "Unusual vocal activity",
        high: "Multiple voices or coaching detected"
      }
    };
    return descriptions[type][severity as keyof typeof descriptions[typeof type]];
  };

  const connectCamera = async (cameraId: string) => {
    try {
      if (cameraId === 'primary') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 }, 
            facingMode: 'user' 
          },
          audio: true
        });
        
        if (primaryVideoRef.current) {
          primaryVideoRef.current.srcObject = stream;
        }
      }
      
      // Update camera status
      setCameraFeeds(prev => prev.map(cam => 
        cam.id === cameraId 
          ? { ...cam, status: 'active', quality: Math.floor(80 + Math.random() * 20), aiProcessing: true }
          : cam
      ));
      
      toast.success(`${cameraFeeds.find(cam => cam.id === cameraId)?.name} connected successfully!`);
    } catch (error) {
      console.error(`Camera ${cameraId} connection failed:`, error);
      setCameraFeeds(prev => prev.map(cam => 
        cam.id === cameraId ? { ...cam, status: 'error' } : cam
      ));
      toast.error(`Failed to connect ${cameraFeeds.find(cam => cam.id === cameraId)?.name}`);
    }
  };

  const startMultiCameraSync = () => {
    setMultiCameraSync(true);
    toast.success("Multi-camera synchronization activated!");
  };

  const startSession = async () => {
    // Connect primary camera first
    await connectCamera('primary');
    
    setIsActive(true);
    startMultiCameraSync();
    setSimulation3D(prev => ({ ...prev, isActive: true }));
    
    toast.success("Advanced 3D simulation session started!");
  };

  const stopSession = () => {
    setIsActive(false);
    setMultiCameraSync(false);
    setSimulation3D(prev => ({ ...prev, isActive: false }));

    // Stop all camera streams
    cameraFeeds.forEach(cam => {
      if (cam.status === 'active') {
        // Stop camera streams here
      }
    });

    setCameraFeeds(prev => prev.map(cam => ({ ...cam, status: 'inactive', aiProcessing: false })));

    const results = {
      level: 5,
      totalTime: sessionTime,
      violations,
      suspicionScore,
      cheatingEvents: cheatingEvents.length,
      camerasUsed: cameraFeeds.filter(cam => cam.status === 'active').length,
      spatialAnalysis,
      simulation3D: {
        eventsRecorded: cheatingEvents.length,
        totalDuration: sessionTime,
        reconstructionQuality: 95
      }
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.success("3D simulation session completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Interactive 3D controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setSimulation3D(prev => {
      const newViewAngle = { ...prev.viewAngle };
      
      if (prev.interactionMode === 'rotate') {
        newViewAngle.y += deltaX * 0.5;
        newViewAngle.x += deltaY * 0.5;
        newViewAngle.x = Math.max(-90, Math.min(90, newViewAngle.x));
      } else if (prev.interactionMode === 'pan') {
        // Pan logic can be implemented here
      }
      
      return {
        ...prev,
        viewAngle: newViewAngle
      };
    });

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
      zoom: Math.max(prev.minZoom, Math.min(prev.maxZoom, prev.zoom * zoomDelta))
    }));
  };

  const selectStudent = (student: Student) => {
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

  const getCameraIcon = (type: CameraFeed['type']) => {
    switch (type) {
      case 'primary': return <Camera className="w-4 h-4" />;
      case 'side': return <Smartphone className="w-4 h-4" />;
      case 'overhead': return <Satellite className="w-4 h-4" />;
      case 'cctv': return <Cctv className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const getEventIcon = (type: CheatingEvent['type']) => {
    switch (type) {
      case 'looking_away': return <Eye className="w-4 h-4" />;
      case 'suspicious_object': return <Target className="w-4 h-4" />;
      case 'multiple_people': return <Users className="w-4 h-4" />;
      case 'unusual_behavior': return <Activity className="w-4 h-4" />;
      case 'voice_anomaly': return <Volume2 className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Level 5 Header - Ultimate AI Proctoring */}
      <Card className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-full">
                <Cube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Level 5: 3D Simulation & CCTV Integration</h2>
                <p className="text-sm text-purple-200">Multi-Camera • 3D Reconstruction • Cheating Simulation • CCTV Network • AI Forensics</p>
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
          <div className="grid grid-cols-7 gap-3 text-center">
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
              <div className="text-lg font-bold text-blue-400">{cheatingEvents.length}</div>
              <div className="text-xs text-purple-200">Events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{cameraFeeds.filter(cam => cam.status === 'active').length}</div>
              <div className="text-xs text-purple-200">Cameras</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{spatialAnalysis.personTracking.confidence}%</div>
              <div className="text-xs text-purple-200">Tracking</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pink-400">{Math.floor(aiProcessingLoad)}%</div>
              <div className="text-xs text-purple-200">AI Load</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Camera Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Multi-Camera Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3 mb-4">
            {cameraFeeds.map((camera) => (
              <div key={camera.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getCameraIcon(camera.type)}
                  <span className="text-sm font-medium">{camera.name}</span>
                  <Badge 
                    variant={camera.status === 'active' ? 'default' : camera.status === 'error' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {camera.status}
                  </Badge>
                </div>
                <Button
                  onClick={() => connectCamera(camera.id)}
                  disabled={camera.status === 'active'}
                  size="sm"
                  className="w-full"
                  variant={camera.status === 'active' ? 'secondary' : 'default'}
                >
                  {camera.status === 'active' ? 'Connected' : 'Connect'}
                </Button>
                {camera.status === 'active' && (
                  <div className="text-xs text-gray-600">
                    Quality: {camera.quality}% | AI: {camera.aiProcessing ? 'ON' : 'OFF'}
                  </div>
                )}
              </div>
            ))}
          </div>

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

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Rotate3d className="w-5 h-5" />
              3D Analysis Interface
            </span>
            <div className="flex gap-2">
              <Button
                variant={activeView === "3d-simulation" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("3d-simulation")}
              >
                <Cube className="w-4 h-4 mr-1" />
                3D Simulation
              </Button>
              <Button
                variant={activeView === "camera-matrix" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("camera-matrix")}
              >
                <Grid3x3 className="w-4 h-4 mr-1" />
                Camera Matrix
              </Button>
              <Button
                variant={activeView === "events-timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("events-timeline")}
              >
                <Clock className="w-4 h-4 mr-1" />
                Events Timeline
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsContent value="3d-simulation" className="space-y-6">
              {/* Student Selection Panel */}
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
                          className={`${
                            simulation3D.selectedStudent?.id === student.id 
                              ? 'bg-indigo-600 text-white' 
                              : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            student.status === 'flagged' ? 'bg-red-500' :
                            student.status === 'suspicious' ? 'bg-orange-500' :
                            student.status === 'active' ? 'bg-green-500' :
                            'bg-gray-400'
                          }`} />
                          {student.name}
                        </Button>
                      ))}
                      <Button onClick={resetView} variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                  {simulation3D.selectedStudent && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{simulation3D.selectedStudent.name}</div>
                          <div className="text-sm text-gray-600">{simulation3D.selectedStudent.currentActivity}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">
                            {simulation3D.selectedStudent.suspicionLevel}%
                          </div>
                          <div className="text-xs text-gray-500">Suspicion Level</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interactive 3D Visualization Area */}
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
                onMouseEnter={() => setIsMouseOver3D(true)}
                onMouseLeave={() => setIsMouseOver3D(false)}
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                
                {/* Interaction Mode Indicator */}
                <div className="absolute top-4 left-4 z-20">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {simulation3D.interactionMode === 'rotate' && <RotateCw className="w-3 h-3 mr-1" />}
                    {simulation3D.interactionMode === 'pan' && <Move className="w-3 h-3 mr-1" />}
                    {simulation3D.interactionMode === 'zoom' && <MousePointer className="w-3 h-3 mr-1" />}
                    {simulation3D.interactionMode.toUpperCase()} MODE
                  </Badge>
                </div>

                {/* Focus Mode Indicator */}
                {simulation3D.focusMode && simulation3D.selectedStudent && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge variant="default" className="bg-indigo-600 animate-pulse">
                      <Target className="w-3 h-3 mr-1" />
                      FOCUSED: {simulation3D.selectedStudent.name}
                    </Badge>
                  </div>
                )}
                
                {/* 3D Scene Simulation */}
                <div 
                  className="relative z-10 h-full flex items-center justify-center"
                  style={{
                    transform: `
                      perspective(1000px) 
                      rotateX(${simulation3D.viewAngle.x}deg) 
                      rotateY(${simulation3D.viewAngle.y}deg) 
                      rotateZ(${simulation3D.viewAngle.z}deg)
                    `
                  }}
                >
                  {simulation3D.isActive ? (
                    <div className="text-center text-white space-y-4 relative">
                      <div className="relative w-80 h-80">
                        {/* Students representation */}
                        {students.map((student, index) => {
                          const isSelected = simulation3D.selectedStudent?.id === student.id;
                          const isFocused = simulation3D.focusMode && isSelected;
                          
                          return (
                            <div key={student.id}>
                              {/* Student avatar */}
                              <div 
                                className={`absolute w-16 h-16 rounded-full transition-all duration-500 cursor-pointer ${
                                  student.status === 'flagged' ? 'bg-red-500 animate-pulse' :
                                  student.status === 'suspicious' ? 'bg-orange-500' :
                                  student.status === 'active' ? 'bg-blue-500' :
                                  'bg-gray-500'
                                } ${isSelected ? 'ring-4 ring-white scale-125' : 'hover:scale-110'}`}
                                style={{
                                  left: `${40 + student.position.x * 50}%`,
                                  top: `${40 + student.position.z * 50}%`,
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: isSelected ? 30 : 20
                                }}
                                onClick={() => selectStudent(student)}
                              >
                                <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-pulse" />
                                
                                {/* Student label */}
                                {simulation3D.showStudentLabels && (
                                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/70 px-2 py-1 rounded whitespace-nowrap">
                                    {student.name}
                                  </div>
                                )}
                                
                                {/* Gaze direction indicator */}
                                {isSelected && (
                                  <div 
                                    className="absolute top-1/2 left-1/2 w-12 h-1 bg-yellow-400 origin-left"
                                    style={{
                                      transform: `translate(-50%, -50%) rotate(${Math.atan2(simulation3D.reconstruction.gazeDirection.y, simulation3D.reconstruction.gazeDirection.x) * 180 / Math.PI}deg)`
                                    }}
                                  />
                                )}
                                
                                {/* Suspicion level indicator */}
                                {student.suspicionLevel > 50 && (
                                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                                    !
                                  </div>
                                )}
                              </div>
                              
                              {/* Movement trajectory for selected student */}
                              {isSelected && simulation3D.showTrajectory && (
                                <svg className="absolute inset-0 pointer-events-none">
                                  <path
                                    d={`M ${40 + student.position.x * 50}% ${40 + student.position.z * 50}% Q ${45 + Math.sin(Date.now() / 1000) * 10}% ${35 + Math.cos(Date.now() / 1000) * 10}% ${50 + student.position.x * 50}% ${45 + student.position.z * 50}%`}
                                    stroke="rgba(59, 130, 246, 0.5)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="5,5"
                                  />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Room boundaries with 3D effect */}
                        <div 
                          className="absolute inset-0 border-2 border-gray-600 border-dashed rounded-lg"
                          style={{
                            transform: 'translateZ(-50px)',
                            opacity: 0.6
                          }}
                        />
                        
                        {/* Camera positions */}
                        {cameraFeeds.filter(cam => cam.status === 'active').map((camera) => (
                          <div
                            key={camera.id}
                            className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white transition-all hover:scale-110"
                            style={{
                              left: `${50 + camera.position.x * 30}%`,
                              top: `${50 + camera.position.z * 30}%`,
                              transform: 'translate(-50%, -50%)',
                              zIndex: 25
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-green-400 bg-black/70 px-2 py-1 rounded whitespace-nowrap">
                              {camera.name}
                            </div>
                            {/* Camera field of view indicator */}
                            <div 
                              className="absolute top-1/2 left-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-green-400/30"
                              style={{
                                transform: `translate(-50%, -50%) rotate(${camera.angle.y}deg)`
                              }}
                            />
                          </div>
                        ))}
                        
                        {/* Recent events visualization with 3D positioning */}
                        {cheatingEvents.slice(0, 8).map((event, index) => (
                          <div
                            key={event.id}
                            className={`absolute w-4 h-4 rounded-full animate-ping cursor-pointer ${
                              event.severity === 'critical' ? 'bg-red-600' :
                              event.severity === 'high' ? 'bg-red-500' :
                              event.severity === 'medium' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}
                            style={{
                              left: `${50 + event.coordinates.x * 40}%`,
                              top: `${50 + event.coordinates.z * 40}%`,
                              animationDelay: `${index * 200}ms`,
                              zIndex: 15
                            }}
                            onClick={() => setSimulation3D(prev => ({ ...prev, selectedEvent: event }))}
                            title={event.description}
                          />
                        ))}
                        
                        {/* Heat map overlay when enabled */}
                        {simulation3D.showHeatmap && (
                          <div className="absolute inset-0 bg-gradient-radial from-red-500/20 via-orange-500/10 to-transparent rounded-lg" />
                        )}
                      </div>
                      
                      <div className="text-lg font-bold">Interactive 3D Simulation</div>
                      <div className="text-sm text-gray-300">
                        Tracking: {spatialAnalysis.personTracking.confidence}% • 
                        Objects: {spatialAnalysis.objectDetection.count} • 
                        Events: {cheatingEvents.length} •
                        Zoom: {Math.round(simulation3D.zoom * 100)}%
                      </div>
                      
                      {isMouseOver3D && (
                        <div className="text-xs text-gray-400 mt-2">
                          🖱️ Drag to rotate • 🎯 Scroll to zoom • 👆 Click students to focus
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Cube className="w-24 h-24 mx-auto mb-4 opacity-50" />
                      <p className="text-xl">Interactive 3D Simulation Ready</p>
                      <p className="text-sm">Start session to begin 3D reconstruction</p>
                    </div>
                  )}
                </div>

                {/* Enhanced 3D Controls */}
                {simulation3D.isActive && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={simulation3D.interactionMode === 'rotate' ? 'default' : 'secondary'}
                        onClick={() => setSimulation3D(prev => ({ ...prev, interactionMode: 'rotate' }))}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={simulation3D.interactionMode === 'pan' ? 'default' : 'secondary'}
                        onClick={() => setSimulation3D(prev => ({ ...prev, interactionMode: 'pan' }))}
                      >
                        <Move className="w-4 h-4" />
                      </Button>
                      <Button onClick={resetView} size="sm" variant="secondary">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-white text-sm bg-black/50 px-3 py-1 rounded">
                      <span>Speed: {simulation3D.playbackSpeed}x</span>
                      <span>Zoom: {Math.round(simulation3D.zoom * 100)}%</span>
                      <span>Angle: {Math.round(simulation3D.viewAngle.y)}°</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Rewind className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <FastForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced 3D Controls Panel */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        View Angle
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-8">X:</span>
                          <Slider
                            value={[simulation3D.viewAngle.x]}
                            onValueChange={([value]) => setSimulation3D(prev => ({
                              ...prev,
                              viewAngle: { ...prev.viewAngle, x: value }
                            }))}
                            min={-90}
                            max={90}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-xs w-10">{Math.round(simulation3D.viewAngle.x)}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-8">Y:</span>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Visual Options
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Trajectory</span>
                          <Button
                            size="sm"
                            variant={simulation3D.showTrajectory ? "default" : "outline"}
                            onClick={() => setSimulation3D(prev => ({
                              ...prev,
                              showTrajectory: !prev.showTrajectory
                            }))}
                          >
                            {simulation3D.showTrajectory ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Heat Map</span>
                          <Button
                            size="sm"
                            variant={simulation3D.showHeatmap ? "default" : "outline"}
                            onClick={() => setSimulation3D(prev => ({
                              ...prev,
                              showHeatmap: !prev.showHeatmap
                            }))}
                          >
                            {simulation3D.showHeatmap ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Labels</span>
                          <Button
                            size="sm"
                            variant={simulation3D.showStudentLabels ? "default" : "outline"}
                            onClick={() => setSimulation3D(prev => ({
                              ...prev,
                              showStudentLabels: !prev.showStudentLabels
                            }))}
                          >
                            {simulation3D.showStudentLabels ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Zoom & Speed
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-12">Speed:</span>
                          <Slider
                            value={[simulation3D.playbackSpeed]}
                            onValueChange={([value]) => setSimulation3D(prev => ({
                              ...prev,
                              playbackSpeed: value
                            }))}
                            min={0.25}
                            max={4}
                            step={0.25}
                            className="flex-1"
                          />
                          <span className="text-xs w-8">{simulation3D.playbackSpeed}x</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-12">Zoom:</span>
                          <Slider
                            value={[simulation3D.zoom]}
                            onValueChange={([value]) => setSimulation3D(prev => ({
                              ...prev,
                              zoom: value
                            }))}
                            min={simulation3D.minZoom}
                            max={simulation3D.maxZoom}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-xs w-8">{Math.round(simulation3D.zoom * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Focus Controls
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Focus Mode</span>
                          <Button
                            size="sm"
                            variant={simulation3D.focusMode ? "default" : "outline"}
                            onClick={() => setSimulation3D(prev => ({
                              ...prev,
                              focusMode: !prev.focusMode
                            }))}
                          >
                            {simulation3D.focusMode ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={resetView}
                          className="w-full"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset View
                        </Button>
                        {simulation3D.selectedStudent && (
                          <div className="text-xs text-center p-2 bg-indigo-50 rounded border">
                            Focused on: <strong>{simulation3D.selectedStudent.name}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="camera-matrix" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cameraFeeds.map((camera) => (
                  <Card key={camera.id} className={`border-2 ${
                    camera.status === 'active' ? 'border-green-500' : 
                    camera.status === 'error' ? 'border-red-500' : 
                    'border-gray-300'
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCameraIcon(camera.type)}
                          <span className="font-medium text-sm">{camera.name}</span>
                        </div>
                        <Badge variant={
                          camera.status === 'active' ? 'default' :
                          camera.status === 'error' ? 'destructive' :
                          'secondary'
                        }>
                          {camera.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                        {camera.status === 'active' ? (
                          <>
                            {camera.id === 'primary' ? (
                              <video
                                ref={primaryVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <div className="text-center text-white">
                                  {getCameraIcon(camera.type)}
                                  <p className="text-xs mt-1">{camera.name}</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-1 left-1">
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                ● LIVE
                              </Badge>
                            </div>
                            {camera.aiProcessing && (
                              <div className="absolute top-1 right-1">
                                <Badge variant="secondary" className="text-xs bg-purple-600">
                                  AI
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              {getCameraIcon(camera.type)}
                              <p className="text-xs mt-1">
                                {camera.status === 'error' ? 'Connection Error' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {camera.status === 'active' && (
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Quality:</span>
                            <span className="font-bold">{camera.quality}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Position:</span>
                            <span>({camera.position.x}, {camera.position.y}, {camera.position.z})</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Angle:</span>
                            <span>({camera.angle.x}°, {camera.angle.y}°, {camera.angle.z}°)</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events-timeline" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Cheating Events Timeline</h3>
                <Badge variant="outline">
                  {cheatingEvents.length} events recorded
                </Badge>
              </div>
              
              {cheatingEvents.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cheatingEvents.map((event) => (
                    <Card key={event.id} className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                      event.severity === 'critical' ? 'border-l-red-600' :
                      event.severity === 'high' ? 'border-l-red-500' :
                      event.severity === 'medium' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    }`}
                    onClick={() => setSimulation3D(prev => ({ ...prev, selectedEvent: event }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              event.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              event.severity === 'high' ? 'bg-red-100 text-red-600' :
                              event.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{event.description}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {event.timestamp.toLocaleTimeString()} • {event.camera} • Duration: {event.duration}s
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Position: ({event.coordinates.x.toFixed(2)}, {event.coordinates.y.toFixed(2)}, {event.coordinates.z?.toFixed(2) || '0'})
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.confidence}% confidence
                            </Badge>
                            <Badge variant={
                              event.severity === 'critical' ? 'destructive' :
                              event.severity === 'high' ? 'destructive' :
                              event.severity === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {event.severity}
                            </Badge>
                          </div>
                        </div>
                        
                        {event.evidenceFrames.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            <span className="text-xs text-gray-500">Evidence:</span>
                            {event.evidenceFrames.map((frame, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                Frame {index + 1}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No events recorded yet</p>
                  <p className="text-sm">Cheating events will appear here during the session</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Spatial Analysis Summary */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{spatialAnalysis.personTracking.confidence}%</div>
              <div className="text-sm text-gray-600">Person Tracking</div>
              <Progress value={spatialAnalysis.personTracking.confidence} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{spatialAnalysis.objectDetection.count}</div>
              <div className="text-sm text-gray-600">Objects Detected</div>
              <div className="text-xs text-red-500 mt-1">
                {spatialAnalysis.objectDetection.suspicious} suspicious
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{spatialAnalysis.acousticAnalysis.sources}</div>
              <div className="text-sm text-gray-600">Audio Sources</div>
              <div className="text-xs text-orange-500 mt-1">
                {spatialAnalysis.acousticAnalysis.anomalies} anomalies
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {spatialAnalysis.roomMapping.width}×{spatialAnalysis.roomMapping.height}×{spatialAnalysis.roomMapping.depth}
              </div>
              <div className="text-sm text-gray-600">Room Mapping (m)</div>
              <div className="text-xs text-green-500 mt-1">Fully mapped</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Level5Component;
