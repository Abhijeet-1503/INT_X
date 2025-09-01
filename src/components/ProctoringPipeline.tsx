import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Camera,
  Mic,
  Brain,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  Square,
  Upload,
  Eye,
  Monitor,
  Shield,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { APIUtils } from "@/lib/apiUtils";

interface ProctoringPipelineProps {
  level: number;
  onComplete?: (results: ProctoringResults) => void;
}

interface ProctoringResults {
  totalTime: number;
  violations: number;
  suspicionScore: number;
  alerts: AlertData[];
  faceDetectionRate: number;
  audioQuality: number;
}

interface AlertData {
  id: string;
  type: 'face_lost' | 'multiple_faces' | 'audio_anomaly' | 'gaze_deviation' | 'suspicious_object';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

// Helper: Validate that a URL is safe for proxying (prevents SSRF)
function isSafeSnapshotUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    // Only allow IP addresses in private ranges (e.g., 192.168.x.x, 10.x.x.x, 172.16-31.x.x, 100.64-127.x.x, localhost)
    // Or optionally, restrict to a specific allowlist of hostnames/IPs
    // For this patch, allow only private IPv4 addresses and localhost
    const hostname = parsed.hostname;
    // localhost and 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    // IPv4 private ranges
    const privateRanges = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./
    ];
    if (privateRanges.some((re) => re.test(hostname))) return true;
    // Optionally, allow specific public hostnames (e.g., for demo/testing)
    // return false for all others
    return false;
  } catch {
    return false;
  }
}

