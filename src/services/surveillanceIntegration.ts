// SmartProctor-X Integration with Surveillance Threat Detection Model
// Adapting threat detection parameters to cheating detection

export interface CheatingDetectionConfig {
  windowSeconds: number;
  motionThreshold: number;
  confidenceThreshold: number;
  maxConcurrentStreams: number;
  analysisFrameRate: number;
}

export interface CheatingEvent {
  eventId: string;
  timestamp: Date;
  studentId: string;
  detectionModel: string;
  actionsPredicted: Array<{
    action: string;
    confidence: number;
  }>;
  isCheating: boolean;
  cheatingType: 'FACE_MANIPULATION' | 'UNAUTHORIZED_ASSISTANCE' | 'SUSPICIOUS_MOVEMENT' | 'OBJECT_DETECTION' | 'GAZE_DEVIATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidenceFrames: string[];
  aiJustification: string;
}

export class SurveillanceCheatingDetector {
  private static readonly CHEATING_ACTIONS_MAP = {
    // Original surveillance actions mapped to cheating context
    'hiding': 'FACE_MANIPULATION',
    'covering_face': 'FACE_MANIPULATION',
    'looking_away': 'GAZE_DEVIATION',
    'turning_around': 'SUSPICIOUS_MOVEMENT',
    'reaching_for_object': 'OBJECT_DETECTION',
    'passing_object': 'UNAUTHORIZED_ASSISTANCE',
    'whispering': 'UNAUTHORIZED_ASSISTANCE',
    'gesturing': 'UNAUTHORIZED_ASSISTANCE',
    'writing_secretly': 'OBJECT_DETECTION',
    'using_phone': 'OBJECT_DETECTION',
    'multiple_people': 'UNAUTHORIZED_ASSISTANCE',
    'suspicious_movement': 'SUSPICIOUS_MOVEMENT',
    'coordinated_action': 'UNAUTHORIZED_ASSISTANCE'
  };

  private static readonly PROCTORING_LABELS = [
    // Adapted from Charades labels for proctoring context
    "sitting_normally", "looking_at_screen", "typing", "writing", "reading_question",
    "thinking", "concentrating", "scrolling", "clicking_mouse", "using_keyboard",
    
    // Suspicious activities for proctoring
    "looking_away_from_screen", "turning_head_left", "turning_head_right", "looking_up", "looking_down",
    "covering_camera", "blocking_view", "moving_out_of_frame", "leaning_away", "standing_up",
    "reaching_for_something", "holding_object", "showing_object", "hiding_object", "passing_object",
    "talking", "whispering", "mouthing_words", "making_gestures", "signaling",
    "using_phone", "texting", "making_call", "looking_at_phone", "holding_phone",
    "writing_on_paper", "reading_notes", "consulting_materials", "looking_at_book", "flipping_pages",
    "multiple_faces_detected", "person_entering_frame", "background_movement", "unauthorized_person",
    "coordinated_movement", "suspicious_timing", "repetitive_actions", "unusual_posture",
    "eye_movement_patterns", "gaze_tracking_anomaly", "attention_deviation", "distraction_behavior",
    "cheating_gesture", "academic_dishonesty", "violation_detected", "integrity_breach",
    "normal_exam_behavior", "compliant_posture", "focused_attention", "legitimate_action"
  ];

  // Initialize the surveillance model for proctoring
  static async initializeProctoringModel(): Promise<boolean> {
    try {
      console.log('🔧 Initializing Surveillance-to-Proctoring Model...');
      
      // In a real implementation, we would load the I3D model here
      // For now, we'll simulate the model initialization
      
      console.log('✅ Proctoring surveillance model initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize proctoring model:', error);
      return false;
    }
  }

  // Detect motion in video frames (adapted from original)
  static detectMotion(frames: ImageData[], threshold: number = 30, percentageChanged: number = 0.01): boolean {
    if (frames.length < 2) return false;

    // Simulate motion detection logic
    // In real implementation, this would use OpenCV frame difference
    const motionDetected = Math.random() > 0.7; // 30% chance of motion for demo
    
    console.log(`🔍 Motion Detection: ${motionDetected ? 'Motion detected' : 'No motion'}`);
    return motionDetected;
  }

  // Classify actions using adapted I3D model
  static async classifyProctoringActions(frames: ImageData[]): Promise<Array<{action: string, confidence: number}>> {
    // Simulate I3D model inference for proctoring actions
    const possibleActions = [
      { action: 'looking_away_from_screen', confidence: 0.85 },
      { action: 'using_phone', confidence: 0.92 },
      { action: 'consulting_materials', confidence: 0.78 },
      { action: 'multiple_faces_detected', confidence: 0.95 },
      { action: 'covering_camera', confidence: 0.88 },
      { action: 'making_gestures', confidence: 0.73 },
      { action: 'normal_exam_behavior', confidence: 0.65 }
    ];

    // Return top 3 random actions for demo
    const selectedActions = possibleActions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .sort((a, b) => b.confidence - a.confidence);

    console.log('🎯 Action Classification Results:', selectedActions);
    return selectedActions;
  }

