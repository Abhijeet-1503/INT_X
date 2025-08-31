import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle,
  Battery,
  Signal,
  Smartphone
} from "lucide-react";

const MobileAppBasic = () => {
  const [isReady, setIsReady] = React.useState(false);
  const [sessionId, setSessionId] = React.useState('');
  const [cameraActive, setCameraActive] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Simple initialization
  React.useEffect(() => {
    // Get session from URL
    try {
      const params = new URLSearchParams(window.location.search);
      const session = params.get('session');
      if (session) {
        setSessionId(session);
      }
      setIsReady(true);
    } catch (error) {
      console.log('URL parsing error:', error);
      setIsReady(true);
    }
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices) {
        alert('Camera not supported');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.log('Camera error:', error);
      alert('Please allow camera access');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-3 bg-black text-sm">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-green-500" />
          <Badge className="bg-green-500 text-xs">Online</Badge>
        </div>
        <div className="font-bold">SmartProctor-X Mobile</div>
        <div className="flex items-center gap-1">
          <Battery className="w-4 h-4 text-green-500" />
          <span className="text-xs">85%</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Session Info */}
        {sessionId && (
          <div className="mb-4 p-3 bg-blue-600 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Connected to Level 4</span>
            </div>
            <p className="text-sm">Session: {sessionId.slice(-8)}</p>
          </div>
        )}

        {/* Camera Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Mobile Camera</h2>
            <p className="text-gray-300 text-sm mb-4">
              Your camera will stream to SmartProctor-X Level 4
            </p>
          </div>

          {/* Video Display */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera not active</p>
                </div>
              </div>
            )}
            
            {cameraActive && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-red-500 animate-pulse text-xs">
                  ● RECORDING
                </Badge>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {!cameraActive ? (
              <Button 
                onClick={startCamera}
                className="bg-green-600 hover:bg-green-700 px-6"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button 
                onClick={stopCamera}
                variant="destructive"
                className="px-6"
              >
                Stop Camera
              </Button>
            )}
          </div>

          {/* Status */}
          {cameraActive && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Streaming to Level 4</span>
                </div>
                <div className="text-xs text-gray-400">
                  AI analysis is processing your video feed
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>1. Tap "Start Camera" to begin</li>
            <li>2. Allow camera permissions</li>
            <li>3. Keep your phone steady</li>
            <li>4. Your video appears in Level 4</li>
          </ul>
        </div>

        {/* App Info */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">SmartProctor-X Mobile Camera</span>
          </div>
          <p className="text-xs text-gray-400">
            Professional AI proctoring solution
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileAppBasic;