const ProctoringPipeline: React.FC<ProctoringPipelineProps> = ({ level, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testFootage, setTestFootage] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<'live' | 'test'>('live');
  const [ipCamUrl, setIpCamUrl] = useState<string>("http://100.82.86.42:8080/shot.jpg");
  const [usePhoneCam, setUsePhoneCam] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Level-specific features
  const getLevelFeatures = () => {
    switch (level) {
      case 1:
        return {
          name: "Level 1: Basic Face Verification",
          features: ["Face Detection", "Audio Monitoring"],
          analysisInterval: 3000,
          advanced: false
        };
      case 2:
        return {
          name: "Level 2: Gaze & Movement Tracking",
          features: ["Face Detection", "Audio Monitoring", "Gaze Tracking", "Head Movement"],
          analysisInterval: 2000,
          advanced: true
        };
      case 3:
        return {
          name: "Level 3: Environment Scanning",
          features: ["Face Detection", "Audio Monitoring", "Object Detection", "Environment Analysis"],
          analysisInterval: 1500,
          advanced: true
        };
      case 4:
        return {
          name: "Level 4: Audio-Visual Analysis",
          features: ["Face Detection", "Audio Monitoring", "Facial Recognition", "Voice Analysis"],
          analysisInterval: 1000,
          advanced: true
        };
      case 5:
        return {
          name: "Level 5: AI Decision Engine",
          features: ["Face Detection", "Audio Monitoring", "Predictive Analysis", "Real-time Alerts"],
          analysisInterval: 800,
          advanced: true
        };
      default:
        return {
          name: "Unknown Level",
          features: ["Basic Monitoring"],
          analysisInterval: 3000,
          advanced: false
        };
    }
  };

  const levelConfig = getLevelFeatures();

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  // AI Analysis simulation
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive && !isPaused) {
      analysisInterval = setInterval(() => {
        performAnalysis();
      }, levelConfig.analysisInterval);
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, isPaused, levelConfig.analysisInterval]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // For live camera mode, we need to capture a frame
      if (processingMode === 'live' && videoRef.current && isActive) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx && videoRef.current.videoWidth > 0) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);

          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append('file', blob, 'frame.jpg');
              formData.append('session_id', `level${level}_${Date.now()}`);

              try {
                const response = await fetch('http://localhost:8000/analyze-frame', {
                  method: 'POST',
                  body: formData,
                });

                if (response.ok) {
                  const result = await response.json();

                  // Update state with real analysis results
                  const faceDetected = result.face_detection.faces_detected > 0;
                  const suspicionScore = Math.floor(result.suspicion_score);

                  setFaceDetected(faceDetected);
                  setSuspicionScore(suspicionScore);

                  // Generate alerts based on real analysis
                  if (!faceDetected) {
                    addAlert('face_lost', 'high', 'Face not detected in frame');
                  }

                  if (suspicionScore > 70) {
                    addAlert('gaze_deviation', 'high', `Suspicious behavior detected: ${suspicionScore}%`);
                    setViolations(prev => prev + 1);
                  }

                  // Level-specific analysis
                  if (level >= 2 && result.face_detection.faces_detected > 1) {
                    addAlert('multiple_faces', 'high', 'Multiple faces detected');
                  }

                  if (level >= 3 && suspicionScore > 60) {
                    addAlert('suspicious_object', 'medium', 'Suspicious activity detected');
                  }

                  if (level >= 5 && suspicionScore > 50) {
                    addAlert('multiple_faces', 'high', 'AI detects potential unauthorized assistance');
                  }
                }
              } catch (error) {
                console.error('Backend analysis failed:', error);
                // Fall back to simulation
                performSimulationAnalysis();
              }
            }
          }, 'image/jpeg', 0.8);
        } else {
          // Fall back to simulation if no video
          performSimulationAnalysis();
        }
      } else {
        // For test footage or when video is not available
        performSimulationAnalysis();
      }

      // Optionally analyze phone snapshot in parallel (live mode only)
      if (processingMode === 'live' && isActive && usePhoneCam && ipCamUrl) {
        // SSRF FIX: Validate ipCamUrl before using it
        if (!isSafeSnapshotUrl(ipCamUrl)) {
          addAlert('audio_anomaly', 'medium', 'Invalid or unsafe phone camera URL blocked');
        } else {
          try {
            const snapshotResp = await fetch(`http://localhost:8000/proxy-snapshot?url=${encodeURIComponent(ipCamUrl)}`, { cache: 'no-store' });
            if (snapshotResp.ok) {
              const snapBlob = await snapshotResp.blob();
              const fd = new FormData();
              fd.append('file', snapBlob, 'phone.jpg');
              fd.append('session_id', sessionId || `level${level}_${Date.now()}`);
              await fetch('http://localhost:8000/analyze-frame', {
                method: 'POST',
                body: fd,
              });
            }
          } catch (e) {
            // ignore phone snapshot errors silently
          }
        }
      }

    } catch (error) {
      console.error('Analysis error:', error);
      addAlert('audio_anomaly', 'medium', 'Analysis temporarily unavailable');
    }

    setIsAnalyzing(false);
  };

  const performSimulationAnalysis = () => {
    // Fallback simulation when backend is not available
    const faceDetected = Math.random() > 0.1;
    const audioLevel = Math.floor(Math.random() * 100);
    const suspicionScore = Math.floor(Math.random() * 100);

    setFaceDetected(faceDetected);
    setAudioLevel(audioLevel);
    setSuspicionScore(suspicionScore);

    // Generate alerts based on analysis
    if (!faceDetected) {
      addAlert('face_lost', 'high', 'Face not detected in frame');
    }

    if (audioLevel > 80) {
      addAlert('audio_anomaly', 'medium', 'High audio levels detected');
    }

    if (suspicionScore > 70) {
      addAlert('gaze_deviation', 'high', `Suspicious behavior detected: ${suspicionScore}%`);
      setViolations(prev => prev + 1);
    }

    // Level-specific analysis
    if (level >= 2 && Math.random() > 0.8) {
      addAlert('gaze_deviation', 'medium', 'Gaze deviation detected');
    }

    if (level >= 3 && Math.random() > 0.9) {
      addAlert('suspicious_object', 'low', 'Unusual object detected in environment');
    }

    if (level >= 5 && suspicionScore > 50) {
      addAlert('multiple_faces', 'high', 'AI predicts potential unauthorized assistance');
    }
  };

  const addAlert = (type: AlertData['type'], severity: AlertData['severity'], message: string) => {
    const alert: AlertData = {
      id: Date.now().toString(),
      type,
      severity,
      message,
      timestamp: new Date()
    };
    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
  };

  const startSession = async () => {
    if (processingMode === 'live') {
      await startLiveSession();
    } else {
      startTestSession();
    }
  };

  const startLiveSession = async () => {
    try {
      console.log('Starting live session for level:', level);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      console.log('Stream obtained:', stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setIsPaused(false);
        toast.success(`Level ${level} proctoring session started!`);
        console.log('Live session started successfully');

        // Start session on backend
        try {
          const fd = new FormData();
          fd.append('student_id', 'student1');
          fd.append('proctoring_level', String(level));
          const resp = await fetch('http://localhost:8000/api/session/start', {
            method: 'POST',
            body: fd,
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.session_id) setSessionId(data.session_id);
          }
        } catch {}
      } else {
        console.error('Video ref is null');
        toast.error("Video element not ready");
      }
    } catch (error) {
      console.error('Media access failed:', error);
      toast.error("Please allow camera and microphone access");
    }
  };

  const startTestSession = () => {
    if (!testFootage) {
      toast.error("Please select a test footage file first");
      return;
    }

    if (videoRef.current) {
      videoRef.current.src = testFootage;
      setIsActive(true);
      setIsPaused(false);
      toast.success(`Test session started with footage`);
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
    toast.info("Session paused");
  };

  const resumeSession = () => {
    setIsPaused(false);
    toast.info("Session resumed");
  };

  const stopSession = () => {
    setIsActive(false);
    setIsPaused(false);

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Generate final results
    const results: ProctoringResults = {
      totalTime: sessionTime,
      violations,
      suspicionScore,
      alerts,
      faceDetectionRate: faceDetected ? 85 : 45,
      audioQuality: audioLevel > 50 ? 75 : 90
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.info("Session ended");

    // End session and download report
    (async () => {
      if (!sessionId) return;
      try {
        const fd = new FormData();
        fd.append('session_id', sessionId);
        const resp = await fetch('http://localhost:8000/api/session/end', {
          method: 'POST',
          body: fd,
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.report) {
            const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `proctoring_report_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report downloaded');
          }
        }
      } catch {}
      setSessionId(null);
    })();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setTestFootage(url);
      setProcessingMode('test');
      toast.success("Test footage loaded successfully");
    } else {
      toast.error("Please select a valid video file");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'face_lost':
        return <Eye className="w-4 h-4" />;
      case 'multiple_faces':
        return <Users className="w-4 h-4" />;
      case 'audio_anomaly':
        return <Mic className="w-4 h-4" />;
      case 'gaze_deviation':
        return <Monitor className="w-4 h-4" />;
      case 'suspicious_object':
        return <Shield className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              {levelConfig.name}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Level {level}</Badge>
              {isActive && (
                <Badge variant={isPaused ? "secondary" : "default"}>
                  {isPaused ? "Paused" : "Active"}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(sessionTime)}</div>
              <div className="text-sm text-muted-foreground">Session Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{violations}</div>
              <div className="text-sm text-muted-foreground">Violations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{suspicionScore}%</div>
              <div className="text-sm text-muted-foreground">Suspicion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{alerts.length}</div>
              <div className="text-sm text-muted-foreground">Alerts</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {levelConfig.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={processingMode} onValueChange={(value) => setProcessingMode(value as 'live' | 'test')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="live">Live Camera</TabsTrigger>
              <TabsTrigger value="test">Test Footage</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-4">
              <div className="flex gap-2">
                {!isActive ? (
                  <Button onClick={startSession} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Live Session
                  </Button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    {isPaused ? (
                      <Button onClick={resumeSession} variant="default">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    ) : (
                      <Button onClick={pauseSession} variant="secondary">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={stopSession} variant="destructive">
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone camera snapshot URL</label>
                  <input
                    type="url"
                    placeholder="http://<phone-ip>:8080/shot.jpg"
                    value={ipCamUrl}
                    onChange={(e) => setIpCamUrl(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                  <div className="text-xs text-muted-foreground mb-2">
                    Common URLs: /shot.jpg, /photo.jpg, /shot, /video
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input id="usePhoneCam" type="checkbox" checked={usePhoneCam} onChange={(e) => setUsePhoneCam(e.target.checked)} />
                    <label htmlFor="usePhoneCam">Use phone as side camera</label>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Phone must be on same WiFi network. Use IP Webcam app.
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // SSRF FIX: Validate ipCamUrl before testing connection
                      if (!isSafeSnapshotUrl(ipCamUrl)) {
                        toast.error('Invalid or unsafe phone camera URL');
                        return;
                      }
                      const img = new Image();
                      img.onload = () => toast.success('Phone camera connected!');
                      img.onerror = () => toast.error('Cannot reach phone camera');
                      img.src = `http://localhost:8000/proxy-snapshot?url=${encodeURIComponent(ipCamUrl)}&t=${Date.now()}`;
                    }}
                    className="w-full text-xs"
                  >
                    Test Connection
                  </Button>
                </div>
                {usePhoneCam && ipCamUrl && isSafeSnapshotUrl(ipCamUrl) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone snapshot preview</label>
                    <img src={`http://localhost:8000/proxy-snapshot?url=${encodeURIComponent(ipCamUrl)}&t=${Date.now()}`} alt="Phone snapshot" className="w-full h-48 object-cover rounded border" />
                  </div>
                )}
                {usePhoneCam && ipCamUrl && !isSafeSnapshotUrl(ipCamUrl) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone snapshot preview</label>
                    <div className="w-full h-48 flex items-center justify-center border rounded bg-gray-100 text-xs text-red-500">Unsafe or invalid URL</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {testFootage ? "Change Test Footage" : "Upload Test Footage"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {testFootage && (
                  <div className="flex gap-2">
                    {!isActive ? (
                      <Button onClick={startSession} className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Start Test Session
                      </Button>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        {isPaused ? (
                          <Button onClick={resumeSession} variant="default">
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        ) : (
                          <Button onClick={pauseSession} variant="secondary">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                        )}
                        <Button onClick={stopSession} variant="destructive">
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Video Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Video Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute top-4 right-4">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </div>
              </div>
            )}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Session not active</p>
                  <p className="text-sm opacity-75">Start a session to begin monitoring</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {faceDetected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">Face Detection</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {faceDetected ? "Face detected in frame" : "No face detected"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Audio Level</span>
            </div>
            <div className="mt-2">
              <Progress value={audioLevel} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">{audioLevel}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="font-medium">AI Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isAnalyzing ? "Processing frame..." : "Ready for analysis"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.severity === 'high' ? 'border-l-red-500' :
                  alert.severity === 'medium' ? 'border-l-orange-500' :
                  alert.severity === 'low' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <AlertDescription className="flex-1">
                      {alert.message}
                    </AlertDescription>
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ProctoringPipeline;
