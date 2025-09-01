import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Monitor, Users, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const StartSession = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<string>("initializing");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const openCamera = async () => {
      try {
        console.log('🎥 Starting Enhanced Camera Initialization...');
        setCameraStatus("requesting-permission");

        // Enhanced browser compatibility check
        if (!navigator.mediaDevices) {
          throw new Error("Media devices API not supported");
        }

        if (!navigator.mediaDevices.getUserMedia) {
          // Fallback for older browsers
          navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia ||
            (navigator as any).msGetUserMedia;
        }

        if (!navigator.mediaDevices.getUserMedia) {
          throw new Error("getUserMedia not supported");
        }

        // Check for available devices first
        console.log('🔍 Checking available camera devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
          throw new Error("No camera devices found");
        }

        console.log(`📹 Found ${videoDevices.length} camera(s):`, videoDevices.map(d => d.label || 'Unknown Camera'));

        // Enhanced camera constraints with fallback options
        const cameraConstraints = [
          // High quality primary
          {
            video: {
              deviceId: videoDevices[0].deviceId ? { exact: videoDevices[0].deviceId } : undefined,
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
              frameRate: { ideal: 30, min: 15 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          },
          // Medium quality fallback
          {
            video: {
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              frameRate: { ideal: 25, min: 10 }
            },
            audio: true
          },
          // Low quality fallback
          {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: true
          }
        ];

        let stream: MediaStream | null = null;
        let lastError: Error | null = null;

        // Try constraints in order until one works
        for (const constraints of cameraConstraints) {
          try {
            console.log('📷 Attempting camera access with constraints:', constraints);
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Camera stream obtained successfully');
            break;
          } catch (err) {
            console.warn('⚠️ Camera constraint failed:', err);
            lastError = err as Error;
            continue;
          }
        }

        if (!stream) {
          throw lastError || new Error("Failed to obtain camera stream");
        }

        // Enhanced stream validation
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        console.log(`🎬 Video tracks: ${videoTracks.length}, Audio tracks: ${audioTracks.length}`);

        if (videoTracks.length === 0) {
          throw new Error("No video track available");
        }

        // Get camera capabilities and settings
        const videoTrack = videoTracks[0];
        const capabilities = videoTrack.getCapabilities?.();
        const settings = videoTrack.getSettings?.();

        console.log('📊 Camera Capabilities:', capabilities);
        console.log('⚙️ Camera Settings:', settings);

        if (mounted && videoRef.current) {
          console.log('🔧 Setting up video element...');
          videoRef.current.srcObject = stream;

          // Enhanced video element setup
          videoRef.current.volume = 0; // Mute to prevent feedback
          videoRef.current.playsInline = true; // Better mobile support
          videoRef.current.muted = true; // Prevent audio feedback

          // Wait for video to be ready
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Video load timeout')), 10000);

            videoRef.current!.onloadedmetadata = () => {
              clearTimeout(timeout);
              console.log('📼 Video metadata loaded, dimensions:', videoRef.current!.videoWidth, 'x', videoRef.current!.videoHeight);
              resolve(void 0);
            };

            videoRef.current!.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Video element error'));
            };
          });

          setCameraStatus("camera-active");
          setPermissionGranted(true);
          console.log('🎉 Camera setup complete with enhanced quality!');
        }

      } catch (err: any) {
        console.error('❌ Camera access error:', err);

        if (mounted) {
          // Enhanced error handling with retry logic
          if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
            setCameraStatus("permission-denied");
            console.log('🔒 Camera permission denied by user');
          } else if (err.name === 'NotFoundError' || err.message.includes('found')) {
            setCameraStatus("no-camera");
            console.log('📷 No camera device found');
          } else if (err.name === 'NotReadableError' || err.message.includes('busy')) {
            // Camera might be in use by another application
            if (retryCount < maxRetries) {
              console.log(`🔄 Camera busy, retrying... (${retryCount + 1}/${maxRetries})`);
              retryCount++;
              setTimeout(() => openCamera(), 2000);
              return;
            }
            setCameraStatus("error");
            console.log('📷 Camera unavailable (possibly in use by another app)');
          } else {
            setCameraStatus("error");
            console.log('⚠️ Camera error:', err.message);
          }
          setPermissionGranted(false);
        }
      }
    };

    // Enhanced initialization with better timing
    const initTimer = setTimeout(() => {
      openCamera();
    }, 500); // Slightly longer delay for better stability

    return () => {
      mounted = false;
      clearTimeout(initTimer);

      // Enhanced cleanup
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        console.log('🧹 Cleaning up camera tracks...');
        tracks.forEach(track => {
          track.stop();
          console.log(`🛑 Stopped ${track.kind} track: ${track.label}`);
        });
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const startProctoring = (level: number) => {
    console.log(`Starting proctoring level ${level}`);
    console.log('Navigating to:', `/level${level}`);
    navigate(`/level${level}`);
  };

  const getStatusIcon = () => {
    switch (cameraStatus) {
      case "camera-active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "permission-denied":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "no-camera":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Camera className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (cameraStatus) {
      case "initializing":
        return "Initializing camera...";
      case "requesting-permission":
        return "Requesting camera permission...";
      case "camera-active":
        return "Camera ready - You can start proctoring";
      case "permission-denied":
        return "Camera permission denied - Please allow camera access in your browser settings";
      case "no-camera":
        return "No camera found - Please check your camera connection";
      case "error":
        return "Camera error - Please refresh and try again";
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Start Your Proctoring Session</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your proctoring level and begin secure exam monitoring
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Camera Setup */}
          <div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {getStatusIcon()}
                    <span className="font-medium">{getStatusText()}</span>
                  </div>

                  {/* Video Preview */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {permissionGranted ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Camera preview will appear here</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Please allow camera access to continue
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!permissionGranted && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Camera Access Required</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please allow camera and microphone access to start proctoring
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proctoring Levels */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Choose Proctoring Level</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <Card key={level} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">L{level}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Level {level} Proctoring</h3>
                          <p className="text-sm text-muted-foreground">
                            {level === 1 && "Basic face verification and audio monitoring"}
                            {level === 2 && "Gaze tracking and head movement analysis"}
                            {level === 3 && "Environment scanning and object detection"}
                            {level === 4 && "Audio-visual analysis and facial recognition"}
                            {level === 5 && "AI decision engine and predictive analysis"}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => startProctoring(level)}
                        disabled={!isAuthenticated}
                        className="ml-4"
                      >
                        Start Level {level}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Admin Panel Access */}
            <Card className="mt-8 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Monitor className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">Admin Panel</h3>
                      <p className="text-sm text-muted-foreground">
                        Access the admin dashboard for comprehensive monitoring
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/admin">
                      Open Admin Panel
                      <Users className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSession;