  // Classify cheating using AI (adapted from Gemini threat detection)
  static async classifyCheatingWithAI(predictions: Array<{action: string, confidence: number}>): Promise<{
    isCheating: boolean;
    cheatingType: string;
    severity: string;
    justification: string;
  }> {
    // Format actions for AI analysis
    const actionsText = predictions
      .map(p => `${p.action.replace('_', ' ')} (${(p.confidence * 100).toFixed(1)}% confidence)`)
      .join(', ');

    // Simulate AI analysis (in real implementation, this would call Gemini/OpenAI)
    const prompt = `
    PROCTORING ANALYSIS REQUEST:
    
    The following behaviors were detected during an online examination using an AI surveillance system adapted for academic integrity monitoring:
    
    DETECTED ACTIONS: ${actionsText}
    
    ANALYSIS REQUIRED:
    Based on these detected behaviors, determine:
    1. Is this indicative of CHEATING or academic dishonesty?
    2. What type of cheating behavior is this?
    3. What is the severity level?
    4. Provide justification for your assessment.
    
    CONTEXT: This is an online proctored examination where students should maintain:
    - Eyes focused on screen
    - Hands visible and on keyboard/mouse
    - No unauthorized materials or devices
    - No communication with others
    - Camera unobstructed
    
    Please respond with: "CHEATING" or "NO CHEATING" followed by analysis.
    `;

    // Simulate AI response based on detected actions
    const suspiciousActions = ['using_phone', 'multiple_faces_detected', 'covering_camera', 'consulting_materials', 'looking_away_from_screen'];
    const hasSuspiciousAction = predictions.some(p => suspiciousActions.includes(p.action));
    const highConfidenceSuspicious = predictions.some(p => suspiciousActions.includes(p.action) && p.confidence > 0.8);

    let isCheating = false;
    let cheatingType = 'NORMAL_BEHAVIOR';
    let severity = 'LOW';
    let justification = 'Normal examination behavior detected.';

    if (hasSuspiciousAction) {
      isCheating = true;
      
      // Determine cheating type based on actions
      if (predictions.some(p => p.action.includes('phone') || p.action.includes('device'))) {
        cheatingType = 'OBJECT_DETECTION';
        severity = 'HIGH';
        justification = 'Unauthorized electronic device detected during examination.';
      } else if (predictions.some(p => p.action.includes('multiple_faces') || p.action.includes('person'))) {
        cheatingType = 'UNAUTHORIZED_ASSISTANCE';
        severity = 'CRITICAL';
        justification = 'Multiple people detected in examination area - unauthorized assistance suspected.';
      } else if (predictions.some(p => p.action.includes('covering') || p.action.includes('blocking'))) {
        cheatingType = 'FACE_MANIPULATION';
        severity = 'HIGH';
        justification = 'Camera obstruction detected - potential attempt to circumvent monitoring.';
      } else if (predictions.some(p => p.action.includes('looking_away') || p.action.includes('gaze'))) {
        cheatingType = 'GAZE_DEVIATION';
        severity = 'MEDIUM';
        justification = 'Prolonged gaze deviation detected - possible consultation of unauthorized materials.';
      } else {
        cheatingType = 'SUSPICIOUS_MOVEMENT';
        severity = highConfidenceSuspicious ? 'HIGH' : 'MEDIUM';
        justification = 'Suspicious movement patterns detected that deviate from normal examination behavior.';
      }
    }

    console.log('🤖 AI Cheating Analysis:', { isCheating, cheatingType, severity, justification });

    return {
      isCheating,
      cheatingType,
      severity,
      justification
    };
  }

  // Process video window for cheating detection
  static async processExamWindow(
    videoFrames: ImageData[],
    studentId: string,
    windowIndex: number,
    config: CheatingDetectionConfig
  ): Promise<CheatingEvent | null> {
    console.log(`🔍 Processing exam window ${windowIndex} for student ${studentId}`);

    // Step 1: Motion Detection
    const hasMotion = this.detectMotion(videoFrames, 30, 0.01);
    if (!hasMotion) {
      console.log('⏩ No motion detected, skipping analysis');
      return null;
    }

    // Step 2: Action Classification
    const actionPredictions = await this.classifyProctoringActions(videoFrames);
    
    // Step 3: Cheating Analysis
    const cheatingAnalysis = await this.classifyCheatingWithAI(actionPredictions);

    // Step 4: Create cheating event if detected
    if (cheatingAnalysis.isCheating) {
      const event: CheatingEvent = {
        eventId: `CHT-${Date.now()}-${studentId}`,
        timestamp: new Date(),
        studentId,
        detectionModel: 'I3D-Surveillance-Adapted-v1.0',
        actionsPredicted: actionPredictions,
        isCheating: true,
        cheatingType: cheatingAnalysis.cheatingType as any,
        severity: cheatingAnalysis.severity as any,
        evidenceFrames: [`frame_${windowIndex}_1.jpg`, `frame_${windowIndex}_2.jpg`],
        aiJustification: cheatingAnalysis.justification
      };

      console.log('🚨 CHEATING DETECTED:', event);
      return event;
    }

    console.log('✅ No cheating detected in this window');
    return null;
  }

