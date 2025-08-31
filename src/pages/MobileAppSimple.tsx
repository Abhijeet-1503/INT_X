import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Signal,
  Battery,
  Volume2,
  Eye,
  RotateCcw,
  FlashlightIcon as Flashlight,
  Grid3x3,
  Zap,
  Download,
  Share,
  Settings
} from "lucide-react";
import { toast } from "sonner";

const MobileAppSimple = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [framesSent, setFramesSent] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState({
    battery: 85,
    orientation: 'portrait' as 'portrait' | 'landscape',
    quality: 'high' as 'low' | 'medium' | 'high'
  });
  const [cameraSettings, setCameraSettings] = useState({
    facingMode: 'environment' as 'user' | 'environment',
    flashlight: false,
    grid: true
  });

  // Get session ID from URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session');
      if (urlSessionId) {
        setSessionId(urlSessionId);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error getting session ID:', error);
    }
  }, []);

  // Initialize camera
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        // Check if camera is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error('Camera not supported on this device');
          return;
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: cameraSettings.facingMode,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: true
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        toast.success('Camera connected!');

      } catch (error) {
        console.error('Camera error:', error);
        toast.error('Please allow camera access');
      }
    };

    // Delay initialization to ensure component is mounted
    const timer = setTimeout(initializeCamera, 1000);
    
    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraSettings.facingMode]);

  // Simulate frame sending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && stream) {
      interval = setInterval(() => {
        setFramesSent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, stream]);

  // Update device info
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(prev => ({
        ...prev,
        battery: Math.max(prev.battery - Math.random() * 2, 20),
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      }));
    };

    const interval = setInterval(updateDeviceInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const switchCamera = () => {
    setCameraSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  };

  const toggleFlashlight = () => {
    setCameraSettings(prev => ({ ...prev, flashlight: !prev.flashlight }));
    toast.info(`Flashlight ${cameraSettings.flashlight ? 'off' : 'on'}`);
  };

  const toggleGrid = () => {
    setCameraSettings(prev => ({ ...prev, grid: !prev.grid }));
  };

  const adjustQuality = () => {
    const qualities = ['low', 'medium', 'high'] as const;
    const currentIndex = qualities.indexOf(deviceInfo.quality);
    const nextQuality = qualities[(currentIndex + 1) % qualities.length];
    setDeviceInfo(prev => ({ ...prev, quality: nextQuality }));
    toast.info(`Quality: ${nextQuality}`);
  };

  const shareSession = () => {
    const text = `SmartProctor-X Mobile Camera - Session: ${sessionId}`;
    if (navigator.share) {
      navigator.share({
        title: 'SmartProctor-X',
        text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-2 bg-black/70 text-sm z-10 relative">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-green-500" />
          <Badge className="bg-green-500 text-xs">Connected</Badge>
        </div>
        <div className="text-xs font-bold">SmartProctor-X Mobile</div>
        <div className="flex items-center gap-2">
          <Battery className={`w-4 h-4 ${getBatteryColor(deviceInfo.battery)}`} />
          <span>{Math.round(deviceInfo.battery)}%</span>
        </div>
      </div>

      {/* Main Camera View */}
      <div className="relative h-screen">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Grid Overlay */}
        {cameraSettings.grid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}
        
        {/* Status Indicators */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-red-500 animate-pulse">
            <CheckCircle className="w-3 h-3 mr-1" />
            RECORDING
          </Badge>
        </div>
        
        {/* Session Info */}
        <div className="absolute top-4 right-4 text-right space-y-1">
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Session: {sessionId.slice(-8)}
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Frames: {framesSent}
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Quality: {deviceInfo.quality.toUpperCase()}
          </div>
        </div>
        
        {/* AI Status */}
        <div className="absolute bottom-32 right-4 space-y-2">
          <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-400" />
            <span>Face: Active</span>
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-green-400" />
            <span>Audio: Recording</span>
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>AI: Processing</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
        <div className="flex justify-center items-center gap-4 mb-3">
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
            onClick={toggleGrid}
            variant={cameraSettings.grid ? "default" : "outline"}
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          {/* Recording Indicator */}
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          
          {/* Flashlight */}
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
            onClick={adjustQuality}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Share Button */}
        <div className="text-center">
          <Button
            onClick={shareSession}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Session
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {isActive && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className="bg-green-600/90 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Connected to Level 4!</span>
            </div>
            <p className="text-sm">Your camera is streaming to SmartProctor-X</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!sessionId && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg text-center max-w-sm">
            <Smartphone className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-bold mb-2">SmartProctor-X Mobile</h2>
            <p className="text-sm text-gray-300 mb-4">
              This mobile camera connects to Level 4 proctoring session.
            </p>
            <p className="text-xs text-gray-400">
              Open this page from Level 4 → Mobile Connection to start.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAppSimple;
