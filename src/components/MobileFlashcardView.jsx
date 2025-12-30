import { useState } from 'react';
import { User, Calendar, AlertCircle, Stethoscope, ClipboardList, Pill, BookOpen, X } from 'lucide-react';
import CompactVitalsBar from './CompactVitalsBar';
import BottomNavBar from './BottomNavBar';
import ECGMonitor from './ECGMonitor';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const FlashcardView = ({
  case: caseData,
  vitals,
  stability,
  orderedTests,
  testResults,
  givenTreatments,
  physicalExamFindings,
  selectedDiagnosis,
  onOrderTest,
  onGiveMedication,
  onPhysicalExam,
  onSelectDiagnosis,
  onHome,
  onShowHint,
  onShowWalkthrough,
  showHint,
  showWalkthrough,
  hintContent,
  walkthroughContent,
  investigations,
  availableTreatments,
  possibleDiagnoses,
  correctDiagnosis,
  currentState,
  timeLimit,
  timeLimitEnabled,
  realTimeElapsed,
  currentTime
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!caseData) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden pb-20 lg:pb-0">
      {/* Compact Vitals Bar */}
      <CompactVitalsBar vitals={vitals} stability={stability} />

      {/* ECG Monitor (Compact) */}
      <div className="h-20 bg-black border-y border-slate-700 relative">
        <div className="absolute top-1 left-2 text-xs text-green-400 font-mono z-10">
          HR: {vitals?.hr || 70} bpm
        </div>
        <ECGMonitor heartRate={vitals?.hr || 70} height={80} />
      </div>

      {/* Flashcard Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-hidden">
        <div className={`flip-card-container max-w-4xl mx-auto h-full ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner h-full">
            {/* Front Side - Investigation */}
            <div className="flip-card-front">
              <div className="space-y-4 h-full overflow-y-auto p-1">
                {/* Patient Info */}
                <div className="card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">{caseData.patientProfile?.name || 'Patient'}</h2>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{caseData.patientProfile?.age} years, {caseData.patientProfile?.sex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-red-400 font-semibold mb-1">CHIEF COMPLAINT</div>
                        <div className="text-sm text-white font-medium">{caseData.patientProfile?.chiefComplaint}</div>
                      </div>
                    </div>
                  </div>

                  {/* Presenting Symptoms */}
                  {caseData.patientProfile?.presentingSymptoms && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-400 mb-1">Presenting Symptoms:</div>
                      <div className="flex flex-wrap gap-2">
                        {caseData.patientProfile.presentingSymptoms.map((symptom, idx) => (
                          <span key={idx} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Medical History */}
                  {caseData.patientProfile?.pastMedicalHistory && caseData.patientProfile.pastMedicalHistory.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Past Medical History:</div>
                      <div className="text-sm text-slate-300">
                        {caseData.patientProfile.pastMedicalHistory.join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Physical Exam */}
                <div className="card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-semibold text-white">Physical Exam</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onPhysicalExam('auscultation')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Auscultation
                    </button>
                    <button
                      onClick={() => onPhysicalExam('palpation')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Palpation
                    </button>
                    <button
                      onClick={() => onPhysicalExam('neurological')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Neurological
                    </button>
                    <button
                      onClick={() => onPhysicalExam('cardiac')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Cardiac
                    </button>
                  </div>
                  {physicalExamFindings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {physicalExamFindings.map((exam, idx) => (
                        <div key={idx} className="bg-slate-800 rounded-lg p-2">
                          <div className="text-xs font-semibold text-blue-400 mb-1 capitalize">{exam.type}</div>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {exam.findings.map((finding, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1">
                                <span className="text-blue-400">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Tests */}
                <div className="card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-green-400" />
                    <h3 className="text-base font-semibold text-white">Order Tests</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {investigations && investigations.slice(0, 9).map((test) => (
                      <button
                        key={test.id}
                        onClick={() => onOrderTest(test)}
                        disabled={orderedTests?.some(t => t.id === test.id)}
                        className={`p-3 rounded-lg text-sm transition-colors ${
                          orderedTests?.some(t => t.id === test.id)
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {test.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Results */}
                {testResults && testResults.length > 0 && (
                  <div className="card rounded-xl p-4">
                    <h3 className="text-base font-semibold text-white mb-3">Test Results</h3>
                    <div className="space-y-3">
                      {testResults.map((result) => (
                        <div key={result.id} className="bg-slate-800 rounded-lg p-3">
                          <div className="text-sm font-semibold text-white mb-2">{result.name}</div>
                          <div className="text-xs text-slate-300 mb-2 whitespace-pre-line">
                            {typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : result.result}
                          </div>
                          {result.interpretation && (
                            <div className="text-xs text-blue-400 italic">{result.interpretation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnosis Selection */}
                {possibleDiagnoses && possibleDiagnoses.length > 0 && (
                  <div className="card rounded-xl p-4">
                    <h3 className="text-base font-semibold text-white mb-3">Select Diagnosis</h3>
                    <div className="space-y-2">
                      {possibleDiagnoses.map((diagnosis, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectDiagnosis(diagnosis)}
                          disabled={selectedDiagnosis}
                          className={`w-full p-3 rounded-lg text-sm text-left transition-colors ${
                            selectedDiagnosis === diagnosis
                              ? diagnosis === correctDiagnosis
                                ? 'bg-green-500/20 border border-green-500 text-green-400'
                                : 'bg-red-500/20 border border-red-500 text-red-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {diagnosis}
                        </button>
                      ))}
                    </div>
                    {selectedDiagnosis && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        selectedDiagnosis === correctDiagnosis
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                        <div className={`text-sm font-semibold ${
                          selectedDiagnosis === correctDiagnosis ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {selectedDiagnosis === correctDiagnosis
                            ? '✓ Correct! Proceed to treatment.'
                            : `✗ Incorrect. Correct diagnosis: ${correctDiagnosis}`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Back Side - Solution */}
            <div className="flip-card-back">
              <div className="space-y-4 h-full overflow-y-auto p-1">
                {/* Diagnosis */}
                <div className="card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-green-400" />
                    <h3 className="text-base font-semibold text-white">Diagnosis</h3>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="text-lg font-bold text-green-400">{correctDiagnosis}</div>
                  </div>
                </div>

                {/* Treatment */}
                {caseData.correctTreatment && (
                  <div className="card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Pill className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-semibold text-white">Treatment Plan</h3>
                    </div>
                    <div className="space-y-2">
                      {caseData.correctTreatment.sequence?.map((step, idx) => (
                        <div key={idx} className="bg-slate-800 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-white mb-1">{step.description}</div>
                              {step.medication && (
                                <div className="text-xs text-blue-400">{step.medication}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {caseData.correctTreatment.expectedOutcome && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="text-xs text-blue-400 font-semibold mb-1">Expected Outcome</div>
                        <div className="text-sm text-slate-300">{caseData.correctTreatment.expectedOutcome}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* All Test Results */}
                {testResults && testResults.length > 0 && (
                  <div className="card rounded-xl p-4">
                    <h3 className="text-base font-semibold text-white mb-3">All Test Results</h3>
                    <div className="space-y-3">
                      {testResults.map((result) => (
                        <div key={result.id} className="bg-slate-800 rounded-lg p-3">
                          <div className="text-sm font-semibold text-white mb-2">{result.name}</div>
                          <div className="text-xs text-slate-300 mb-2 whitespace-pre-line">
                            {typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : result.result}
                          </div>
                          {result.interpretation && (
                            <div className="text-xs text-blue-400 italic">{result.interpretation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Science Explanation */}
                {caseData.scienceBridge && (
                  <div className="card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <h3 className="text-base font-semibold text-white">The Science</h3>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        className="text-sm text-slate-300 prose prose-invert max-w-none"
                      >
                        {caseData.scienceBridge.pathophysiology}
                      </ReactMarkdown>
                    </div>
                    {caseData.scienceBridge.keyLearningPoints && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-400 mb-2">Key Learning Points:</div>
                        <ul className="space-y-1">
                          {caseData.scienceBridge.keyLearningPoints.map((point, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint Modal */}
      {showHint && hintContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Hint</h3>
              <button
                onClick={() => onShowHint(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-300">{hintContent}</div>
          </div>
        </div>
      )}

      {/* Walkthrough Modal */}
      {showWalkthrough && walkthroughContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Walkthrough Guide</h3>
              <button
                onClick={() => onShowWalkthrough(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-line">{walkthroughContent}</div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavBar
        onHome={onHome}
        onHint={() => onShowHint(!showHint)}
        onWalkthrough={() => onShowWalkthrough(!showWalkthrough)}
        onFlip={() => setIsFlipped(!isFlipped)}
        isFlipped={isFlipped}
        showHint={showHint}
        showWalkthrough={showWalkthrough}
      />
    </div>
  );
};

export default FlashcardView;

