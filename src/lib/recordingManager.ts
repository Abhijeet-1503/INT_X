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

export class RecordingManager {
  private static readonly STORAGE_KEY = 'smartproctor_recordings';
  private static readonly EVENTS_KEY = 'smartproctor_events';
  private static readonly RETENTION_HOURS = 24;

  // Recording management
  static saveRecording(recording: Omit<RecordingData, 'expiresAt' | 'status'>): RecordingData {
    const fullRecording: RecordingData = {
      ...recording,
      expiresAt: new Date(Date.now() + this.RETENTION_HOURS * 60 * 60 * 1000),
      status: 'active'
    };

    const recordings = this.getRecordings();
    recordings.push(fullRecording);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordings));

    return fullRecording;
  }

  static getRecordings(): RecordingData[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    const recordings = JSON.parse(data);
    // Parse dates back to Date objects
    return recordings.map((r: any) => ({
      ...r,
      startTime: new Date(r.startTime),
      endTime: r.endTime ? new Date(r.endTime) : undefined,
      expiresAt: new Date(r.expiresAt)
    }));
  }

  static getActiveRecordings(): RecordingData[] {
    return this.getRecordings().filter(r => r.status === 'active' && r.expiresAt > new Date());
  }

  static cleanupExpiredRecordings(): { deleted: number; expired: number } {
    const recordings = this.getRecordings();
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

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalRecordings));

    return { deleted, expired };
  }

  // Event management
  static saveEvent(event: Omit<FlaggedEvent, 'expiresAt'>): FlaggedEvent {
    const fullEvent: FlaggedEvent = {
      ...event,
      expiresAt: new Date(Date.now() + this.RETENTION_HOURS * 60 * 60 * 1000)
    };

    const events = this.getEvents();
    events.push(fullEvent);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));

    return fullEvent;
  }

  static getEvents(): FlaggedEvent[] {
    const data = localStorage.getItem(this.EVENTS_KEY);
    if (!data) return [];

    const events = JSON.parse(data);
    return events.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp),
      expiresAt: new Date(e.expiresAt)
    }));
  }

  static getEventsByStudent(studentId: string): FlaggedEvent[] {
    return this.getEvents()
      .filter(e => e.studentId === studentId)
      .filter(e => e.expiresAt > new Date())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static getActiveEvents(): FlaggedEvent[] {
    return this.getEvents().filter(e => e.expiresAt > new Date());
  }

  static cleanupExpiredEvents(): number {
    const events = this.getEvents();
    const now = new Date();

    const activeEvents = events.filter(event => {
      if (event.expiresAt <= now) {
        console.log(`Event expired: ${event.id} - ${event.description}`);
        return false;
      }
      return true;
    });

    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(activeEvents));

    return events.length - activeEvents.length;
  }

  // Report generation
  static generateStudentReport(studentId: string, studentName: string, detailed: boolean = false) {
    const events = this.getEventsByStudent(studentId);
    const recordings = this.getActiveRecordings().filter(r => r.studentId === studentId);

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
      const recordingsResult = this.cleanupExpiredRecordings();
      const eventsDeleted = this.cleanupExpiredEvents();

      if (recordingsResult.deleted > 0 || recordingsResult.expired > 0 || eventsDeleted > 0) {
        console.log(`Cleanup completed: ${recordingsResult.deleted} recordings deleted, ${recordingsResult.expired} expired, ${eventsDeleted} events deleted`);
      }
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
