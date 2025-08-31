// Database Types and Interfaces
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'proctor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProctoringSession {
  id: string;
  studentId: string;
  proctorId?: string;
  examId: string;
  level: 1 | 2 | 3 | 4 | 5;
  status: 'scheduled' | 'active' | 'completed' | 'terminated';
  startTime?: Date;
  endTime?: Date;
  duration: number; // in minutes
  suspicionLevel: number;
  alerts: Alert[];
  metadata: SessionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  sessionId: string;
  type: 'face_not_detected' | 'multiple_faces' | 'audio_anomaly' | 'gaze_deviation' | 'suspicious_object' | 'external_voice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SessionMetadata {
  browserInfo: {
    userAgent: string;
    screenResolution: string;
    timezone: string;
  };
  deviceInfo: {
    cameraAvailable: boolean;
    microphoneAvailable: boolean;
    screenShareAvailable: boolean;
  };
  networkInfo: {
    ipAddress?: string;
    connectionType?: string;
  };
}

export interface ProctoringEvent {
  id: string;
  sessionId: string;
  type: 'face_detected' | 'face_lost' | 'audio_level' | 'gaze_tracked' | 'screen_change' | 'device_motion';
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  proctoringLevel: 1 | 2 | 3 | 4 | 5;
  instructions: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProctoringResult {
  sessionId: string;
  studentId: string;
  examId: string;
  overallSuspicionLevel: number;
  totalAlerts: number;
  criticalAlerts: number;
  faceDetectionRate: number;
  audioQualityScore: number;
  recommendations: string[];
  reportGeneratedAt: Date;
}
