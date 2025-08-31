import { useState, useEffect } from "react";
import { Eye, Brain, Mic, Activity, AlertTriangle, Users, Camera, Monitor, ArrowLeft, FileText, Download, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { RecordingManager } from "@/lib/recordingManager";
import { AIAnalysisEngine } from "@/services/aiAnalysis";
import { SurveillanceCheatingDetector } from "@/services/surveillanceIntegration";

// Mock data for demonstration with enhanced reporting
const generateMockStudents = () => {
  const firstNames = ["Alex", "Sarah", "Mike", "Emma", "David", "Lisa", "Tom", "Anna", "John", "Maria"];
  const lastNames = ["Chen", "Kim", "Johnson", "Wilson", "Lee", "Zhang", "Brown", "Davis", "Smith", "Garcia"];
  const emotions = ["focused", "stressed", "distracted", "suspicious"];

  return Array.from({ length: 20 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const suspiciousScore = (Math.random() * 100).toFixed(3); // 3 decimal places
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const voiceActivity = Math.floor(Math.random() * 11);

    // Generate flagged events with timestamps and screenshots
    const flaggedEvents = Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, j) => ({
      id: j + 1,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
      type: ['face_lost', 'multiple_faces', 'audio_anomaly', 'gaze_deviation'][Math.floor(Math.random() * 4)],
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      suspiciousScore: (Math.random() * 100).toFixed(3),
      screenshot: `/api/screenshots/student_${i+1}_event_${j+1}.jpg`,
      description: `Suspicious activity detected: ${(Math.random() * 100).toFixed(1)}% confidence`
    }));

    return {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      suspiciousScore: parseFloat(suspiciousScore),
      suspiciousScoreFormatted: suspiciousScore,
      emotion,
      voiceActivity,
      avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`,
      violations: Math.floor(parseFloat(suspiciousScore) / 20),
      examProgress: Math.floor(Math.random() * 100),
      timeElapsed: Math.floor(Math.random() * 120) + 30,
      cameraActive: Math.random() > 0.3,
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
      flaggedEvents,
      sessionStartTime: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // 2 hours ago max
      recordingUrl: `/api/recordings/student_${i+1}_${new Date().toISOString().split('T')[0]}.mp4`,
      reportGeneratedAt: new Date()
    };
  });
};

const mockStudents = generateMockStudents();

const getAlertLevel = (score: number) => {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
};

const getEmotionColor = (emotion: string) => {
  switch (emotion) {
    case "focused": return "text-green-500";
    case "stressed": return "text-yellow-500";
    case "distracted": return "text-blue-500";
    case "suspicious": return "text-red-500";
    default: return "text-gray-500";
  }
};

const StudentCard = ({ student, onClick, isSelected }: { student: any; onClick: () => void; isSelected: boolean }) => {
  const alertLevel = getAlertLevel(student.suspiciousScore);
  const emotionColor = getEmotionColor(student.emotion);

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      } ${alertLevel === 'critical' ? 'border-red-500 animate-pulse' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
              {student.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{student.name}</h3>
              <p className="text-xs text-muted-foreground">ID: {student.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {student.cameraActive ? (
              <Camera className="w-4 h-4 text-green-500" />
            ) : (
              <Camera className="w-4 h-4 text-gray-400" />
            )}
            <Badge 
              variant={alertLevel === 'critical' ? 'destructive' : alertLevel === 'high' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {student.suspiciousScore}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                alertLevel === 'critical' ? 'bg-red-500' :
                alertLevel === 'high' ? 'bg-orange-500' :
                alertLevel === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${student.suspiciousScore}%` }}
            />
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <Activity className="w-3 h-3 mx-auto mb-1" />
              <p className={emotionColor}>{student.emotion}</p>
            </div>
            <div className="text-center">
              <Mic className="w-3 h-3 mx-auto mb-1" />
              <p>{student.voiceActivity}/10</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-3 h-3 mx-auto mb-1" />
              <p>{student.violations}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StudentDetailPanel = ({ student }: { student: any }) => {
  const [detailedView, setDetailedView] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  if (!student) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
            <p>Click on any student card to view detailed monitoring</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'face_lost': return <Eye className="w-4 h-4 text-red-500" />;
      case 'multiple_faces': return <Users className="w-4 h-4 text-orange-500" />;
      case 'audio_anomaly': return <Mic className="w-4 h-4 text-yellow-500" />;
      case 'gaze_deviation': return <Monitor className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const generateAIReport = async () => {
    setIsGeneratingReport(true);

    try {
      console.log('🤖 Starting AI Report Generation...');

      // Convert events to proper format for AI analysis
      const formattedEvents = student.flaggedEvents.map((event: any) => ({
        id: event.id,
        timestamp: new Date(event.timestamp),
        type: event.type,
        severity: event.severity,
        suspiciousScore: event.suspiciousScore,
        description: event.description
      }));

      // Convert recordings to proper format
      const formattedRecordings = [{
        id: `rec_${student.id}_${Date.now()}`,
        duration: student.timeElapsed * 60,
        fileSize: Math.floor(Math.random() * 100000000) + 50000000
      }];

      // Perform advanced AI analysis
      console.log('🧠 Running Advanced AI Analysis...');
      const aiAnalysis = await AIAnalysisEngine.performAdvancedAIAnalysis(
        formattedEvents,
        formattedRecordings
      );

      // Save events to RecordingManager for persistence
      formattedEvents.forEach((event: any) => {
        RecordingManager.saveEvent({
          id: event.id,
          studentId: student.id.toString(),
          timestamp: event.timestamp,
          type: event.type,
          severity: event.severity,
          suspiciousScore: event.suspiciousScore,
          description: event.description
        });
      });

      // Save recording data
      RecordingManager.saveRecording({
        id: `rec_${student.id}_${Date.now()}`,
        studentId: student.id.toString(),
        studentName: student.name,
        startTime: student.sessionStartTime,
        duration: student.timeElapsed * 60,
        filePath: student.recordingUrl,
        fileSize: Math.floor(Math.random() * 100000000) + 50000000
      });

      // Generate comprehensive AI-powered report
      const reportData = {
        studentInfo: {
          id: student.id,
          name: student.name,
          sessionStartTime: student.sessionStartTime.toISOString(),
          reportGeneratedAt: new Date().toISOString(),
          language: selectedLanguage,
          aiModelVersion: 'SmartProctor-X v2.0 Enhanced AI'
        },
        aiAnalysis: aiAnalysis,
        summary: {
          totalEvents: student.flaggedEvents.length,
          eventsByType: student.flaggedEvents.reduce((acc: any, event: any) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
          }, {}),
          eventsBySeverity: student.flaggedEvents.reduce((acc: any, event: any) => {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
          }, {}),
          totalRecordings: 1,
          totalRecordingTime: student.timeElapsed * 60,
          averageSuspiciousScore: aiAnalysis.riskScore,
          riskAssessment: aiAnalysis.riskLevel
        },
        flaggedEvents: student.flaggedEvents.map((event: any) => ({
          id: event.id,
          timestamp: event.timestamp.toISOString(),
          type: event.type,
          severity: event.severity,
          suspiciousScore: event.suspiciousScore,
          description: event.description,
          aiInterpretation: aiAnalysis.eventInterpretations[event.id] || 'Analysis in progress...'
        })),
        recordings: [{
          id: `rec_${student.id}_${Date.now()}`,
          startTime: student.sessionStartTime.toISOString(),
          duration: student.timeElapsed * 60,
          filePath: student.recordingUrl,
          fileSize: Math.floor(Math.random() * 100000000) + 50000000,
          aiSummary: aiAnalysis.recordingAnalysis[`rec_${student.id}_${Date.now()}`] || 'Processing...'
        }],
        metadata: {
          sessionDuration: student.timeElapsed,
          violations: student.violations,
          cameraActive: student.cameraActive,
          emotion: student.emotion,
          voiceActivity: student.voiceActivity,
          examProgress: student.examProgress,
          generatedBy: 'SmartProctor-X Advanced AI System',
          retentionPolicy: '24-hour auto-deletion',
          aiConfidence: aiAnalysis.confidence,
          analysisTimestamp: new Date().toISOString()
        }
      };

      // Generate AI-powered narrative in selected language
      console.log('📝 Generating AI Narrative Report...');
      const aiNarrative = await generateAINarrativeReport(reportData, selectedLanguage);

      // Combine data and narrative
      const finalReport = {
        ...reportData,
        aiNarrative: aiNarrative
      };

      console.log('✅ AI Report Generation Complete!');

      // Create downloadable report
      const blob = new Blob([JSON.stringify(finalReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-proctor-report-${student.name.replace(' ', '-')}-${selectedLanguage}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('❌ AI Report Generation Error:', error);
      alert('Failed to generate AI report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // AI Narrative Report Generation (multilingual)
  const generateAINarrativeReport = async (reportData: any, language: string) => {
    const templates = {
      en: {
        title: "SmartProctor-X AI Comprehensive Analysis Report",
        introduction: `This advanced AI-generated report provides a comprehensive analysis of the examination session for ${reportData.studentInfo.name}. Using cutting-edge machine learning algorithms and behavioral pattern recognition, our system has processed ${reportData.summary.totalEvents} flagged events with ${reportData.metadata.aiConfidence}% confidence.`,
        riskAssessment: `RISK ASSESSMENT: ${reportData.aiAnalysis.riskLevel} (${reportData.aiAnalysis.riskScore}% suspicion score). ${reportData.aiAnalysis.recommendations.slice(0, 3).join(' ')}`,
        behavioralAnalysis: `BEHAVIORAL ANALYSIS: ${reportData.aiAnalysis.behavioralAnalysis.pattern} pattern detected over ${(reportData.aiAnalysis.behavioralAnalysis.avgInterval).toFixed(1)} minute intervals. Peak activity observed during ${reportData.aiAnalysis.timeAnalysis.peakTime} period.`,
        keyFindings: `KEY FINDINGS: ${reportData.summary.totalEvents} total violations identified. Primary concerns: ${Object.entries(reportData.summary.eventsByType).sort(([,a], [,b]) => b - a)[0][0].replace('_', ' ')}.`,
        recommendations: `RECOMMENDATIONS: ${reportData.aiAnalysis.recommendations.join(' | ')}`,
        conclusion: `CONCLUSION: This session was monitored using SmartProctor-X's advanced AI system. All data will be automatically archived after 24 hours per compliance policies.`
      },
      es: {
        title: "Informe Completo de Análisis IA SmartProctor-X",
        introduction: `Este informe generado por IA avanzada proporciona un análisis integral de la sesión de examen de ${reportData.studentInfo.name}. Utilizando algoritmos de aprendizaje automático de vanguardia y reconocimiento de patrones conductuales, nuestro sistema ha procesado ${reportData.summary.totalEvents} eventos marcados con ${reportData.metadata.aiConfidence}% de confianza.`,
        riskAssessment: `EVALUACIÓN DE RIESGO: ${reportData.aiAnalysis.riskLevel} (${reportData.aiAnalysis.riskScore}% puntuación de sospecha). ${reportData.aiAnalysis.recommendations.slice(0, 3).join(' ')}`,
        behavioralAnalysis: `ANÁLISIS CONDUCTUAL: Patrón ${reportData.aiAnalysis.behavioralAnalysis.pattern} detectado en intervalos de ${(reportData.aiAnalysis.behavioralAnalysis.avgInterval).toFixed(1)} minutos. Actividad máxima observada durante el período ${reportData.aiAnalysis.timeAnalysis.peakTime}.`,
        keyFindings: `HALLAZGOS PRINCIPALES: ${reportData.summary.totalEvents} violaciones totales identificadas. Preocupaciones principales: ${Object.entries(reportData.summary.eventsByType).sort(([,a], [,b]) => b - a)[0][0].replace('_', ' ')}.`,
        recommendations: `RECOMENDACIONES: ${reportData.aiAnalysis.recommendations.join(' | ')}`,
        conclusion: `CONCLUSIÓN: Esta sesión fue monitoreada utilizando el sistema de IA avanzada de SmartProctor-X. Todos los datos serán archivados automáticamente después de 24 horas según las políticas de cumplimiento.`
      },
      fr: {
        title: "Rapport d'Analyse Complet IA SmartProctor-X",
        introduction: `Ce rapport généré par IA avancée fournit une analyse complète de la session d'examen de ${reportData.studentInfo.name}. Utilisant des algorithmes d'apprentissage automatique de pointe et la reconnaissance de schémas comportementaux, notre système a traité ${reportData.summary.totalEvents} événements marqués avec ${reportData.metadata.aiConfidence}% de confiance.`,
        riskAssessment: `ÉVALUATION DES RISQUES: ${reportData.aiAnalysis.riskLevel} (${reportData.aiAnalysis.riskScore}% score de suspicion). ${reportData.aiAnalysis.recommendations.slice(0, 3).join(' ')}`,
        behavioralAnalysis: `ANALYSE COMPORTEMENTALE: Schéma ${reportData.aiAnalysis.behavioralAnalysis.pattern} détecté sur des intervalles de ${(reportData.aiAnalysis.behavioralAnalysis.avgInterval).toFixed(1)} minutes. Activité maximale observée pendant la période ${reportData.aiAnalysis.timeAnalysis.peakTime}.`,
        keyFindings: `CONSTATATIONS CLÉS: ${reportData.summary.totalEvents} violations totales identifiées. Préoccupations principales: ${Object.entries(reportData.summary.eventsByType).sort(([,a], [,b]) => b - a)[0][0].replace('_', ' ')}.`,
        recommendations: `RECOMMANDATIONS: ${reportData.aiAnalysis.recommendations.join(' | ')}`,
        conclusion: `CONCLUSION: Cette session a été surveillée à l'aide du système IA avancé de SmartProctor-X. Toutes les données seront automatiquement archivées après 24 heures selon les politiques de conformité.`
      },
      de: {
        title: "SmartProctor-X KI-Vollanalyse-Bericht",
        introduction: `Dieser fortschrittliche KI-generierte Bericht bietet eine umfassende Analyse der Prüfungssitzung von ${reportData.studentInfo.name}. Unter Verwendung modernster Algorithmen des maschinellen Lernens und der Verhaltensmustererkennung hat unser System ${reportData.summary.totalEvents} markierte Ereignisse mit ${reportData.metadata.aiConfidence}% Zuverlässigkeit verarbeitet.`,
        riskAssessment: `RISIKOBEWERTUNG: ${reportData.aiAnalysis.riskLevel} (${reportData.aiAnalysis.riskScore}% Verdachtswert). ${reportData.aiAnalysis.recommendations.slice(0, 3).join(' ')}`,
        behavioralAnalysis: `VERHALTENSANALYSE: ${reportData.aiAnalysis.behavioralAnalysis.pattern}-Muster über ${(reportData.aiAnalysis.behavioralAnalysis.avgInterval).toFixed(1)}-Minuten-Intervalle erkannt. Maximale Aktivität während der ${reportData.aiAnalysis.timeAnalysis.peakTime}-Periode beobachtet.`,
        keyFindings: `WICHTIGSTE ERGEBNISSE: ${reportData.summary.totalEvents} Gesamtverstöße identifiziert. Hauptsorgen: ${Object.entries(reportData.summary.eventsByType).sort(([,a], [,b]) => b - a)[0][0].replace('_', ' ')}.`,
        recommendations: `EMPEHLUNGEN: ${reportData.aiAnalysis.recommendations.join(' | ')}`,
        conclusion: `SCHLUSSFOLGERUNG: Diese Sitzung wurde mit dem fortschrittlichen KI-System von SmartProctor-X überwacht. Alle Daten werden nach 24 Stunden gemäß den Compliance-Richtlinien automatisch archiviert.`
      },
      zh: {
        title: "SmartProctor-X AI全面分析报告",
        introduction: `这份先进的AI生成报告为${reportData.studentInfo.name}的考试会话提供了全面分析。使用尖端的机器学习算法和行为模式识别，我们的系统以${reportData.metadata.aiConfidence}%的置信度处理了${reportData.summary.totalEvents}个标记事件。`,
        riskAssessment: `风险评估：${reportData.aiAnalysis.riskLevel}（${reportData.aiAnalysis.riskScore}%可疑分数）。${reportData.aiAnalysis.recommendations.slice(0, 3).join(' ')}`,
        behavioralAnalysis: `行为分析：在${(reportData.aiAnalysis.behavioralAnalysis.avgInterval).toFixed(1)}分钟间隔内检测到${reportData.aiAnalysis.behavioralAnalysis.pattern}模式。在${reportData.aiAnalysis.timeAnalysis.peakTime}期间观察到峰值活动。`,
        keyFindings: `关键发现：识别出${reportData.summary.totalEvents}个违规行为。主要关注点：${Object.entries(reportData.summary.eventsByType).sort(([,a], [,b]) => b - a)[0][0].replace('_', ' ')}。`,
        recommendations: `建议：${reportData.aiAnalysis.recommendations.join(' | ')}`,
        conclusion: `结论：此会话使用SmartProctor-X的先进AI系统进行监控。根据合规政策，所有数据将在24小时后自动存档。`
      }
    };

    const template = templates[language as keyof typeof templates] || templates.en;

    return {
      title: template.title,
      introduction: template.introduction,
      riskAssessment: template.riskAssessment,
      behavioralAnalysis: template.behavioralAnalysis,
      keyFindings: template.keyFindings,
      recommendations: template.recommendations,
      conclusion: template.conclusion,
      fullNarrative: `${template.title}\n\n${template.introduction}\n\n${template.riskAssessment}\n\n${template.behavioralAnalysis}\n\n${template.keyFindings}\n\n${template.recommendations}\n\n${template.conclusion}`
    };
  };

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{student.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={getAlertLevel(student.suspiciousScore) === 'critical' ? 'destructive' : 'secondary'}>
                Risk: {getAlertLevel(student.suspiciousScore).toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailedView(!detailedView)}
              >
                {detailedView ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Language Selector for AI Reports */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">AI Report Language</h4>
                <p className="text-sm text-blue-700">Select language for AI-generated reports</p>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
            </div>
          </div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Flagged Events</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Suspicion Score</p>
                  <p className="text-2xl font-bold">
                    {detailedView ? `${student.suspiciousScoreFormatted}%` : '***'}
                  </p>
                  {!detailedView && (
                    <p className="text-xs text-muted-foreground">Hidden - use detailed view</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exam Progress</p>
                  <p className="text-2xl font-bold">{student.examProgress}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Elapsed</p>
                  <p className="text-lg font-semibold">{Math.floor(student.timeElapsed / 60)}h {student.timeElapsed % 60}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Violations</p>
                  <p className="text-lg font-semibold text-red-500">{student.violations}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Session Started</p>
                    <p className="text-sm">{formatDate(student.sessionStartTime)} at {formatTime(student.sessionStartTime)}</p>
                  </div>
                  <Button
                    onClick={generateAIReport}
                    disabled={isGeneratingReport}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isGeneratingReport ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Generating AI Report...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate AI Report ({selectedLanguage.toUpperCase()})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {student.flaggedEvents.map((event: any) => (
                  <Card key={event.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getEventIcon(event.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              event.severity === 'critical' ? 'destructive' :
                              event.severity === 'high' ? 'destructive' :
                              event.severity === 'medium' ? 'default' : 'secondary'
                            }>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(event.timestamp)} {formatTime(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm font-medium capitalize">{event.type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          {detailedView && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Suspicious Score: {event.suspiciousScore}%
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recordings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Session Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Recording: {formatDate(new Date())}</p>
                      <p className="text-xs">24-hour retention</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Expires in</p>
                      <p className="text-sm font-medium">23h 45m</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Extend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Camera Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Live Camera Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            {student.cameraActive ? (
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-4" />
                <p>Live Feed: {student.name}</p>
                <p className="text-sm text-gray-400">Camera Active</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Camera Inactive</p>
                <p className="text-sm">No video feed available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

                {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Take Screenshot
            </Button>
            <Button variant="outline" size="sm">
              <Monitor className="w-4 h-4 mr-2" />
              Record Session
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Flag Violation
            </Button>
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </Button>
          </div>

          {/* Level 1 Integration */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Proctoring Integration</h4>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="default"
                onClick={() => {
                  // Navigate to Level 1 with student data
                  const level1Url = `/level1?student=${encodeURIComponent(student.name)}&id=${student.id}`;
                  window.open(level1Url, '_blank');
                }}
                className="w-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                Connect to Level 1 Proctoring
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  console.log('🔧 Initializing Surveillance Model for SmartProctor-X...');
                  const initialized = await SurveillanceCheatingDetector.initializeProctoringModel();
                  if (initialized) {
                    alert(`✅ Surveillance Model Integrated Successfully!\n\nThe threat detection model has been adapted for cheating detection:\n\n🎯 Threat → Cheating Detection\n📊 Actions: ${student.flaggedEvents.length} events analyzed\n🤖 AI Model: I3D-Surveillance-Adapted\n⚖️ Legal Grade: Professional reporting enabled\n\nThe system is now monitoring for:\n• Face manipulation\n• Unauthorized assistance\n• Suspicious movements\n• Object detection\n• Gaze deviation`);
                  } else {
                    alert('❌ Failed to initialize surveillance model');
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Activate Surveillance AI Model
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Export data to Level 1 format using RecordingManager
                  const level1Data = {
                    student: {
                      id: student.id,
                      name: student.name,
                      suspiciousScore: student.suspiciousScoreFormatted,
                      sessionStartTime: student.sessionStartTime.toISOString(),
                      flaggedEvents: student.flaggedEvents
                    },
                    recordings: RecordingManager.getActiveRecordings().filter(r => r.studentId === student.id.toString()),
                    events: RecordingManager.getEventsByStudent(student.id.toString()),
                    timestamp: new Date().toISOString(),
                    source: 'admin-panel',
                    retentionPolicy: '24-hour auto-deletion'
                  };

                  const blob = new Blob([JSON.stringify(level1Data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `level1-data-${student.name.replace(' ', '-')}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Level 1 Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminPanel = () => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;
    
    const interval = setInterval(() => {
      mockStudents.forEach(student => {
        const variation = (Math.random() - 0.5) * 10;
        student.suspiciousScore = Math.max(0, Math.min(100, student.suspiciousScore + variation));
        student.voiceActivity = Math.max(0, Math.min(10, Math.floor(Math.random() * 11)));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  const criticalStudents = mockStudents.filter(s => s.suspiciousScore >= 80).length;
  const highRiskStudents = mockStudents.filter(s => s.suspiciousScore >= 60 && s.suspiciousScore < 80).length;
  const activeStudents = mockStudents.filter(s => s.cameraActive).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">SmartProctor-X Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">System Active</span>
              </div>
              <Button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                variant={realTimeUpdates ? "default" : "outline"}
                size="sm"
              >
                {realTimeUpdates ? 'Live Updates ON' : 'Live Updates OFF'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{mockStudents.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{activeStudents}</p>
              <p className="text-sm text-muted-foreground">Camera Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{highRiskStudents}</p>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{criticalStudents}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" />
                Student Monitor Grid
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onClick={() => setSelectedStudent(student)}
                    isSelected={selectedStudent?.id === student.id}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <StudentDetailPanel student={selectedStudent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;



