// Python Integration Service - Connects React frontend with diya.py backend

interface PythonApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

interface StudentSession {
  studentId: string;
  sessionId: string;
  level: number;
  status: 'active' | 'paused' | 'ended';
  startTime: string;
  suspicionScore: number;
  violations: number;
  cameraActive: boolean;
  audioActive: boolean;
}

interface DetectionResult {
  faceDetected: boolean;
  multiplePersons: boolean;
  suspiciousActivity: boolean;
  audioAnomalies: string[];
  gazeDirection: string;
  emotionAnalysis: string;
  suspicionScore: number;
  timestamp: string;
}

class PythonIntegrationService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    // In development, this would connect to your Python backend
    // For now, we'll simulate the connection
    this.baseUrl = 'http://localhost:8000'; // FastAPI backend URL
    this.initializeWebSocket();
  }

  // Initialize WebSocket connection for real-time updates
  private initializeWebSocket() {
    try {
      // In production, connect to Python WebSocket server
      // this.wsConnection = new WebSocket('ws://localhost:8000/ws');
      
      // Simulate WebSocket connection
      console.log('🐍 Python backend connection simulated');
      
      // Simulate real-time data updates
      this.simulateRealTimeUpdates();
    } catch (error) {
      console.error('Failed to connect to Python backend:', error);
    }
  }

  // Start proctoring session
  async startSession(studentId: string, level: number): Promise<StudentSession> {
    try {
      // In production, this would call your Python API
      const response = await this.callPythonAPI('/api/session/start', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          proctoring_level: level,
          timestamp: new Date().toISOString()
        })
      });

      if (response.success) {
        const session: StudentSession = {
          studentId,
          sessionId: `session_${Date.now()}`,
          level,
          status: 'active',
          startTime: new Date().toISOString(),
          suspicionScore: 0,
          violations: 0,
          cameraActive: true,
          audioActive: true
        };

        this.emit('sessionStarted', session);
        return session;
      } else {
        throw new Error(response.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      
      // Return mock session for demo
      const session: StudentSession = {
        studentId,
        sessionId: `session_${Date.now()}`,
        level,
        status: 'active',
        startTime: new Date().toISOString(),
        suspicionScore: 0,
        violations: 0,
        cameraActive: true,
        audioActive: true
      };

      return session;
    }
  }

  // Send video frame for analysis
  async analyzeFrame(imageData: Blob, studentId: string): Promise<DetectionResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      formData.append('student_id', studentId);
      formData.append('timestamp', new Date().toISOString());

      const response = await this.callPythonAPI('/api/analyze/frame', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        return response.data as DetectionResult;
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
      
      // Return mock detection result
      return {
        faceDetected: Math.random() > 0.1,
        multiplePersons: Math.random() > 0.8,
        suspiciousActivity: Math.random() > 0.7,
        audioAnomalies: Math.random() > 0.9 ? ['background_noise'] : [],
        gazeDirection: ['center', 'left', 'right', 'up', 'down'][Math.floor(Math.random() * 5)],
        emotionAnalysis: ['focused', 'stressed', 'distracted', 'suspicious'][Math.floor(Math.random() * 4)],
        suspicionScore: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };
    }
  }

  // Send audio data for analysis
  async analyzeAudio(audioData: Blob, studentId: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio', audioData);
      formData.append('student_id', studentId);

      const response = await this.callPythonAPI('/api/analyze/audio', {
        method: 'POST',
        body: formData
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return {
        voiceActivity: Math.floor(Math.random() * 11),
        backgroundNoise: Math.random() > 0.7,
        multipleVoices: Math.random() > 0.9,
        suspiciousAudio: Math.random() > 0.8
      };
    }
  }

  // Get session statistics
  async getSessionStats(sessionId: string): Promise<any> {
    try {
      const response = await this.callPythonAPI(`/api/session/${sessionId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting session stats:', error);
      return {
        totalViolations: Math.floor(Math.random() * 10),
        averageSuspicion: Math.floor(Math.random() * 100),
        sessionDuration: Math.floor(Math.random() * 7200), // seconds
        alertsTriggered: Math.floor(Math.random() * 5)
      };
    }
  }

  // End proctoring session
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.callPythonAPI('/api/session/end', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          end_time: new Date().toISOString()
        })
      });

      if (response.success) {
        this.emit('sessionEnded', { sessionId });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }

  // Get all active sessions (for admin panel)
  async getActiveSessions(): Promise<StudentSession[]> {
    try {
      const response = await this.callPythonAPI('/api/sessions/active');
      return response.data || [];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      
      // Return mock active sessions
      return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
        studentId: `student_${i + 1}`,
        sessionId: `session_${Date.now()}_${i}`,
        level: Math.floor(Math.random() * 5) + 1,
        status: 'active' as const,
        startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        suspicionScore: Math.floor(Math.random() * 100),
        violations: Math.floor(Math.random() * 5),
        cameraActive: Math.random() > 0.2,
        audioActive: Math.random() > 0.1
      }));
    }
  }

  // Call Python API with error handling
  private async callPythonAPI(endpoint: string, options: RequestInit = {}): Promise<PythonApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Python API call failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Simulate real-time updates for demo
  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate random student updates
      const mockUpdate = {
        studentId: `student_${Math.floor(Math.random() * 20) + 1}`,
        suspicionScore: Math.floor(Math.random() * 100),
        violations: Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      };

      this.emit('studentUpdate', mockUpdate);
    }, 5000);

    // Simulate alerts
    setInterval(() => {
      if (Math.random() > 0.7) {
        const alert = {
          studentId: `student_${Math.floor(Math.random() * 20) + 1}`,
          type: ['suspicious_activity', 'multiple_persons', 'audio_anomaly'][Math.floor(Math.random() * 3)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toISOString()
        };

        this.emit('alert', alert);
      }
    }, 10000);
  }

  // Event system for real-time updates
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Cleanup connections
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const pythonIntegration = new PythonIntegrationService();

// React hook for easy integration
export const usePythonIntegration = () => {
  return {
    startSession: pythonIntegration.startSession.bind(pythonIntegration),
    analyzeFrame: pythonIntegration.analyzeFrame.bind(pythonIntegration),
    analyzeAudio: pythonIntegration.analyzeAudio.bind(pythonIntegration),
    endSession: pythonIntegration.endSession.bind(pythonIntegration),
    getActiveSessions: pythonIntegration.getActiveSessions.bind(pythonIntegration),
    getSessionStats: pythonIntegration.getSessionStats.bind(pythonIntegration),
    on: pythonIntegration.on.bind(pythonIntegration),
    off: pythonIntegration.off.bind(pythonIntegration)
  };
};

export default pythonIntegration;

/*
PYTHON BACKEND INTEGRATION GUIDE:

To connect this with your diya.py backend, create a FastAPI server:

1. Create api_server.py:

```python
from fastapi import FastAPI, File, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from main import CortexShadeSystem

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize your existing system
cortex_system = CortexShadeSystem()

@app.post("/api/session/start")
async def start_session(data: dict):
    student_id = data.get("student_id")
    level = data.get("proctoring_level")
    
    # Start your existing camera and audio monitoring
    cortex_system.student_id = student_id
    
    return {
        "success": True,
        "session_id": f"session_{student_id}_{int(time.time())}",
        "message": "Session started successfully"
    }

@app.post("/api/analyze/frame")
async def analyze_frame(image: UploadFile = File(...), student_id: str = ""):
    # Use your existing camera detection
    score = cortex_system.camera.run(student_id=student_id)
    
    return {
        "success": True,
        "data": {
            "suspicion_score": score,
            "face_detected": score > 0,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        # Send real-time updates from your cortex system
        data = {
            "type": "update",
            "suspicion_scores": cortex_system.suspicions,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        await websocket.send_text(json.dumps(data))
        await asyncio.sleep(1)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

2. Install dependencies:
```bash
pip install fastapi uvicorn python-multipart websockets
```

3. Run the server:
```bash
python api_server.py
```

4. Update the baseUrl in this service to point to your Python backend.
*/



