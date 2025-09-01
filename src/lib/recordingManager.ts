// Recording and data retention management for SmartProctor-X

export interface RecordingData {
  id: string;
  studentId: string;
  studentName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  filePath: string;
  fileSize: number; // in bytes
  expiresAt: Date;
  status: 'active' | 'expired' | 'deleted';
}

export interface FlaggedEvent {
  id: string;
  studentId: string;
  timestamp: Date;
  type: 'face_lost' | 'multiple_faces' | 'audio_anomaly' | 'gaze_deviation' | 'suspicious_object';
  severity: 'low' | 'medium' | 'high' | 'critical';
  suspiciousScore: string; // 3 decimal places
  screenshotPath?: string;
  description: string;
  expiresAt: Date;
}

// Minimal AES-GCM encryption/decryption using Web Crypto API
class CryptoStorage {
  private static readonly STORAGE_KEY = 'spx_crypto_key';

  // Generate or retrieve a persistent key from sessionStorage
  static async getKey(): Promise<CryptoKey> {
    let keyData = sessionStorage.getItem(CryptoStorage.STORAGE_KEY);
    if (!keyData) {
      const rawKey = crypto.getRandomValues(new Uint8Array(32));
      keyData = Array.from(rawKey).join(',');
      sessionStorage.setItem(CryptoStorage.STORAGE_KEY, keyData);
    }
    const rawKeyArr = new Uint8Array(keyData.split(',').map(Number));
    return crypto.subtle.importKey(
      'raw',
      rawKeyArr,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(plain: string): Promise<string> {
    const key = await CryptoStorage.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plain);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    // Store iv + ciphertext as base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(data: string): Promise<string> {
    const key = await CryptoStorage.getKey();
    const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(plainBuffer);
  }
}

export class RecordingManager {
  private static readonly STORAGE_KEY = 'smartproctor_recordings';
  private static readonly EVENTS_KEY = 'smartproctor_events';
  private static readonly RETENTION_HOURS = 24;

  // Recording management
  static async saveRecording(recording: Omit<RecordingData, 'expiresAt' | 'status'>): Promise<RecordingData> {
    const fullRecording: RecordingData = {
      ...recording,
      expiresAt: new Date(Date.now() + this.RETENTION_HOURS * 60 * 60 * 1000),
      status: 'active'
    };

    const recordings = await this.getRecordings();
    recordings.push(fullRecording);
    const encrypted = await CryptoStorage.encrypt(JSON.stringify(recordings));
    localStorage.setItem(this.STORAGE_KEY, encrypted);

    return fullRecording;
  }

  static async getRecordings(): Promise<RecordingData[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    let decrypted: string;
    try {
      decrypted = await CryptoStorage.decrypt(data);
    } catch (e) {
      // If decryption fails, treat as no data
      return [];
    }
    const recordings = JSON.parse(decrypted);
    // Parse dates back to Date objects
    return recordings.map((r: any) => ({
      ...r,
      startTime: new Date(r.startTime),
      endTime: r.endTime ? new Date(r.endTime) : undefined,
      expiresAt: new Date(r.expiresAt)
    }));
  }

  static async getActiveRecordings(): Promise<RecordingData[]> {
    const recs = await this.getRecordings();
    return recs.filter(r => r.status === 'active' && r.expiresAt > new Date());
  }

  static async cleanupExpiredRecordings(): Promise<{ deleted: number; expired: number }> {
    const recordings = await this.getRecordings();
    const now = new Date();

    let deleted = 0;
    let expired = 0;

    const updatedRecordings = recordings.map(recording => {
      if (recording.expiresAt <= now && recording.status === 'active') {
        expired++;
        // In a real system, you would delete the actual file here
        console.log(`Recording expired: ${recording.filePath}`);
        return { ...recording, status: 'expired' };
      }
      return recording;
    });

    // Actually delete recordings that are expired (after grace period)
    const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days grace period
    const finalRecordings = updatedRecordings.filter(recording => {
      if (recording.status === 'expired' && recording.expiresAt.getTime() + gracePeriod <= now.getTime()) {
        deleted++;
        console.log(`Recording deleted: ${recording.filePath}`);
        return false;
      }
      return true;
    });

    const encrypted = await CryptoStorage.encrypt(JSON.stringify(finalRecordings));
    localStorage.setItem(this.STORAGE_KEY, encrypted);

    return { deleted, expired };
  }

