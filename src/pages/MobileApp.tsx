import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Smartphone,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Signal,
  Battery,
  Volume2,
  Eye,
  Settings,
  RotateCcw,
  FlashlightIcon as Flashlight,
  Grid3x3,
  Zap,
  Download,
  Share
} from "lucide-react";
import { toast } from "sonner";
import { mobileApiService, captureVideoFrame, getDeviceInfo, type CameraFrame } from "@/services/mobileApi";

const MobileApp = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [deviceId] = useState(`mobile_${Date.now()}`);
  const [framesSent, setFramesSent] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState({
    battery: 85,
    signal: 92,
    orientation: 'portrait' as 'portrait' | 'landscape',
    quality: 'high' as 'low' | 'medium' | 'high'
  });
  const [cameraSettings, setCameraSettings] = useState({
    facingMode: 'environment' as 'user' | 'environment',
    flashlight: false,
    grid: true
  });
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        if (window.removeEventListener) {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
      };
    }
  }, []);

  // Initialize camera and connection
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device');
        }

        // Get camera access
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: cameraSettings.facingMode,
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            frameRate: { ideal: 30, min: 10 }
          },
          audio: true
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        toast.success('Camera access granted!');

        // Auto-connect if session ID is provided in URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const urlSessionId = urlParams.get('session');
          if (urlSessionId) {
            setSessionId(urlSessionId);
            await connectToLevel4(urlSessionId);
          }
        }

      } catch (error) {
        console.error('Failed to initialize camera:', error);
        toast.error('Camera access denied. Please allow camera permissions.');
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeApp();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      mobileApiService.disconnect();
    };
  }, [cameraSettings.facingMode]);

  // Send camera frames periodically when connected
  useEffect(() => {
    let frameInterval: NodeJS.Timeout;

    if (isConnected && videoRef.current && stream) {
      frameInterval = setInterval(() => {
        if (videoRef.current) {
          const frameData = captureVideoFrame(videoRef.current);
          if (frameData) {
            const frame: CameraFrame = {
              sessionId,
              deviceId,
              timestamp: Date.now(),
              frameData,
              deviceInfo: {
                battery: deviceInfo.battery,
                orientation: deviceInfo.orientation,
                quality: deviceInfo.quality
              }
            };

            mobileApiService.sendCameraFrame(frame);
            setFramesSent(prev => prev + 1);
          }
        }
      }, 1000); // Send frame every second
    }

    return () => {
      if (frameInterval) clearInterval(frameInterval);
    };
  }, [isConnected, sessionId, deviceId, deviceInfo, stream]);

  // Update device info periodically
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const info = getDeviceInfo();
      setDeviceInfo(prev => ({
        ...prev,
        battery: info.battery,
        orientation: info.orientation as 'portrait' | 'landscape'
      }));
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  // Connect to Level 4 session
  const connectToLevel4 = async (sessionIdToConnect: string) => {
    setIsConnecting(true);
    try {
      const connected = await mobileApiService.connectToSession(sessionIdToConnect, deviceId);
      if (connected) {
        setIsConnected(true);
        toast.success('Connected to Level 4 session!');
      } else {
        toast.error('Failed to connect to Level 4');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Connection failed. Using offline mode.');
      // Enable offline mode for demo
      setIsConnected(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // Install PWA
  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Switch camera
  const switchCamera = () => {
    setCameraSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  };

  // Toggle flashlight (mock)
  const toggleFlashlight = () => {
    setCameraSettings(prev => ({ ...prev, flashlight: !prev.flashlight }));
    toast.info(`Flashlight ${cameraSettings.flashlight ? 'disabled' : 'enabled'}`);
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-2 bg-black/50 text-sm">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-green-500" />
          <span>WiFi</span>
          {isConnected ? (
            <Badge className="bg-green-500 text-xs">Connected</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Offline</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">SmartProctor-X Mobile</span>
        </div>
        <div className="flex items-center gap-2">
          <Battery className={`w-4 h-4 ${getBatteryColor(deviceInfo.battery)}`} />
          <span>{Math.round(deviceInfo.battery)}%</span>
        </div>
      </div>

      {/* Install App Banner */}
      {isInstallable && (
        <div className="p-3 bg-blue-600 text-center">
          <div className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-sm">Install ProctorCam for better performance</span>
            <Button size="sm" variant="secondary" onClick={installApp}>
              Install
            </Button>
          </div>
        </div>
      )}

      {/* Connection Setup */}
      {!isConnected && (
        <div className="p-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Connect to Level 4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session ID</label>
                  <input
                    type="text"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Enter session ID from Level 4"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <Button
                  onClick={() => connectToLevel4(sessionId)}
                  disabled={!sessionId || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? 'Connecting...' : 'Connect to Level 4'}
                </Button>
                <div className="text-xs text-gray-400 text-center">
                  Or scan QR code from Level 4 → Mobile Connection tab
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Camera View */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-screen object-cover"
        />
        
        {/* Grid Overlay */}
        {cameraSettings.grid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        <div className="absolute top-4 left-4">
          <Badge 
            className={
              isConnected ? 'bg-green-500 animate-pulse' :
              isConnecting ? 'bg-yellow-500' :
              'bg-red-500'
            }
          >
            {isConnected && <CheckCircle className="w-3 h-3 mr-1" />}
            {isConnecting ? 'CONNECTING' : isConnected ? 'LIVE' : 'OFFLINE'}
          </Badge>
        </div>
        
        {/* Stats */}
        <div className="absolute top-4 right-4 text-right space-y-1">
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Device: {deviceId.slice(-8)}
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Frames: {framesSent}
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Quality: {deviceInfo.quality.toUpperCase()}
          </div>
        </div>
        
        {/* AI Analysis Indicators */}
        <div className="absolute bottom-32 right-4">
          <div className="space-y-2">
            <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-400" />
              <span>Face: {isConnected ? 'Detecting' : 'Offline'}</span>
            </div>
            <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-green-400" />
              <span>Audio: {stream?.getAudioTracks().length ? 'Active' : 'Off'}</span>
            </div>
            <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>AI: {isConnected ? 'Processing' : 'Standby'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
        <div className="flex justify-center items-center gap-4">
          {/* Camera Switch */}
          <Button
            onClick={switchCamera}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          {/* Grid Toggle */}
          <Button
            onClick={() => setCameraSettings(prev => ({ ...prev, grid: !prev.grid }))}
            variant={cameraSettings.grid ? "default" : "outline"}
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          {/* Main Recording Indicator */}
          <div className={`w-16 h-16 ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} rounded-full flex items-center justify-center`}>
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          
          {/* Flashlight Toggle */}
          <Button
            onClick={toggleFlashlight}
            variant={cameraSettings.flashlight ? "default" : "outline"}
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Flashlight className="w-4 h-4" />
          </Button>
          
          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
            onClick={() => {
              const quality = deviceInfo.quality === 'high' ? 'medium' : deviceInfo.quality === 'medium' ? 'low' : 'high';
              setDeviceInfo(prev => ({ ...prev, quality }));
              toast.info(`Quality: ${quality}`);
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Share Session */}
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'SmartProctor-X Mobile Camera',
                  text: `Join session: ${sessionId}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }
            }}
          >
            <Share className="w-4 h-4 mr-2" />
            Share Session
          </Button>
        </div>
      </div>

      {/* Connection Instructions */}
      {!isConnected && !isConnecting && (
        <div className="absolute top-20 left-4 right-4">
          <Alert className="bg-blue-900/90 border-blue-500">
            <Smartphone className="w-4 h-4" />
            <AlertDescription className="text-white">
              <strong>Quick Setup:</strong>
              <br />1. Get Session ID from Level 4 → Mobile Connection tab
              <br />2. Enter Session ID above and tap Connect
              <br />3. Your camera will appear in Level 4 → Cameras tab
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default MobileApp;
