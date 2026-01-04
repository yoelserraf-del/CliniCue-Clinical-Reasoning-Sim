import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { 
  User, Calendar, AlertCircle, Stethoscope, ClipboardList, Pill, Heart, Droplets, 
  Wind, Thermometer, Activity, RotateCcw, FlipHorizontal2, Lightbulb, BookOpen, 
  X, ChevronRight, CheckCircle2, Clock, SkipForward, Home 
} from 'lucide-react';
import ECGMonitor from './ECGMonitor';
import testLibrary from '../data/TestLibrary.json';
import { getTimeRemaining, getTimeWarning } from '../utils/timeManager';

// Constants
const DIFFICULTY_MAP = {
  'highschool': 'highschool',
  'premed': 'premed',
  'pre-med': 'premed',
  'student': 'student',
  'med school': 'student',
  'resident': 'resident',
  'residency': 'resident'
};

const ANIMATION_DURATION = 700;
const SCROLL_STYLE = {
  WebkitOverflowScrolling: 'touch',
  touchAction: 'pan-y',
  overscrollBehavior: 'contain',
  minHeight: 0,
  flex: '1 1 auto',
  position: 'relative',
  transform: 'translateZ(0)',
  willChange: 'scroll-position',
  overflowY: 'scroll',
  height: 0
};