  // Integration with existing SmartProctor-X system
  static async integrateWithSmartProctor(
    cameraStream: MediaStream,
    studentId: string,
    sessionId: string
  ): Promise<void> {
    console.log('🔗 Integrating surveillance model with SmartProctor-X...');

    const config: CheatingDetectionConfig = {
      windowSeconds: 5,
      motionThreshold: 30,
      confidenceThreshold: 0.7,
      maxConcurrentStreams: 4,
      analysisFrameRate: 2 // Analyze every 2 seconds
    };

    // Set up continuous monitoring
    let windowIndex = 0;
    const analysisInterval = setInterval(async () => {
      try {
        // Capture frames from camera stream
        const frames = await this.captureFramesFromStream(cameraStream, config.windowSeconds);
        
        // Process for cheating detection
        const cheatingEvent = await this.processExamWindow(frames, studentId, windowIndex, config);
        
        if (cheatingEvent) {
          // Send to existing SmartProctor-X alert system
          await this.sendToAlertSystem(cheatingEvent, sessionId);
        }

        windowIndex++;
      } catch (error) {
        console.error('❌ Error in surveillance analysis:', error);
      }
    }, config.analysisFrameRate * 1000);

    // Store interval for cleanup
    (window as any).surveillanceInterval = analysisInterval;
  }

  // Helper method to capture frames from stream
  private static async captureFramesFromStream(stream: MediaStream, windowSeconds: number): Promise<ImageData[]> {
    // Simulate frame capture
    // In real implementation, this would capture actual frames from the video stream
    const frameCount = windowSeconds * 30; // 30 FPS
    const frames: ImageData[] = [];

    for (let i = 0; i < Math.min(frameCount, 10); i++) {
      // Create mock ImageData for demo
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.createImageData(640, 480);
      frames.push(imageData);
    }

    return frames;
  }

  // Send cheating event to SmartProctor-X alert system
  private static async sendToAlertSystem(event: CheatingEvent, sessionId: string): Promise<void> {
    try {
      // Integration with existing alert system
      const alertPayload = {
        sessionId,
        type: 'SURVEILLANCE_CHEATING_DETECTION',
        severity: event.severity,
        message: `Surveillance AI detected: ${event.cheatingType}`,
        details: {
          actions: event.actionsPredicted,
          justification: event.aiJustification,
          evidenceFrames: event.evidenceFrames,
          detectionModel: event.detectionModel
        },
        timestamp: event.timestamp.toISOString()
      };

      // Send to backend API
      const response = await fetch('/api/alerts/surveillance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertPayload)
      });

      if (response.ok) {
        console.log('📤 Surveillance alert sent to SmartProctor-X system');
      } else {
        console.error('❌ Failed to send surveillance alert');
      }
    } catch (error) {
      console.error('❌ Error sending surveillance alert:', error);
    }
  }

  // Cleanup surveillance monitoring
  static stopSurveillanceMonitoring(): void {
    if ((window as any).surveillanceInterval) {
      clearInterval((window as any).surveillanceInterval);
      delete (window as any).surveillanceInterval;
      console.log('🛑 Surveillance monitoring stopped');
    }
  }
}

// Export configuration for easy integration
export const SURVEILLANCE_PROCTORING_CONFIG = {
  WINDOW_SECONDS: 5,
  MAX_THREADS: 4,
  MOTION_THRESHOLD: 30,
  CONFIDENCE_THRESHOLD: 0.7,
  ANALYSIS_INTERVAL: 2000, // 2 seconds
  
  // Cheating type mappings
  CHEATING_TYPES: {
    FACE_MANIPULATION: 'Student attempting to hide or manipulate facial recognition',
    UNAUTHORIZED_ASSISTANCE: 'Multiple people or external help detected',
    SUSPICIOUS_MOVEMENT: 'Unusual movement patterns indicating potential cheating',
    OBJECT_DETECTION: 'Unauthorized objects or devices detected',
    GAZE_DEVIATION: 'Eyes consistently looking away from examination materials'
  },

  // Severity levels
  SEVERITY_LEVELS: {
    LOW: 'Minor suspicious behavior - monitoring recommended',
    MEDIUM: 'Moderate cheating indicators - investigation warranted', 
    HIGH: 'Strong evidence of cheating - immediate intervention recommended',
    CRITICAL: 'Definitive cheating behavior - examination integrity compromised'
  }
};
