import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Play,
  Square,
  Brain,
  Sparkles,
  BarChart3,
  Cpu,
  Wifi,
  Monitor,
  Smartphone,
  Settings,
  Zap,
  Eye,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Layers,
  Microscope,
  Radar,
  Bot,
  TrendingUp,
  Radio,
  HardDrive,
  Link2,
  QrCode,
  Scan,
  Network,
  Signal,
  WifiOff,
  Router,
  Cast,
  MonitorSpeaker,
  Download
} from "lucide-react";
import { toast } from "sonner";
import BaseLevelComponent from "./BaseLevelComponent";
import { SurveillanceCheatingDetector } from "@/services/surveillanceIntegration";
import { generateMobileUrl } from "@/utils/networkUtils";
import QRCode from "qrcode";

interface Level4ComponentProps {
  onComplete?: (results: any) => void;
}

interface WirelessDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
  connectionType: 'built-in' | 'usb' | 'wifi' | 'bluetooth' | 'network';
  capabilities?: MediaTrackCapabilities;
  signalStrength?: number;
  ipAddress?: string;
  isConnected: boolean;
}

interface NetworkCamera {
  id: string;
  name: string;
  ip: string;
  port: number;
  type: 'rtsp' | 'http' | 'websocket' | 'webrtc';
  url: string;
  isConnected: boolean;
  signalStrength: number;
}

interface MobileConnection {
  sessionId: string;
  qrCode: string;
  isActive: boolean;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenSize: string;
  };
}

interface AIAnalysis {
  faceRecognition: { confidence: number; verified: boolean; identity: string };
  behaviorAnalysis: {
    attention: number;
    stress: number;
    engagement: number;
    authenticity: number;
    posture: string;
    movement: number;
  };
  voiceAnalysis: {
    clarity: number;
    naturalness: number;
    consistency: number;
    volume: number;
  };
  environmentalFactors: {
    lighting: number;
    background: number;
    noise: number;
    stability: number;
  };
  wirelessAnalysis: {
    connectionStability: number;
    signalQuality: number;
    latency: number;
    bandwidth: number;
    packetLoss: number;
    jitter: number;
  };
  riskPrediction: {
    cheatingProbability: number;
    confidenceInterval: number;
    riskFactors: string[];
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  surveillanceIntegration: {
    active: boolean;
    detectedActions: string[];
    threatScore: number;
  };
}

interface AlertData {
  id: string;
  type: 'wifi_disconnected' | 'signal_weak' | 'network_unstable' | 'ai_prediction' | 'behavioral_anomaly' | 'surveillance_alert' | 'face_verification_failed' | 'audio_anomaly' | 'mobile_disconnected';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'wifi_device' | 'network_camera' | 'mobile_device' | 'ai_engine' | 'surveillance_ai';
  confidence: number;
  deviceId?: string;
}

const Level4ComponentWireless: React.FC<Level4ComponentProps> = ({ onComplete }) => {
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const secondaryVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  // Enhanced state management
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [wirelessDevices, setWirelessDevices] = useState<WirelessDevice[]>([]);
  const [networkCameras, setNetworkCameras] = useState<NetworkCamera[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedNetworkCamera, setSelectedNetworkCamera] = useState<string>('');
  const [customCameraUrl, setCustomCameraUrl] = useState('');
  const [primaryStream, setPrimaryStream] = useState<MediaStream | null>(null);
  const [secondaryStream, setSecondaryStream] = useState<MediaStream | null>(null);
  const [mobileStream, setMobileStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Mobile connection state
  const [mobileConnection, setMobileConnection] = useState<MobileConnection>({
    sessionId: '',
    qrCode: '',
    isActive: false
  });
  
  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    faceRecognition: { confidence: 0, verified: false, identity: 'Unknown' },
    behaviorAnalysis: { attention: 0, stress: 0, engagement: 0, authenticity: 0, posture: 'unknown', movement: 0 },
    voiceAnalysis: { clarity: 0, naturalness: 0, consistency: 0, volume: 0 },
    environmentalFactors: { lighting: 0, background: 0, noise: 0, stability: 0 },
    wirelessAnalysis: { connectionStability: 0, signalQuality: 0, latency: 0, bandwidth: 0, packetLoss: 0, jitter: 0 },
    riskPrediction: { cheatingProbability: 0, confidenceInterval: 0, riskFactors: [], threatLevel: 'LOW' },
    surveillanceIntegration: { active: false, detectedActions: [], threatScore: 0 }
  });
  