const FLEX_CONTAINER_STYLE = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const NewFlashcardView = ({
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
  onNextCase,
  onReplay,
  onCompleteCase,
  onSkipCase,
  investigations,
  availableTreatments,
  possibleDiagnoses,
  correctDiagnosis,
  currentState,
  difficulty,
  onShowHint,
  onShowWalkthrough,
  showHint,
  showWalkthrough,
  hintContent,
  walkthroughContent,
  timeLimit,
  timeLimitEnabled,
  realTimeElapsed,
  currentTime
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null);
  const [showDiagnosisResult, setShowDiagnosisResult] = useState(false);

  // Reset animation state when case changes
  useEffect(() => {
    setIsAnimating(false);
    setAnimationDirection(null);
    setShowDiagnosisResult(false);
    setIsFlipped(false);
  }, [caseData?.id]);

  // Get all available tests from TestLibrary filtered by difficulty
  const allAvailableTests = useMemo(() => {
    if (!difficulty) return investigations || [];
    
    const mappedDifficulty = DIFFICULTY_MAP[difficulty] || 'student';
    const libraryTests = testLibrary.filter(test => 
      test.availableAtDifficulty.includes(mappedDifficulty)
    );
    
    // Combine case-specific investigations with library tests, avoiding duplicates
    const caseTestIds = new Set((investigations || []).map(inv => inv.id));
    const additionalTests = libraryTests.filter(test => !caseTestIds.has(test.id));
    
    return [...(investigations || []), ...additionalTests];
  }, [investigations, difficulty]);

  // Use initial vitals if vitals not provided
  const displayVitals = useMemo(() => 
    vitals || caseData?.initialVitals || {}, 
    [vitals, caseData?.initialVitals]
  );

  // Get vital color for white background
  const getVitalColor = useCallback((type) => {
    if (!displayVitals) return 'text-gray-700';
    
    switch (type) {
      case 'hr':
        return displayVitals.hr > 100 ? 'text-red-600' : 
               displayVitals.hr < 60 ? 'text-yellow-600' : 'text-green-600';
      case 'bp':
        if (!displayVitals.bp) return 'text-gray-700';
        const systolic = parseInt(displayVitals.bp.split('/')[0]);
        return systolic > 140 ? 'text-yellow-600' : 
               systolic < 90 ? 'text-red-600' : 'text-green-600';
      case 'spo2':
        return displayVitals.spo2 < 95 ? 'text-red-600' : 
               displayVitals.spo2 < 98 ? 'text-yellow-600' : 'text-green-600';
      case 'temp':
        return displayVitals.temp > 37.5 ? 'text-red-600' : 
               displayVitals.temp < 36.0 ? 'text-yellow-600' : 'text-green-600';
      case 'rr':
        return displayVitals.rr > 20 ? 'text-red-600' : 
               displayVitals.rr < 12 ? 'text-yellow-600' : 'text-green-600';
      default:
        return 'text-gray-700';
    }
  }, [displayVitals]);

  const getStabilityColor = useCallback(() => {
    if (stability >= 80) return 'bg-green-500';
    if (stability >= 60) return 'bg-yellow-500';
    if (stability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }, [stability]);

  const getStabilityTextColor = useCallback(() => {
    if (stability >= 80) return 'text-green-600';
    if (stability >= 60) return 'text-yellow-600';
    if (stability >= 40) return 'text-orange-600';
    return 'text-red-600';
  }, [stability]);

  // Calculate time remaining and warning
  const timeRemaining = useMemo(() => 
    timeLimit && realTimeElapsed !== undefined 
      ? getTimeRemaining(timeLimit, realTimeElapsed) 
      : null,
    [timeLimit, realTimeElapsed]
  );

  const timeWarning = useMemo(() => 
    timeLimit && realTimeElapsed !== undefined 
      ? getTimeWarning(timeLimit, realTimeElapsed) 
      : 'normal',
    [timeLimit, realTimeElapsed]
  );

  // Get time bar color
  const getTimeBarColor = useCallback(() => {
    if (timeWarning === 'critical') return 'bg-red-500';
    if (timeWarning === 'warning') return 'bg-yellow-500';
    return 'bg-slate-700';
  }, [timeWarning]);

  const getTimeTextColor = useCallback(() => {
    if (timeWarning === 'critical') return 'text-red-600';
    if (timeWarning === 'warning') return 'text-yellow-600';
    return 'text-slate-700';
  }, [timeWarning]);

  const handleDiagnosisSelect = useCallback((diagnosis) => {
    onSelectDiagnosis(diagnosis);
    setShowDiagnosisResult(true);
  }, [onSelectDiagnosis]);

  const handleFlip = useCallback(() => {
    if (!orderedTests || orderedTests.length === 0) {
      alert('You must order at least one test before making a diagnosis.');
      return;
    }
    setIsFlipped(true);
  }, [orderedTests]);

  const handleNextCaseWithAnimation = useCallback((direction) => {
    setAnimationDirection(direction);
    setIsAnimating(true);
    setTimeout(() => {
      if (onNextCase) onNextCase();
      setIsAnimating(false);
      setAnimationDirection(null);
      setShowDiagnosisResult(false);
      setIsFlipped(false);
    }, ANIMATION_DURATION);
  }, [onNextCase]);

  const handleSkipCase = useCallback(() => {
    if (onSkipCase) {
      setAnimationDirection('bottom');
      setIsAnimating(true);
      setTimeout(() => {
        onSkipCase();
        setIsAnimating(false);
        setAnimationDirection(null);
        setShowDiagnosisResult(false);
        setIsFlipped(false);
      }, ANIMATION_DURATION);
    }
  }, [onSkipCase]);

  // Check if case is complete
  const isCaseComplete = useMemo(() => {
    if (!selectedDiagnosis) return false;
    const correctSequence = caseData?.correctTreatment?.sequence || [];
    const expectedActions = correctSequence.map(s => s.action);
    return expectedActions.length > 0 && expectedActions.every(action => givenTreatments.includes(action));
  }, [selectedDiagnosis, caseData?.correctTreatment, givenTreatments]);

  // Show loading if case data is missing
  if (!caseData) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading case data...</div>
          <div className="text-slate-300 text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  if (!displayVitals || Object.keys(displayVitals).length === 0) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading vitals...</div>
          <div className="text-slate-300 text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  // Vitals Header Component (reusable)
  const VitalsHeader = () => (
    <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-gray-200 p-4">
      {/* Compact Vitals Display */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <div className="flex flex-col items-center">
          <Heart className={`w-5 h-5 ${getVitalColor('hr')} mb-1`} />
          <span className={`text-sm font-bold font-mono ${getVitalColor('hr')}`}>
            {displayVitals.hr || '--'}
          </span>
          <span className="text-[10px] text-gray-600">HR</span>
        </div>
        <div className="flex flex-col items-center">
          <Droplets className={`w-5 h-5 ${getVitalColor('bp')} mb-1`} />
          <span className={`text-xs font-bold font-mono ${getVitalColor('bp')}`}>
            {displayVitals.bp || '--'}
          </span>
          <span className="text-[10px] text-gray-600">BP</span>
        </div>
        <div className="flex flex-col items-center">
          <Wind className={`w-5 h-5 ${getVitalColor('rr')} mb-1`} />
          <span className={`text-sm font-bold font-mono ${getVitalColor('rr')}`}>
            {displayVitals.rr || '--'}
          </span>
          <span className="text-[10px] text-gray-600">RR</span>
        </div>
        <div className="flex flex-col items-center">
          <Activity className={`w-5 h-5 ${getVitalColor('spo2')} mb-1`} />
          <span className={`text-sm font-bold font-mono ${getVitalColor('spo2')}`}>
            {displayVitals.spo2 || '--'}%
          </span>
          <span className="text-[10px] text-gray-600">SpO2</span>
        </div>
        <div className="flex flex-col items-center">
          <Thermometer className={`w-5 h-5 ${getVitalColor('temp')} mb-1`} />
          <span className={`text-sm font-bold font-mono ${getVitalColor('temp')}`}>
            {typeof displayVitals.temp === 'number' ? displayVitals.temp.toFixed(1) : displayVitals.temp || '--'}°
          </span>
          <span className="text-[10px] text-gray-600">Temp</span>
        </div>
      </div>

      {/* Stability Indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase">Stability</span>
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStabilityColor()} transition-all duration-300`}
              style={{ width: `${stability}%` }}
            />
          </div>
          <span className={`text-sm font-bold min-w-[40px] text-right ${getStabilityTextColor()}`}>
            {Math.round(stability)}%
          </span>
        </div>
      </div>

      {/* Time Remaining */}
      {timeLimitEnabled && timeLimit && realTimeElapsed !== undefined && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-semibold text-gray-600 uppercase">Time</span>
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getTimeBarColor()}`}
                style={{ width: timeRemaining ? `${(timeRemaining / timeLimit) * 100}%` : '0%' }}
              />
            </div>
            <span className={`text-xs font-bold min-w-[50px] text-right ${getTimeTextColor()}`}>
              {timeRemaining !== null ? `${timeRemaining}m` : '--'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // ECG Monitor Component (reusable) - memoized to prevent unnecessary re-renders
  const ECGSection = useMemo(() => {
    const heartRate = displayVitals?.hr || 70;
    return (
      <div className="h-24 bg-slate-900 border-y border-gray-300 relative">
        <div className="absolute top-2 left-3 text-xs text-green-400 font-mono z-10">
          HR: {heartRate} bpm
        </div>
        <ECGMonitor heartRate={heartRate} height={96} />
      </div>
    );
  }, [displayVitals?.hr]);

  // Patient Info Component
  const PatientInfoCard = () => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">
            {caseData.patientProfile?.name || 'Patient'}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{caseData.patientProfile?.age} years, {caseData.patientProfile?.sex}</span>
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs text-red-600 font-semibold mb-1">CHIEF COMPLAINT</div>
            <div className="text-sm text-gray-900 font-medium">
              {caseData.patientProfile?.chiefComplaint}
            </div>
          </div>
        </div>
      </div>

      {/* Presenting Symptoms */}
      {caseData.patientProfile?.presentingSymptoms && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">Presenting Symptoms:</div>
          <div className="flex flex-wrap gap-2">
            {caseData.patientProfile.presentingSymptoms.map((symptom, idx) => (
              <span key={idx} className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded-md">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Past Medical History */}
      {caseData.patientProfile?.pastMedicalHistory && caseData.patientProfile.pastMedicalHistory.length > 0 && (
        <div>
          <div className="text-xs text-gray-600 mb-1 font-semibold">Past Medical History:</div>
          <div className="text-sm text-gray-700">
            {caseData.patientProfile.pastMedicalHistory.join(', ')}
          </div>
        </div>
      )}
    </div>
  );

  // Physical Exam Component
  const PhysicalExamSection = () => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope className="w-5 h-5 text-slate-700" />
        <h3 className="text-base font-semibold text-gray-900">Physical Exam</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['auscultation', 'palpation', 'neurological', 'cardiac'].map((examType) => (
          <button
            key={examType}
            onClick={() => onPhysicalExam(examType)}
            className="p-3 bg-white hover:bg-slate-100 border border-gray-300 rounded-lg text-sm text-gray-900 transition-colors capitalize"
          >
            {examType}
          </button>
        ))}
      </div>
      {physicalExamFindings.length > 0 && (
        <div className="mt-3 space-y-2">
          {physicalExamFindings.map((exam, idx) => (
            <div key={idx} className="bg-white border border-gray-300 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-700 mb-1 capitalize">{exam.type}</div>
              <ul className="text-xs text-gray-700 space-y-1">
                {exam.findings.map((finding, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-1">
                    <span className="text-slate-700">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Test Ordering Component
  const TestOrderingSection = () => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5 text-green-600" />
        <h3 className="text-base font-semibold text-gray-900">Order Tests</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {allAvailableTests.map((test) => {
          const isOrdered = orderedTests?.some(t => t.id === test.id);
          const isCompleted = testResults?.some(r => r.id === test.id);
          const orderedTest = orderedTests?.find(t => t.id === test.id);
          const timeRemaining = orderedTest && !isCompleted 
            ? Math.max(0, (orderedTest.orderedAt + (orderedTest.timeCost || 0)) - currentTime)
            : null;
          
          return (
            <button
              key={test.id}
              onClick={() => onOrderTest(test)}
              disabled={isOrdered}
              className={`p-3 rounded-lg text-sm transition-colors relative ${
                isCompleted
                  ? 'bg-green-100 border-2 border-green-500 text-green-700 font-semibold'
                  : isOrdered
                  ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-700 font-semibold'
                  : 'bg-white hover:bg-green-50 border border-gray-300 text-gray-900'
              }`}
            >
              <div className="font-semibold">{test.name}</div>
              {isOrdered && !isCompleted && timeRemaining !== null && timeRemaining > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  {timeRemaining}m remaining
                </div>
              )}
              {isCompleted && (
                <div className="text-xs mt-1 opacity-75">✓ Completed</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Pending Tests Component
  const PendingTestsSection = () => {
    const pendingTests = orderedTests?.filter(t => !testResults?.some(r => r.id === t.id)) || [];
    
    if (pendingTests.length === 0) return null;

    return (
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Pending Tests</h3>
        <div className="space-y-2">
          {pendingTests.map((test) => {
            const timeRemaining = Math.max(0, (test.orderedAt + (test.timeCost || 0)) - currentTime);
            return (
              <div key={test.id} className="bg-white border border-yellow-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{test.name}</div>
                  <div className="text-xs text-yellow-700 font-semibold">
                    {timeRemaining > 0 ? `${timeRemaining}m remaining` : 'Completing...'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Test Results Component
  const TestResultsSection = () => {
    if (!testResults || testResults.length === 0) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Test Results</h3>
        <div className="space-y-3">
          {testResults.map((result) => (
            <div key={result.id} className="bg-white border border-gray-300 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900">{result.name}</div>
                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                  ✓ Completed
                </div>
              </div>
              <div className="text-xs text-gray-700 mb-2 whitespace-pre-line">
                {typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : result.result}
              </div>
              {result.interpretation && (
                <div className="text-xs text-slate-700 italic mt-2 pt-2 border-t border-gray-200">
                  {result.interpretation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Diagnosis Selection Component
  const DiagnosisSelectionSection = () => {
    if (!possibleDiagnoses || possibleDiagnoses.length === 0) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-semibold text-gray-900">Select Diagnosis</h3>
        </div>
        {(!orderedTests || orderedTests.length === 0) ? (
          <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <div className="text-sm text-yellow-700 font-semibold mb-1">Order tests first</div>
            <div className="text-xs text-yellow-600">
              You must order at least one test before making a diagnosis.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {possibleDiagnoses.map((diagnosis, idx) => (
              <button
                key={idx}
                onClick={() => handleDiagnosisSelect(diagnosis)}
                disabled={selectedDiagnosis}
                className={`w-full p-3 rounded-lg text-sm text-left transition-colors ${
                  selectedDiagnosis === diagnosis
                    ? diagnosis === correctDiagnosis
                      ? 'bg-green-100 border-2 border-green-500 text-green-700 font-semibold'
                      : 'bg-red-100 border-2 border-red-500 text-red-700 font-semibold'
                    : 'bg-white hover:bg-slate-100 border border-gray-300 text-gray-900'
                }`}
              >
                {diagnosis}
              </button>
            ))}
          </div>
        )}
        {showDiagnosisResult && selectedDiagnosis && (
          <div className={`mt-3 p-3 rounded-lg ${
            selectedDiagnosis === correctDiagnosis
              ? 'bg-green-50 border border-green-300'
              : 'bg-red-50 border border-red-300'
          }`}>
            <div className={`text-sm font-semibold ${
              selectedDiagnosis === correctDiagnosis ? 'text-green-700' : 'text-red-700'
            }`}>
              {selectedDiagnosis === correctDiagnosis
                ? '✓ Correct! Great job!'
                : '✗ Incorrect. The correct diagnosis will be shown below.'
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  // Treatment Selection Component
  const TreatmentSelectionSection = () => {
    if (!selectedDiagnosis) return null;

    const correctSequence = caseData?.correctTreatment?.sequence || [];
    const expectedActions = correctSequence.map(s => s.action);

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-semibold text-gray-900">Select Treatment</h3>
        </div>
        {availableTreatments && availableTreatments.length > 0 ? (
          <div className="space-y-2">
            {availableTreatments.map((treatment, idx) => {
              const isGiven = givenTreatments.includes(treatment.action);
              const isCorrect = expectedActions.includes(treatment.action);
              
              return (
                <button
                  key={idx}
                  onClick={() => onGiveMedication && onGiveMedication(treatment.action)}
                  disabled={isGiven}
                  className={`w-full p-3 rounded-lg text-sm text-left transition-colors ${
                    isGiven
                      ? isCorrect
                        ? 'bg-green-100 border-2 border-green-500 text-green-700 font-semibold'
                        : 'bg-red-100 border-2 border-red-500 text-red-700 font-semibold'
                      : 'bg-white hover:bg-slate-100 border border-gray-300 text-gray-900'
                  }`}
                >
                  <div className="font-semibold">{treatment.label || treatment.description}</div>
                  {treatment.description && treatment.label && (
                    <div className="text-xs text-gray-600 mt-1">{treatment.description}</div>
                  )}
                  {isGiven && (
                    <div className="text-xs mt-1">
                      {isCorrect ? '✓ Correct treatment' : '✗ Incorrect treatment'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-600">No treatments available for this case.</div>
        )}
        
        {givenTreatments.length > 0 && (
          <div className="mt-3 p-3 bg-slate-100 border border-slate-300 rounded-lg">
            <div className="text-xs text-slate-700 font-semibold mb-1">Treatments Given</div>
            <div className="text-sm text-gray-700">
              {givenTreatments.map((t, idx) => (
                <span key={idx}>
                  {availableTreatments?.find(at => at.action === t)?.label || t}
                  {idx < givenTreatments.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Correct Treatment Plan Component
  const CorrectTreatmentPlanSection = () => {
    if (!caseData?.correctTreatment || givenTreatments.length === 0) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-semibold text-gray-900">Correct Treatment Plan</h3>
        </div>
        <div className="space-y-2">
          {caseData.correctTreatment.sequence?.map((step, idx) => {
            const isGiven = givenTreatments.includes(step.action);
            return (
              <div key={idx} className={`bg-white border rounded-lg p-3 ${
                isGiven ? 'border-green-500' : 'border-gray-300'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    isGiven ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {isGiven ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{step.description}</div>
                    {step.medication && (
                      <div className="text-xs text-slate-700">{step.medication}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {caseData.correctTreatment.expectedOutcome && (
          <div className="mt-3 p-3 bg-slate-100 border border-slate-300 rounded-lg">
            <div className="text-xs text-slate-700 font-semibold mb-1">Expected Outcome</div>
            <div className="text-sm text-gray-700">{caseData.correctTreatment.expectedOutcome}</div>
          </div>
        )}
      </div>
    );
  };

  // Diagnosis Result Component
  const DiagnosisResultSection = () => {
    if (!showDiagnosisResult) return null;

    const correctSequence = caseData?.correctTreatment?.sequence || [];
    const expectedActions = correctSequence.map(s => s.action);
    const allTreatmentsGiven = expectedActions.length > 0 && expectedActions.every(action => givenTreatments.includes(action));
    const isComplete = selectedDiagnosis && allTreatmentsGiven;

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-semibold text-gray-900">Correct Diagnosis</h3>
        </div>
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div className="text-lg font-bold text-green-700">{correctDiagnosis}</div>
        </div>
        
        {isComplete && selectedDiagnosis === correctDiagnosis && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Replay Case
            </button>
            <button
              onClick={() => handleNextCaseWithAnimation('right')}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
            >
              Next Case <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {isComplete && selectedDiagnosis !== correctDiagnosis && (
          <div className="mt-3">
            <button
              onClick={() => handleNextCaseWithAnimation('bottom')}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Continue to Next Case
            </button>
          </div>
        )}
        
        {!isComplete && (
          <div className="mt-3 space-y-2">
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="text-xs text-yellow-700 font-semibold mb-1">
                {!selectedDiagnosis ? 'Please select a diagnosis' : 'Please complete all treatments'}
              </div>
              <div className="text-xs text-yellow-600">
                {!selectedDiagnosis 
                  ? 'Select a diagnosis above to proceed.'
                  : `Complete ${expectedActions.length - givenTreatments.length} more treatment(s) to finish the case.`
                }
              </div>
            </div>
            {onCompleteCase && (
              <button
                onClick={onCompleteCase}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Complete Case (Will Score 0 if Incomplete)
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Home Button - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={onHome}
          className="p-3 rounded-full shadow-lg transition-all bg-slate-700 text-white hover:bg-slate-600"
          title="Go home"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
      
      {/* Hint, Walkthrough, and Skip Buttons - Top Right */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => onShowHint && onShowHint(!showHint)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            showHint ? 'bg-slate-700 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          title="Get a hint"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
        <button
          onClick={() => onShowWalkthrough && onShowWalkthrough(!showWalkthrough)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            showWalkthrough ? 'bg-slate-700 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          title="Show walkthrough"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        {onSkipCase && (
          <button
            onClick={handleSkipCase}
            className="p-3 rounded-full shadow-lg transition-all bg-slate-700 text-white hover:bg-slate-600"
            title="Skip this case"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* White Flashcard Container */}
      <div className={`w-full max-w-md h-[90vh] max-h-[800px] relative transition-all duration-500 ${
        isAnimating && animationDirection === 'right' ? 'translate-x-[200%] opacity-0' :
        isAnimating && animationDirection === 'bottom' ? 'translate-y-[200%] opacity-0' :
        ''
      }`}>
        <div className={`flip-card-container w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner w-full h-full">
            {/* Front Side - Testing & Investigation */}
            <div className="flip-card-front bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-full flex flex-col" style={FLEX_CONTAINER_STYLE}>
                <VitalsHeader />
                {ECGSection}
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-scroll p-4 space-y-4 scrollbar-hide" style={SCROLL_STYLE}>
                  <PatientInfoCard />
                  <PhysicalExamSection />
                  <TestOrderingSection />
                  <PendingTestsSection />
                  <TestResultsSection />
                </div>

                {/* Flip Button */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleFlip}
                    disabled={!orderedTests || orderedTests.length === 0}
                    className={`w-full py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      (!orderedTests || orderedTests.length === 0)
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    <FlipHorizontal2 className="w-5 h-5" />
                    Make a Diagnosis
                  </button>
                </div>
              </div>
            </div>

            {/* Back Side - Diagnosis */}
            <div className="flip-card-back bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-full flex flex-col" style={FLEX_CONTAINER_STYLE}>
                <VitalsHeader />
                {ECGSection}
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-scroll p-4 space-y-4 scrollbar-hide" style={SCROLL_STYLE}>
                  <DiagnosisSelectionSection />
                  <DiagnosisResultSection />
                  <TreatmentSelectionSection />
                  <CorrectTreatmentPlanSection />
                  <TestResultsSection />
                </div>

                {/* Flip Back Button */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Back to Tests
                  </button>
                  <button
                    onClick={onHome}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint Modal */}
      {showHint && hintContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Hint</h3>
              </div>
              <button
                onClick={() => onShowHint && onShowHint(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-700">{hintContent}</div>
          </div>
        </div>
      )}

      {/* Walkthrough Modal */}
      {showWalkthrough && walkthroughContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-slate-700" />
                <h3 className="text-lg font-bold text-gray-900">Walkthrough Guide</h3>
              </div>
              <button
                onClick={() => onShowWalkthrough && onShowWalkthrough(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{walkthroughContent}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewFlashcardView;
