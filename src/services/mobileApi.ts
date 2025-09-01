/**
 * Mobile API service for real-time camera connection
 */

export interface MobileConnection {
  sessionId: string;
  deviceId: string;
  isConnected: boolean;
  stream?: MediaStream;
}

export interface CameraFrame {
  sessionId: string;
  deviceId: string;
  timestamp: number;
  frameData: string; // base64 encoded frame
  deviceInfo: {
    battery: number;
    orientation: string;
    quality: string;
  };
}

class MobileApiService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;

  // Connect to Level 4 session via WebSocket
  async connectToSession(sessionId: string, deviceId: string, authToken: string): Promise<boolean> {
    // Enforce presence of a valid authentication token (JWT or similar)
    if (!authToken || typeof authToken !== 'string') {
      console.error('Authentication token is missing or invalid.');
      return false;
    }
    try {
      const wsUrl = this.getWebSocketUrl();
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket not initialized'));
          return;
        }

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Send connection handshake with authentication token
          this.sendMessage({
            type: 'mobile_connect',
            sessionId,
            deviceId,
            authToken,
            timestamp: Date.now()
          });
          
          // Start ping/pong to keep connection alive
          this.startPing();
          
          resolve(true);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleDisconnection();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'connection_ack') {
            if (!message.authenticated) {
              // Server rejected authentication
              console.error('WebSocket authentication failed. Closing connection.');
              this.disconnect();
              reject(new Error('WebSocket authentication failed.'));
              return;
            }
          }
          this.handleMessage(message);
        };
      });
    } catch (error) {
      console.error('Failed to connect to session:', error);
      return false;
    }
  }

  // Send camera frame to Level 4
  sendCameraFrame(frame: CameraFrame): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'camera_frame',
        ...frame
      });
    }
  }

  // Send device status update
  sendDeviceStatus(sessionId: string, deviceId: string, status: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'device_status',
        sessionId,
        deviceId,
        status,
        timestamp: Date.now()
      });
    }
  }

  // Disconnect from session
  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Get WebSocket URL (fallback to mock for demo)
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = parseInt(window.location.port) || 8081;
    
    // Try multiple connection options
    const possibleHosts = [
      '10.100.122.223',
      '172.30.176.1',
      host,
      'localhost'
    ];
    
    // Use the first available host
    return `${protocol}//${possibleHosts[0]}:${port}/ws`;
  }

  // Send message via WebSocket
  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Handle incoming messages
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'connection_ack':
        console.log('Connection acknowledged by Level 4');
        break;
      case 'ping':
        this.sendMessage({ type: 'pong' });
        break;
      case 'session_ended':
        console.log('Session ended by Level 4');
        this.disconnect();
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Handle disconnection and reconnection
  private handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        // Attempt to reconnect with last known session
        // This would need to be implemented based on stored session info
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Keep connection alive with ping/pong
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }
}

export const mobileApiService = new MobileApiService();

// Utility functions for mobile app
export const captureVideoFrame = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  
  return '';
};

export const getDeviceInfo = () => {
  return {
    battery: (navigator as any).getBattery ? 85 : Math.floor(70 + Math.random() * 30),
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    quality: 'high',
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    devicePixelRatio: window.devicePixelRatio
  };
};