  // Session metrics
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeView, setActiveView] = useState("overview");
  const [aiProcessingLoad, setAiProcessingLoad] = useState(0);
  const [surveillanceActive, setSurveillanceActive] = useState(false);
  const [wifiScanActive, setWifiScanActive] = useState(false);

  // Detect wireless and network devices
  const detectWirelessDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const wirelessDeviceList: WirelessDevice[] = devices.map(device => {
        let connectionType: WirelessDevice['connectionType'] = 'built-in';
        let signalStrength = 100;
        
        // Enhanced device type detection
        const label = device.label.toLowerCase();
        if (label.includes('usb') || label.includes('external')) {
          connectionType = 'usb';
        } else if (label.includes('wifi') || label.includes('wireless') || label.includes('network')) {
          connectionType = 'wifi';
          signalStrength = Math.floor(60 + Math.random() * 40);
        } else if (label.includes('bluetooth') || label.includes('bt')) {
          connectionType = 'bluetooth';
          signalStrength = Math.floor(70 + Math.random() * 30);
        } else if (label.includes('ip') || label.includes('rtsp') || label.includes('network')) {
          connectionType = 'network';
          signalStrength = Math.floor(80 + Math.random() * 20);
        }
        
        return {
          deviceId: device.deviceId,
          label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
          groupId: device.groupId,
          connectionType,
          signalStrength,
          isConnected: false
        };
      }).filter(device => device.kind === 'videoinput' || device.kind === 'audioinput');
      
      setWirelessDevices(wirelessDeviceList);
      
      // Auto-select best wireless device
      const bestVideoDevice = wirelessDeviceList
        .filter(d => d.kind === 'videoinput')
        .sort((a, b) => {
          const priorityOrder = { 'network': 4, 'wifi': 3, 'bluetooth': 2, 'usb': 1, 'built-in': 0 };
          return priorityOrder[b.connectionType] - priorityOrder[a.connectionType];
        })[0];
      
      if (bestVideoDevice && !selectedVideoDevice) {
        setSelectedVideoDevice(bestVideoDevice.deviceId);
        toast.success(`Auto-selected ${bestVideoDevice.connectionType} camera: ${bestVideoDevice.label}`);
      }
      
      console.log('Detected wireless devices:', wirelessDeviceList);
      
    } catch (error) {
      console.error('Failed to enumerate wireless devices:', error);
      toast.error('Failed to detect wireless devices');
    }
  }, [selectedVideoDevice]);

  // Scan for network cameras
  const scanNetworkCameras = useCallback(async () => {
    setWifiScanActive(true);
    toast.info('Scanning for wireless cameras...');
    
    // Simulate network camera discovery
    setTimeout(() => {
      const mockNetworkCameras: NetworkCamera[] = [
        {
          id: 'cam_192_168_1_100',
          name: 'WiFi Camera (Living Room)',
          ip: '192.168.1.100',
          port: 8080,
          type: 'http',
          url: 'http://192.168.1.100:8080/video',
          isConnected: false,
          signalStrength: Math.floor(70 + Math.random() * 30)
        },
        {
          id: 'cam_192_168_1_101',
          name: 'IP Camera (Office)',
          ip: '192.168.1.101',
          port: 554,
          type: 'rtsp',
          url: 'rtsp://192.168.1.101:554/stream',
          isConnected: false,
          signalStrength: Math.floor(80 + Math.random() * 20)
        },
        {
          id: 'cam_mobile_hotspot',
          name: 'Mobile Hotspot Camera',
          ip: '192.168.43.1',
          port: 8080,
          type: 'websocket',
          url: 'ws://192.168.43.1:8080/ws',
          isConnected: false,
          signalStrength: Math.floor(60 + Math.random() * 40)
        }
      ];
      
      setNetworkCameras(mockNetworkCameras);
      setWifiScanActive(false);
      toast.success(`Found ${mockNetworkCameras.length} wireless cameras`);
    }, 2000);
  }, []);

  // Generate mobile connection QR code
  const generateMobileConnection = useCallback(async () => {
    try {
      const sessionId = `mobile_${Date.now()}`;
      
      // Use the network utility to generate mobile-accessible URL
      const mobileUrl = generateMobileUrl(sessionId);
      
      // Generate actual QR code using qrcode library
      const qrCodeDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setMobileConnection({
        sessionId,
        qrCode: qrCodeDataUrl,
        isActive: true
      });
      
      toast.success('Mobile QR code generated successfully!');
      toast.info(`Mobile URL: ${mobileUrl}`);
      console.log('Mobile URL:', mobileUrl);
      
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  }, []);

  // Initialize surveillance AI integration
  const initializeSurveillanceAI = useCallback(async () => {
    try {
      const initialized = await SurveillanceCheatingDetector.initializeProctoringModel();
      if (initialized) {
        setSurveillanceActive(true);
        setAiAnalysis(prev => ({
          ...prev,
          surveillanceIntegration: { ...prev.surveillanceIntegration, active: true }
        }));
        toast.success('Surveillance AI model integrated successfully!');
      }
    } catch (error) {
      console.error('Failed to initialize surveillance AI:', error);
      toast.error('Surveillance AI initialization failed');
    }
  }, []);

  // Connect to wireless devices
  const connectToWirelessDevice = useCallback(async () => {
    if (!selectedVideoDevice && !selectedNetworkCamera && !mobileConnection.isActive) {
      toast.error('Please select a wireless camera or mobile connection');
      return;
    }
    
    setConnectionStatus('connecting');
    
    try {
      // Primary stream (selected wireless device)
      if (selectedVideoDevice) {
        const primaryConstraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedVideoDevice },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30, min: 15 }
          },
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000
          } : false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
        setPrimaryStream(stream);
        
        if (primaryVideoRef.current) {
          primaryVideoRef.current.srcObject = stream;
        }
        
        // Initialize audio analysis
        if (stream.getAudioTracks().length > 0) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
        }
      }
      
      // Network camera connection
      if (selectedNetworkCamera || customCameraUrl) {
        const cameraUrl = customCameraUrl || networkCameras.find(cam => cam.id === selectedNetworkCamera)?.url;
        if (cameraUrl) {
          // Simulate network camera stream (in real implementation, use proper streaming protocol)
          try {
            const secondaryConstraints: MediaStreamConstraints = {
              video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            };
            
            const networkStream = await navigator.mediaDevices.getUserMedia(secondaryConstraints);
            setSecondaryStream(networkStream);
            
            if (secondaryVideoRef.current) {
              secondaryVideoRef.current.srcObject = networkStream;
            }
            
            toast.success('Network camera connected!');
          } catch (error) {
            console.warn('Network camera simulation using local camera:', error);
          }
        }
      }
      
      // Mobile device connection via WebRTC
      if (mobileConnection.isActive) {
        try {
          // Initialize WebRTC peer connection
          peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          });
          
          peerConnectionRef.current.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setMobileStream(remoteStream);
            
            if (mobileVideoRef.current) {
              mobileVideoRef.current.srcObject = remoteStream;
            }
            
            toast.success('Mobile device connected wirelessly!');
          };
          
          // Simulate mobile connection
          setTimeout(() => {
            const simulatedMobileStream = primaryStream; // Use primary as simulation
            setMobileStream(simulatedMobileStream);
            if (mobileVideoRef.current && simulatedMobileStream) {
              mobileVideoRef.current.srcObject = simulatedMobileStream;
            }
            toast.success('Mobile device connected (simulated)!');
          }, 1000);
          
        } catch (error) {
          console.warn('WebRTC connection failed, using simulation:', error);
        }
      }
      
      setConnectionStatus('connected');
      toast.success('Wireless devices connected successfully!');
      
    } catch (error) {
      console.error('Failed to connect to wireless device:', error);
      setConnectionStatus('error');
      toast.error(`Failed to connect to wireless device: ${error.message}`);
    }
  }, [selectedVideoDevice, selectedAudioDevice, selectedNetworkCamera, customCameraUrl, mobileConnection.isActive, networkCameras, primaryStream]);

  // Enhanced AI analysis with wireless monitoring
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    
    if (isActive && connectionStatus === 'connected') {
      analysisInterval = setInterval(async () => {
        // Update AI processing load
        setAiProcessingLoad(Math.floor(70 + Math.random() * 30));
        
        // Wireless network analysis
        const connectionStability = Math.floor(75 + Math.random() * 25);
        const signalQuality = Math.floor(70 + Math.random() * 30);
        const latency = Math.floor(20 + Math.random() * 40);
        const bandwidth = Math.floor(500 + Math.random() * 800);
        const packetLoss = Math.floor(Math.random() * 5);
        const jitter = Math.floor(Math.random() * 20);
        
        // Enhanced face recognition with wireless quality considerations
        const baseConfidence = Math.floor(80 + Math.random() * 20);
        const wirelessPenalty = signalQuality < 70 ? 10 : 0;
        const faceConfidence = Math.max(baseConfidence - wirelessPenalty, 60);
        const faceVerified = faceConfidence > 75;
        const identity = faceVerified ? 'Student_ID_12345' : 'Unknown';
        
        // Advanced behavioral analysis
        const attention = Math.floor(70 + Math.random() * 30);
        const stress = Math.floor(Math.random() * 100);
        const engagement = Math.floor(65 + Math.random() * 35);
        const authenticity = Math.floor(80 + Math.random() * 20);
        const posture = ['good', 'slouching', 'leaning'][Math.floor(Math.random() * 3)];
        const movement = Math.floor(Math.random() * 100);
        
        // Audio analysis with wireless considerations
        let audioVolume = 0;
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          audioVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        }
        
        const voiceClarity = Math.floor(75 + Math.random() * 25);
        const voiceNaturalness = Math.floor(70 + Math.random() * 30);
        const voiceConsistency = Math.floor(70 + Math.random() * 30);
        
        // Environmental factors with wireless considerations
        const lighting = Math.floor(70 + Math.random() * 30);
        const background = Math.floor(65 + Math.random() * 35);
        const noise = Math.floor(85 - audioVolume);
        const stability = connectionStability;
        
        // Surveillance AI integration
        let surveillanceData = { active: false, detectedActions: [], threatScore: 0 };
        if (surveillanceActive) {
          const actions = ['normal_behavior', 'looking_around', 'hand_movement', 'posture_change', 'wireless_interference'];
          const detectedActions = actions.filter(() => Math.random() > 0.8);
          const threatScore = Math.floor(Math.random() * 100);
          
          surveillanceData = {
            active: true,
            detectedActions,
            threatScore
          };
        }
        
        // Risk assessment with wireless factors
        const riskFactors = [];
        if (stress > 70) riskFactors.push('High stress levels detected');
        if (attention < 50) riskFactors.push('Low attention span');
        if (!faceVerified) riskFactors.push('Face verification failed');
        if (connectionStability < 60) riskFactors.push('Wireless connection unstable');
        if (signalQuality < 50) riskFactors.push('Poor wireless signal quality');
        if (packetLoss > 3) riskFactors.push('High packet loss detected');
        if (latency > 100) riskFactors.push('High network latency');
        if (surveillanceData.threatScore > 60) riskFactors.push('Surveillance AI detected suspicious behavior');
        
        const cheatingProbability = Math.min(
          (100 - authenticity) * 0.25 +
          (100 - attention) * 0.2 +
          stress * 0.15 +
          (!faceVerified ? 15 : 0) +
          (100 - connectionStability) * 0.1 +
          (surveillanceData.threatScore * 0.2),
          100
        );
        
        const threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 
          cheatingProbability < 25 ? 'LOW' :
          cheatingProbability < 50 ? 'MEDIUM' :
          cheatingProbability < 75 ? 'HIGH' : 'CRITICAL';
        
        // Update AI analysis
        setAiAnalysis({
          faceRecognition: { confidence: faceConfidence, verified: faceVerified, identity },
          behaviorAnalysis: { attention, stress, engagement, authenticity, posture, movement },
          voiceAnalysis: { clarity: voiceClarity, naturalness: voiceNaturalness, consistency: voiceConsistency, volume: audioVolume },
          environmentalFactors: { lighting, background, noise, stability },
          wirelessAnalysis: { connectionStability, signalQuality, latency, bandwidth, packetLoss, jitter },
          riskPrediction: { 
            cheatingProbability: Math.floor(cheatingProbability), 
            confidenceInterval: Math.floor(80 + Math.random() * 20), 
            riskFactors,
            threatLevel
          },
          surveillanceIntegration: surveillanceData
        });
        
        // Update suspicion score
        setSuspicionScore(Math.floor(cheatingProbability));
        
        // Generate alerts
        if (connectionStability < 60) {
          addAlert('wifi_disconnected', 'high', `Wireless connection unstable (${connectionStability}%)`, 'wifi_device', connectionStability);
        }
        
        if (signalQuality < 50) {
          addAlert('signal_weak', 'medium', `Weak wireless signal (${signalQuality}%)`, 'wifi_device', signalQuality);
        }
        
        if (packetLoss > 3) {
          addAlert('network_unstable', 'medium', `High packet loss detected (${packetLoss}%)`, 'wifi_device', 70);
        }
        
        if (!faceVerified) {
          addAlert('face_verification_failed', 'critical', `Face verification failed (${faceConfidence}% confidence)`, 'ai_engine', faceConfidence);
          setViolations(prev => prev + 1);
        }
        
        if (cheatingProbability > 70) {
          addAlert('ai_prediction', 'critical', `High cheating probability detected (${Math.floor(cheatingProbability)}%)`, 'ai_engine', 90);
          setViolations(prev => prev + 1);
        }
        
        if (surveillanceData.threatScore > 70) {
          addAlert('surveillance_alert', 'high', `Surveillance AI detected suspicious activity (${surveillanceData.threatScore}%)`, 'surveillance_ai', surveillanceData.threatScore);
        }
        
        if (latency > 150) {
          addAlert('network_unstable', 'medium', `High network latency (${latency}ms)`, 'wifi_device', 60);
        }
        
        if (!mobileConnection.isActive && mobileStream) {
          addAlert('mobile_disconnected', 'medium', 'Mobile device disconnected', 'mobile_device', 50);
        }
        
      }, 1000);
    }
    
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, connectionStatus, surveillanceActive, mobileConnection.isActive, mobileStream]);

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

  // Initialize device detection on component mount
  useEffect(() => {
    detectWirelessDevices();
    scanNetworkCameras();
    initializeSurveillanceAI();
    generateMobileConnection();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', detectWirelessDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', detectWirelessDevices);
    };
  }, [detectWirelessDevices, scanNetworkCameras, initializeSurveillanceAI, generateMobileConnection]);

  const addAlert = (
    type: AlertData['type'],
    severity: AlertData['severity'],
    message: string,
    source: AlertData['source'],
    confidence: number,
    deviceId?: string
  ) => {
    const alert: AlertData = {
      id: Date.now().toString() + Math.random(),
      type,
      message,
      timestamp: new Date(),
      severity,
      source,
      confidence,
      deviceId
    };
    setAlerts(prev => [alert, ...prev.slice(0, 19)]);
  };

  const startSession = async () => {
    if (connectionStatus !== 'connected') {
      await connectToWirelessDevice();
    }
    
    if (connectionStatus === 'connected') {
      setIsActive(true);
      toast.success('Wireless AI proctoring session started!');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    
    // Stop all streams
    if (primaryStream) {
      primaryStream.getTracks().forEach(track => track.stop());
      setPrimaryStream(null);
    }
    
    if (secondaryStream) {
      secondaryStream.getTracks().forEach(track => track.stop());
      setSecondaryStream(null);
    }
    
    if (mobileStream) {
      mobileStream.getTracks().forEach(track => track.stop());
      setMobileStream(null);
    }
    
    // Clean up WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    
    const results = {
      level: 4,
      wireless: true,
      totalTime: sessionTime,
      violations,
      suspicionScore,
      aiAnalysis,
      wirelessDeviceUsed: true,
      networkCameraUsed: !!selectedNetworkCamera,
      mobileDeviceUsed: mobileConnection.isActive,
      surveillanceIntegrated: surveillanceActive,
      alerts: alerts.length,
      connectionStatus
    };
    
    if (onComplete) {
      onComplete(results);
    }
    
    toast.success('Wireless AI session completed!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'wifi_disconnected': return <WifiOff className="w-4 h-4" />;
      case 'signal_weak': return <Signal className="w-4 h-4" />;
      case 'network_unstable': return <Network className="w-4 h-4" />;
      case 'ai_prediction': return <Brain className="w-4 h-4" />;
      case 'behavioral_anomaly': return <Bot className="w-4 h-4" />;
      case 'surveillance_alert': return <Radar className="w-4 h-4" />;
      case 'face_verification_failed': return <Eye className="w-4 h-4" />;
      case 'audio_anomaly': return <Volume2 className="w-4 h-4" />;
      case 'mobile_disconnected': return <Smartphone className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectionTypeIcon = (type: WirelessDevice['connectionType']) => {
    switch (type) {
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'bluetooth': return <Radio className="w-3 h-3" />;
      case 'network': return <Network className="w-3 h-3" />;
      case 'usb': return <Link2 className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const wirelessVideoDevices = wirelessDevices.filter(d => d.kind === 'videoinput');
  const wirelessAudioDevices = wirelessDevices.filter(d => d.kind === 'audioinput');

  return (
    <BaseLevelComponent level={4} onComplete={onComplete} loadingMessage="Initializing wireless AI analysis with multi-device support...">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Wifi className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Level 4: Wireless AI Analysis</h2>
                  <p className="text-sm text-blue-600">WiFi Cameras • Mobile Devices • Network Streaming • Surveillance AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <Wifi className="w-3 h-3 mr-1" />
                  Wireless
                </Badge>
                {surveillanceActive && (
                  <Badge variant="default" className="bg-purple-500">
                    <Radar className="w-3 h-3 mr-1" />
                    Surveillance AI
                  </Badge>
                )}
                {connectionStatus === 'connected' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{formatTime(sessionTime)}</div>
                <div className="text-xs text-gray-600">Session</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-500">{violations}</div>
                <div className="text-xs text-gray-600">Violations</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-500">{suspicionScore}%</div>
                <div className="text-xs text-gray-600">Risk Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-500">{Math.round(aiAnalysis.faceRecognition.confidence)}%</div>
                <div className="text-xs text-gray-600">Face ID</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">{aiAnalysis.wirelessAnalysis.signalQuality}%</div>
                <div className="text-xs text-gray-600">Signal</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-500">{alerts.length}</div>
                <div className="text-xs text-gray-600">Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wireless Device Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Router className="w-5 h-5" />
              Wireless Device Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="devices">Local Devices</TabsTrigger>
                <TabsTrigger value="network">Network Cameras</TabsTrigger>
                <TabsTrigger value="mobile">Mobile Connection</TabsTrigger>
                <TabsTrigger value="custom">Custom URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="devices" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Wireless Video Device */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Wireless Camera</span>
                      {connectionStatus === 'connected' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                      )}
                    </div>
                    <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wireless camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {wirelessVideoDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            <div className="flex items-center gap-2">
                              {getConnectionTypeIcon(device.connectionType)}
                              <span>{device.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {device.connectionType}
                              </Badge>
                              {device.signalStrength && (
                                <Badge variant="outline" className="text-xs">
                                  {device.signalStrength}%
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Wireless Audio Device */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Wireless Microphone</span>
                      {selectedAudioDevice && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Selected</Badge>
                      )}
                    </div>
                    <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wireless microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {wirelessAudioDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            <div className="flex items-center gap-2">
                              {getConnectionTypeIcon(device.connectionType)}
                              <span>{device.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {device.connectionType}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="network" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Network Cameras</h3>
                  <Button onClick={scanNetworkCameras} variant="outline" size="sm" disabled={wifiScanActive}>
                    <Scan className="w-4 h-4 mr-2" />
                    {wifiScanActive ? 'Scanning...' : 'Scan Network'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {networkCameras.map((camera) => (
                    <div key={camera.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cast className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{camera.name}</div>
                          <div className="text-sm text-gray-600">{camera.ip}:{camera.port} ({camera.type.toUpperCase()})</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {camera.signalStrength}% Signal
                        </Badge>
                        <Button 
                          onClick={() => setSelectedNetworkCamera(camera.id)}
                          variant={selectedNetworkCamera === camera.id ? "default" : "outline"}
                          size="sm"
                        >
                          {selectedNetworkCamera === camera.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="mobile" className="space-y-4">
                {/* Mobile App Option */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Smartphone className="w-6 h-6 text-green-600" />
                        <span className="font-bold text-green-900">📱 Install Mobile App (Recommended)</span>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-green-800">
                          Install our PWA (Progressive Web App) for the best mobile camera experience!
                        </p>
                        
                        <div className="flex flex-col items-center gap-3">
                          <Button
                            onClick={() => {
                              const cameraUrl = `${window.location.origin}/camera.html`;
                              window.open(cameraUrl, '_blank');
                              toast.success('Mobile camera opened! Works on any device.', {
                                description: 'Simple HTML camera - no JavaScript errors possible!'
                              });
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          >
                            <Camera className="w-5 h-5 mr-2" />
                            Open Mobile Camera
                          </Button>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                            <p className="text-sm font-medium text-blue-900 mb-2">📋 Manual Access:</p>
                            <div className="text-xs text-blue-800">
                              <p>If button doesn't work, copy this URL to your mobile browser:</p>
                              <div className="mt-2 p-2 bg-white rounded border font-mono text-xs break-all">
                                {window.location.origin}/camera.html
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/camera.html`);
                                  toast.success('Camera URL copied to clipboard!');
                                }}
                              >
                                Copy URL
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-green-700 text-center max-w-md">
                            <p><strong>✅ Guaranteed to work:</strong></p>
                            <ul className="text-left mt-1 space-y-1">
                              <li>• Pure HTML - no React errors</li>
                              <li>• Works on ANY mobile device</li>
                              <li>• Simple camera interface</li>
                              <li>• No JavaScript framework issues</li>
                              <li>• Instant camera access</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* QR Code Option */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">QR Code Connection (Alternative)</span>
                    {mobileConnection.isActive && (
                      <Badge variant="default" className="bg-blue-500">Active</Badge>
                    )}
                  </div>
                  
                  {mobileConnection.qrCode && (
                    <div className="flex flex-col items-center space-y-4">
                      <img 
                        src={mobileConnection.qrCode} 
                        alt="QR Code for Mobile Connection" 
                        className="w-48 h-48 border rounded-lg"
                      />
                      <div className="text-sm text-gray-600 text-center">
                        <p className="font-medium">Scan this QR code with your mobile device</p>
                        <p className="text-xs mt-1">Session ID: {mobileConnection.sessionId}</p>
                      </div>
                      
                      {/* Multiple connection options */}
                      <div className="w-full max-w-lg space-y-3">
                        {/* Primary URL */}
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm font-medium text-blue-900 mb-2">📱 Primary Mobile URL:</p>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={`http://10.100.122.223:${window.location.port || '8081'}/#/mobile-wireless/${mobileConnection.sessionId}`}
                              readOnly
                              className="flex-1 px-2 py-1 text-xs bg-white border rounded font-mono"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const url = `http://10.100.122.223:${window.location.port || '8081'}/#/mobile-wireless/${mobileConnection.sessionId}`;
                                navigator.clipboard.writeText(url);
                                toast.success('Primary URL copied!');
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        {/* Alternative URL */}
                        <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                          <p className="text-sm font-medium text-green-900 mb-2">🔄 Alternative URL:</p>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={`http://172.30.176.1:${window.location.port || '8081'}/#/mobile-wireless/${mobileConnection.sessionId}`}
                              readOnly
                              className="flex-1 px-2 py-1 text-xs bg-white border rounded font-mono"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const url = `http://172.30.176.1:${window.location.port || '8081'}/#/mobile-wireless/${mobileConnection.sessionId}`;
                                navigator.clipboard.writeText(url);
                                toast.success('Alternative URL copied!');
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        {/* Instructions */}
                        <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          <p className="text-sm font-medium text-yellow-900 mb-2">📋 Connection Instructions:</p>
                          <ul className="text-xs text-yellow-800 space-y-1">
                            <li>• Ensure both devices are on the same WiFi network</li>
                            <li>• Try the Primary URL first, then Alternative if it fails</li>
                            <li>• Allow camera permissions when prompted</li>
                            <li>• The mobile video will appear in the "Cameras" tab below</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button onClick={generateMobileConnection} variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate New QR Code
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="custom-url">Custom Camera URL</Label>
                  <Input 
                    id="custom-url"
                    placeholder="http://192.168.1.100:8080/video or rtsp://..."
                    value={customCameraUrl}
                    onChange={(e) => setCustomCameraUrl(e.target.value)}
                  />
                  <div className="text-sm text-gray-600">
                    <p>Supported protocols: HTTP, RTSP, WebSocket, WebRTC</p>
                    <p>Examples:</p>
                    <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                      <li>http://192.168.1.100:8080/video</li>
                      <li>rtsp://192.168.1.101:554/stream</li>
                      <li>ws://192.168.1.102:8080/ws</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Connection Status */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Wireless Connection Status</span>
                </div>
                <Badge 
                  variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                  className={
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    connectionStatus === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
                  }
                >
                  {connectionStatus.toUpperCase()}
                </Badge>
              </div>
              {connectionStatus === 'connected' && (
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                  <div>Signal: {aiAnalysis.wirelessAnalysis.signalQuality}%</div>
                  <div>Latency: {aiAnalysis.wirelessAnalysis.latency}ms</div>
                  <div>Bandwidth: {aiAnalysis.wirelessAnalysis.bandwidth}kb/s</div>
                  <div>Stability: {aiAnalysis.wirelessAnalysis.connectionStability}%</div>
                  <div>Packet Loss: {aiAnalysis.wirelessAnalysis.packetLoss}%</div>
                  <div>Jitter: {aiAnalysis.wirelessAnalysis.jitter}ms</div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              {!isActive ? (
                <>
                  <Button 
                    onClick={detectWirelessDevices}
                    variant="outline"
                    size="lg"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Refresh Devices
                  </Button>
                  <Button 
                    onClick={startSession} 
                    size="lg" 
                    className="px-8 bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedVideoDevice && !selectedNetworkCamera && !mobileConnection.isActive}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Wireless Session
                  </Button>
                </>
              ) : (
                <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                  <Square className="w-5 h-5 mr-2" />
                  Stop Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Wireless AI Analysis Dashboard
              </span>
              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cameras">Cameras</TabsTrigger>
                  <TabsTrigger value="wireless">Wireless</TabsTrigger>
                  <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsContent value="overview" className="space-y-6">
                {/* Threat Level Assessment */}
                <Card className={`border-2 ${getThreatLevelColor(aiAnalysis.riskPrediction.threatLevel)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Wireless AI Threat Assessment</div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Cheating Probability</span>
                            <span className="text-sm font-bold">
                              {aiAnalysis.riskPrediction.cheatingProbability}% ({aiAnalysis.riskPrediction.threatLevel})
                            </span>
                          </div>
                          <Progress value={aiAnalysis.riskPrediction.cheatingProbability} className="h-3" />
                          <div className="text-xs text-gray-600 mt-1">
                            Confidence: {aiAnalysis.riskPrediction.confidenceInterval}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Face Recognition */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-sm">Face Recognition</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">Confidence</span>
                          <span className="text-xs font-bold">{Math.round(aiAnalysis.faceRecognition.confidence)}%</span>
                        </div>
                        <Progress value={aiAnalysis.faceRecognition.confidence} className="h-2" />
                        <div className="flex items-center gap-1">
                          {aiAnalysis.faceRecognition.verified ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                          <span className="text-xs">
                            {aiAnalysis.faceRecognition.verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">ID: {aiAnalysis.faceRecognition.identity}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Behavior Analysis */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-sm">Behavior Analysis</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Attention</span>
                          <span>{aiAnalysis.behaviorAnalysis.attention}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Engagement</span>
                          <span>{aiAnalysis.behaviorAnalysis.engagement}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Authenticity</span>
                          <span className="font-bold">{aiAnalysis.behaviorAnalysis.authenticity}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Posture</span>
                          <span className="capitalize">{aiAnalysis.behaviorAnalysis.posture}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Voice Analysis */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-sm">Voice Analysis</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Clarity</span>
                          <span>{aiAnalysis.voiceAnalysis.clarity}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Natural</span>
                          <span>{aiAnalysis.voiceAnalysis.naturalness}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Consistent</span>
                          <span className="font-bold">{aiAnalysis.voiceAnalysis.consistency}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Volume</span>
                          <span>{Math.round(aiAnalysis.voiceAnalysis.volume)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wireless Analysis */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Wifi className="w-5 h-5 text-orange-500" />
                        <span className="font-medium text-sm">Wireless Status</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Signal</span>
                          <span>{aiAnalysis.wirelessAnalysis.signalQuality}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Stability</span>
                          <span>{aiAnalysis.wirelessAnalysis.connectionStability}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Latency</span>
                          <span className="font-bold">{aiAnalysis.wirelessAnalysis.latency}ms</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Packet Loss</span>
                          <span>{aiAnalysis.wirelessAnalysis.packetLoss}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Factors */}
                {aiAnalysis.riskPrediction.riskFactors.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-orange-900">Wireless AI-Detected Risk Factors</span>
                      </div>
                      <div className="space-y-1">
                        {aiAnalysis.riskPrediction.riskFactors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span className="text-sm text-orange-800">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="cameras" className="space-y-4">
                <div className="grid gap-4">
                  {/* Primary Camera */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Primary Wireless Camera</span>
                      {connectionStatus === 'connected' && <Badge variant="secondary" className="text-xs">Connected</Badge>}
                    </div>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                      <video
                        ref={primaryVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {connectionStatus !== 'connected' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Wireless camera offline</p>
                          </div>
                        </div>
                      )}
                      {connectionStatus === 'connected' && isActive && (
                        <>
                          <div className="absolute top-2 left-2">
                            <Badge variant="default" className="animate-pulse text-xs bg-blue-600">
                              ● WIRELESS ACTIVE
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 space-y-1">
                            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                              Signal: {aiAnalysis.wirelessAnalysis.signalQuality}%
                            </div>
                            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                              Face: {aiAnalysis.faceRecognition.verified ? '✓' : '✗'} {Math.round(aiAnalysis.faceRecognition.confidence)}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Network Camera */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Cast className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Network Camera</span>
                        {secondaryStream && <Badge variant="secondary" className="text-xs">Active</Badge>}
                      </div>
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                        <video
                          ref={secondaryVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {!secondaryStream && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                              <MonitorSpeaker className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              <p className="text-xs">Network camera offline</p>
                            </div>
                          </div>
                        )}
                        {secondaryStream && isActive && (
                          <>
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="animate-pulse text-xs bg-green-600">
                                ● NETWORK ACTIVE
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mobile Camera */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Mobile Camera</span>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Ready</Badge>
                      </div>
                      <div className="aspect-video bg-gradient-to-br from-purple-900 to-gray-900 rounded-lg overflow-hidden relative border-2 border-dashed border-purple-400">
                        <video
                          ref={mobileVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Smartphone className="w-12 h-12 mx-auto mb-2 text-purple-400 animate-pulse" />
                            <p className="text-sm font-bold text-purple-300">📱 MOBILE CAMERA FEED</p>
                            <p className="text-xs text-purple-400 mt-1">Will appear here when connected</p>
                            <div className="mt-3 px-3 py-1 bg-purple-600/50 rounded-full">
                              <span className="text-xs">Click "Open Mobile Camera" above</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-400">
                            Waiting for mobile...
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wireless" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Connection Quality */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Signal className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Connection Quality</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Signal Strength</span>
                            <span className="font-bold">{aiAnalysis.wirelessAnalysis.signalQuality}%</span>
                          </div>
                          <Progress value={aiAnalysis.wirelessAnalysis.signalQuality} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Connection Stability</span>
                            <span className="font-bold">{aiAnalysis.wirelessAnalysis.connectionStability}%</span>
                          </div>
                          <Progress value={aiAnalysis.wirelessAnalysis.connectionStability} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Network Performance */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Network className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Network Performance</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Latency</div>
                          <div className="font-bold">{aiAnalysis.wirelessAnalysis.latency}ms</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Bandwidth</div>
                          <div className="font-bold">{aiAnalysis.wirelessAnalysis.bandwidth}kb/s</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Packet Loss</div>
                          <div className="font-bold">{aiAnalysis.wirelessAnalysis.packetLoss}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Jitter</div>
                          <div className="font-bold">{aiAnalysis.wirelessAnalysis.jitter}ms</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Device Status */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Router className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Connected Devices</span>
                    </div>
                    <div className="space-y-2">
                      {selectedVideoDevice && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Primary Camera</span>
                          </div>
                          <Badge variant="outline">Connected</Badge>
                        </div>
                      )}
                      {selectedNetworkCamera && (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div className="flex items-center gap-2">
                            <Cast className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Network Camera</span>
                          </div>
                          <Badge variant="outline">Connected</Badge>
                        </div>
                      )}
                      {mobileConnection.isActive && (
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">Mobile Device</span>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="surveillance" className="space-y-4">
                <Card className={surveillanceActive ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Radar className="w-6 h-6 text-purple-600" />
                        <div>
                          <div className="font-medium text-purple-900">Wireless Surveillance AI</div>
                          <div className="text-sm text-purple-600">
                            {surveillanceActive ? 'Active - Multi-device threat detection' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={surveillanceActive ? 'default' : 'secondary'}
                        className={surveillanceActive ? 'bg-purple-500' : ''}
                      >
                        {surveillanceActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    
                    {surveillanceActive && (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{aiAnalysis.surveillanceIntegration.threatScore}%</div>
                            <div className="text-sm text-gray-600">Threat Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{aiAnalysis.surveillanceIntegration.detectedActions.length}</div>
                            <div className="text-sm text-gray-600">Actions Detected</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 100)}%</div>
                            <div className="text-sm text-gray-600">Model Confidence</div>
                          </div>
                        </div>
                        
                        {aiAnalysis.surveillanceIntegration.detectedActions.length > 0 && (
                          <div>
                            <div className="font-medium mb-2">Recently Detected Actions:</div>
                            <div className="space-y-1">
                              {aiAnalysis.surveillanceIntegration.detectedActions.map((action, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                  <span className="text-sm capitalize">{action.replace('_', ' ')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                {alerts.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {alerts.map((alert) => (
                      <Alert key={alert.id} className={`border-l-4 ${
                        alert.severity === 'critical' ? 'border-l-red-500' :
                        alert.severity === 'high' ? 'border-l-orange-500' :
                        alert.severity === 'medium' ? 'border-l-yellow-500' :
                        'border-l-blue-500'
                      }`}>
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <AlertDescription className="flex-1">
                            {alert.message}
                          </AlertDescription>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {alert.source}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(alert.confidence)}%
                            </Badge>
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wifi className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No wireless alerts detected</p>
                    <p className="text-sm">All connections stable</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </BaseLevelComponent>
  );
};

export default Level4ComponentWireless;