  // Event management
  static async saveEvent(event: Omit<FlaggedEvent, 'expiresAt'>): Promise<FlaggedEvent> {
    const fullEvent: FlaggedEvent = {
      ...event,
      expiresAt: new Date(Date.now() + this.RETENTION_HOURS * 60 * 60 * 1000)
    };

    const events = await this.getEvents();
    events.push(fullEvent);
    const encrypted = await CryptoStorage.encrypt(JSON.stringify(events));
    localStorage.setItem(this.EVENTS_KEY, encrypted);

    return fullEvent;
  }

  static async getEvents(): Promise<FlaggedEvent[]> {
    const data = localStorage.getItem(this.EVENTS_KEY);
    if (!data) return [];
    let decrypted: string;
    try {
      decrypted = await CryptoStorage.decrypt(data);
    } catch (e) {
      // If decryption fails, treat as no data
      return [];
    }
    const events = JSON.parse(decrypted);
    return events.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp),
      expiresAt: new Date(e.expiresAt)
    }));
  }

  static async getEventsByStudent(studentId: string): Promise<FlaggedEvent[]> {
    const events = await this.getEvents();
    return events
      .filter(e => e.studentId === studentId)
      .filter(e => e.expiresAt > new Date())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async getActiveEvents(): Promise<FlaggedEvent[]> {
    const events = await this.getEvents();
    return events.filter(e => e.expiresAt > new Date());
  }

  static async cleanupExpiredEvents(): Promise<number> {
    const events = await this.getEvents();
    const now = new Date();

    const activeEvents = events.filter(event => {
      if (event.expiresAt <= now) {
        console.log(`Event expired: ${event.id} - ${event.description}`);
        return false;
      }
      return true;
    });

    const encrypted = await CryptoStorage.encrypt(JSON.stringify(activeEvents));
    localStorage.setItem(this.EVENTS_KEY, encrypted);

    return events.length - activeEvents.length;
  }

  // Report generation
  static async generateStudentReport(studentId: string, studentName: string, detailed: boolean = false) {
    const events = await this.getEventsByStudent(studentId);
    const recordings = (await this.getActiveRecordings()).filter(r => r.studentId === studentId);

    const report = {
      studentInfo: {
        id: studentId,
        name: studentName,
        reportGeneratedAt: new Date().toISOString(),
        dataRetentionHours: this.RETENTION_HOURS
      },
      summary: {
        totalEvents: events.length,
        eventsByType: events.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        eventsBySeverity: events.reduce((acc, event) => {
          acc[event.severity] = (acc[event.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalRecordings: recordings.length,
        totalRecordingTime: recordings.reduce((sum, r) => sum + r.duration, 0),
        suspiciousScore: detailed ? this.calculateAverageSuspiciousScore(events) : '***'
      },
      flaggedEvents: events.map(event => ({
        id: event.id,
        timestamp: event.timestamp.toISOString(),
        type: event.type,
        severity: event.severity,
        suspiciousScore: detailed ? event.suspiciousScore : '***',
        description: event.description,
        screenshotPath: event.screenshotPath,
        expiresAt: event.expiresAt.toISOString()
      })),
      recordings: recordings.map(recording => ({
        id: recording.id,
        startTime: recording.startTime.toISOString(),
        duration: recording.duration,
        filePath: recording.filePath,
        fileSize: recording.fileSize,
        expiresAt: recording.expiresAt.toISOString()
      }))
    };

    return report;
  }

  private static calculateAverageSuspiciousScore(events: FlaggedEvent[]): string {
    if (events.length === 0) return '0.000';

    const scores = events.map(e => parseFloat(e.suspiciousScore)).filter(s => !isNaN(s));
    if (scores.length === 0) return '0.000';

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return average.toFixed(3);
  }

  // Cleanup scheduler
  static startCleanupScheduler(): () => void {
    // Run cleanup every hour
    const interval = setInterval(() => {
      console.log('Running scheduled cleanup...');
      this.cleanupExpiredRecordings();
      this.cleanupExpiredEvents();
    }, 60 * 60 * 1000); // 1 hour

    // Run initial cleanup
    this.cleanupExpiredRecordings();
    this.cleanupExpiredEvents();

    return () => clearInterval(interval);
  }
}

// Initialize cleanup scheduler when module is imported
if (typeof window !== 'undefined') {
  RecordingManager.startCleanupScheduler();
}
