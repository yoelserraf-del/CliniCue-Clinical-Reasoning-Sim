import { useState, useEffect } from 'react';
import { CASE_STATES, getNextState, getStateDisplayName } from './utils/stateMachine';
import { INITIAL_STABILITY, applyStabilityChange, calculateStabilityPenalty } from './utils/stabilityManager';
import PatientMonitor from './components/PatientMonitor';
import LeftSidebar from './components/LeftSidebar';
import ExaminationRoom from './components/ExaminationRoom';
import ActionMenu from './components/ActionMenu';
import ScienceDebrief from './components/ScienceDebrief';
import caseLibrary from './data/CaseLibrary.json';

function App() {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentState, setCurrentState] = useState(CASE_STATES.TRIAGE);
  const [patientStability, setPatientStability] = useState(INITIAL_STABILITY);
  const [orderedTests, setOrderedTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [givenTreatments, setGivenTreatments] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [showDebrief, setShowDebrief] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // Get cases filtered by difficulty
  const getFilteredCases = () => {
    if (!selectedDifficulty) return [];
    // Map difficulty levels from UI selection to case library values
    const difficultyMap = {
      'highschool': 'highschool',
      'pre-med': 'premed',
      'med school': 'student'
    };
    const mappedDifficulty = difficultyMap[selectedDifficulty] || selectedDifficulty;
    return caseLibrary.filter(c => c.difficulty === mappedDifficulty);
  };

  // Simulate time passing and test completion
  useEffect(() => {
    if (currentState !== CASE_STATES.COMPLETED) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        
        // Check for completed tests
        orderedTests.forEach(test => {
          if (!test.completedAt && currentTime >= test.orderedAt + test.timeCost) {
            // Mark test as completed and add result
            const testData = selectedCase?.investigations.find(inv => inv.id === test.id);
            if (testData) {
              setTestResults(prev => {
                // Prevent duplicate results
                if (prev.some(r => r.id === test.id)) return prev;
                return [...prev, {
                  id: test.id,
                  name: testData.name,
                  result: testData.result,
                  interpretation: testData.interpretation,
                  timeCost: testData.timeCost,
                  type: test.id.includes('xray') || test.id.includes('ct') || test.id.includes('ctpa') ? 'image' : 'text'
                }];
              });
              
              setOrderedTests(prev => prev.map(t => 
                t.id === test.id ? { ...t, completedAt: currentTime } : t
              ));
            }
          }
        });

        // Simulate stability decay over time (especially for attending level)
        if (selectedCase?.difficulty === 'attending') {
          setPatientStability(prev => Math.max(0, prev - 0.1));
        }
      }, 1000); // 1 second = 1 minute in simulation

      return () => clearInterval(interval);
    }
  }, [currentTime, orderedTests, selectedCase, currentState]);

  // Handle test ordering
  const handleOrderTest = (test) => {
    if (orderedTests.some(t => t.id === test.id)) return;

    const newOrderedTest = {
      id: test.id,
      orderedAt: currentTime,
      timeCost: test.timeCost,
      completedAt: null
    };

    setOrderedTests(prev => [...prev, newOrderedTest]);

    // Wrong test ordering reduces stability (example logic)
    // In a real implementation, you'd check against correctTreatment
  };

  // Handle treatment actions
  const handleGiveMedication = (treatment) => {
    if (givenTreatments.includes(treatment)) return;

    setGivenTreatments(prev => [...prev, treatment]);

    // Check if treatment is correct
    const correctSequence = selectedCase?.correctTreatment.sequence || [];
    const expectedActions = correctSequence.map(s => s.action);
    
    if (expectedActions.includes(treatment)) {
      // Correct treatment - increase stability
      setPatientStability(prev => Math.min(100, prev + 10));
    } else {
      // Wrong treatment - decrease stability
      const penalty = calculateStabilityPenalty(treatment, selectedCase, selectedCase?.difficulty);
      setPatientStability(prev => applyStabilityChange(prev, penalty.basePenalty));
    }

    // Check if all required treatments are given
    if (expectedActions.every(action => [...givenTreatments, treatment].includes(action))) {
      // Move to debrief after a short delay
      setTimeout(() => {
        setCurrentState(CASE_STATES.DEBRIEF);
        calculatePerformance();
        setShowDebrief(true);
      }, 2000);
    }
  };

  // Handle consultation
  const handleConsultSpecialist = () => {
    // Consultation might provide hints or reduce time
    alert('Specialist consulted. They recommend proceeding with investigations.');
  };

  // Calculate performance metrics
  const calculatePerformance = () => {
    const timeToTreatment = currentTime;
    const correctDiagnosis = true; // Would check against selected diagnosis
    setPerformance({
      finalStability: patientStability,
      timeToTreatment,
      correctDiagnosis
    });
  };

  // Proceed to next state
  const handleNextState = () => {
    if (currentState === CASE_STATES.TRIAGE) {
      setCurrentState(CASE_STATES.INVESTIGATION);
    } else if (currentState === CASE_STATES.INVESTIGATION) {
      // Check if enough tests are completed
      if (testResults.length >= 2) {
        setCurrentState(CASE_STATES.DIAGNOSIS);
      } else {
        alert('Please order and wait for test results before proceeding to diagnosis.');
      }
    } else if (currentState === CASE_STATES.DIAGNOSIS) {
      setCurrentState(CASE_STATES.TREATMENT);
    }
  };

  // Reset case
  const handleResetCase = () => {
    if (selectedCase) {
      setCurrentState(CASE_STATES.TRIAGE);
      setPatientStability(INITIAL_STABILITY);
      setOrderedTests([]);
      setTestResults([]);
      setGivenTreatments([]);
      setCurrentTime(0);
      setShowDebrief(false);
      setPerformance(null);
      setVitals(selectedCase.initialVitals);
    }
  };

  // Case selection
  const handleCaseSelect = (caseId) => {
    const caseToLoad = caseLibrary.find(c => c.id === caseId);
    if (caseToLoad) {
      setSelectedCase(caseToLoad);
      setVitals(caseToLoad.initialVitals);
      handleResetCase();
    }
  };

  // Get walkthrough steps for current state
  const getWalkthroughSteps = () => {
    if (!selectedCase) return [];
    
    const steps = [];
    
    if (currentState === CASE_STATES.TRIAGE) {
      steps.push({
        title: "Step 1: Review Patient Information",
        description: "Start by reading the patient's profile, chief complaint, and initial nursing notes in the left sidebar. This gives you the context you need.",
        action: null
      });
      steps.push({
        title: "Step 2: Check Vital Signs",
        description: "Look at the patient monitor at the top. Note the heart rate, blood pressure, respiratory rate, oxygen saturation, and temperature. Abnormal vitals can indicate the severity of the condition.",
        action: null
      });
      steps.push({
        title: "Step 3: Proceed to Investigation",
        description: "Once you've reviewed the information, click 'Next Stage' to move to the investigation phase where you can order diagnostic tests.",
        action: () => handleNextState()
      });
    } else if (currentState === CASE_STATES.INVESTIGATION) {
      // Recommend key tests based on case
      const recommendedTests = selectedCase.investigations.slice(0, 3);
      const testNames = recommendedTests.map(inv => inv.name).join(', ');
      
      steps.push({
        title: "Step 1: Order Diagnostic Tests",
        description: `Based on the patient's presentation, you should order tests. For this case, consider ordering: ${testNames}. Look in the right sidebar under "Order Tests" and click on the tests you want to order.`,
        action: null
      });
      
      if (orderedTests.length === 0) {
        steps.push({
          title: "Step 2: Select Tests",
          description: "Tests haven't been ordered yet. Go to the Action Menu on the right and click on the tests you want to order. Start with the most important ones first.",
          action: null
        });
      } else if (testResults.length < 2) {
        steps.push({
          title: "Step 2: Wait for Results",
          description: `You've ordered ${orderedTests.length} test(s). Wait for the test results to complete. You can see the progress in the Examination Room. Results will appear automatically when ready.`,
          action: null
        });
      } else {
        steps.push({
          title: "Step 2: Review Test Results",
          description: "Good! You have test results. Check the Examination Room (center area) for completed test results. Read the results and their interpretations carefully - they will help you make a diagnosis.",
          action: null
        });
        steps.push({
          title: "Step 3: Proceed to Diagnosis",
          description: "Once you've reviewed the test results and have enough information, click 'Next Stage' to move to the diagnosis phase.",
          action: () => handleNextState()
        });
      }
    } else if (currentState === CASE_STATES.DIAGNOSIS) {
      steps.push({
        title: "Step 1: Analyze the Information",
        description: "Review all the information you've gathered: patient history, symptoms, vital signs, and test results. Put it all together to form a diagnosis.",
        action: null
      });
      steps.push({
        title: "Step 2: Formulate Your Diagnosis",
        description: "Based on the patient's symptoms, vitals, and test results, determine the most likely diagnosis. Think about what condition best explains all the findings.",
        action: null
      });
      steps.push({
        title: "Step 3: Proceed to Treatment",
        description: "Once you have a diagnosis in mind, click 'Next Stage' to move to the treatment phase where you'll provide appropriate care.",
        action: () => handleNextState()
      });
    } else if (currentState === CASE_STATES.TREATMENT) {
      const correctSequence = selectedCase.correctTreatment?.sequence || [];
      
      if (correctSequence.length === 0) {
        steps.push({
          title: "Treatment Phase",
          description: "Review the case information to determine appropriate treatment. Use the Action Menu on the right to provide treatments.",
          action: null
        });
      } else {
        correctSequence.forEach((step, index) => {
          const isCompleted = givenTreatments.includes(step.action);
          steps.push({
            title: `Step ${index + 1}: ${step.description}`,
            description: step.medication 
              ? `${step.medication}\n\n${isCompleted ? '✓ Completed' : 'Go to the Action Menu on the right and select this treatment.'}`
              : `${step.description}\n\n${isCompleted ? '✓ Completed' : 'Use the Action Menu to provide this treatment.'}`,
            action: step.action && !isCompleted ? () => handleGiveMedication(step.action) : null
          });
        });
        
        if (givenTreatments.length < correctSequence.length) {
          steps.push({
            title: "Complete All Treatments",
            description: `You've completed ${givenTreatments.length} of ${correctSequence.length} treatment steps. Continue with the remaining treatments.`,
            action: null
          });
        }
      }
    }
    
    return steps;
  };

  // Handle walkthrough
  const handleWalkthroughNext = () => {
    const steps = getWalkthroughSteps();
    if (walkthroughStep < steps.length - 1) {
      setWalkthroughStep(walkthroughStep + 1);
      const nextStep = steps[walkthroughStep + 1];
      if (nextStep.action) {
        setTimeout(() => nextStep.action(), 500);
      }
    } else {
      setShowWalkthrough(false);
      setWalkthroughStep(0);
    }
  };

  const handleWalkthroughPrev = () => {
    if (walkthroughStep > 0) {
      setWalkthroughStep(walkthroughStep - 1);
    }
  };

  // Difficulty selection screen
  if (!selectedDifficulty) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2">Clinical Reasoning Simulator</h1>
          <p className="text-gray-400 mb-8">Select your difficulty level to begin</p>
          <div className="space-y-4">
            <button
              onClick={() => setSelectedDifficulty('highschool')}
              className="block w-full px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg transition-colors"
            >
              <div className="font-bold text-xl mb-1">High School</div>
              <div className="text-sm opacity-90">Basic medical concepts and terminology</div>
            </button>
            <button
              onClick={() => setSelectedDifficulty('pre-med')}
              className="block w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors"
            >
              <div className="font-bold text-xl mb-1">Pre-Med</div>
              <div className="text-sm opacity-90">Intermediate level cases for pre-medical students</div>
            </button>
            <button
              onClick={() => setSelectedDifficulty('med school')}
              className="block w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-lg transition-colors"
            >
              <div className="font-bold text-xl mb-1">Med School</div>
              <div className="text-sm opacity-90">Advanced cases for medical students and beyond</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case selection screen
  if (!selectedCase) {
    const filteredCases = getFilteredCases();
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Select a Case</h1>
            <p className="text-gray-400 mb-4">
              Difficulty: <span className="capitalize font-medium text-white">{selectedDifficulty}</span>
            </p>
            <button
              onClick={() => setSelectedDifficulty(null)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              ← Change Difficulty
            </button>
          </div>
          <div className="space-y-2">
            {filteredCases.length > 0 ? (
              filteredCases.map(caseItem => (
                <button
                  key={caseItem.id}
                  onClick={() => handleCaseSelect(caseItem.id)}
                  className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-left"
                >
                  <div className="font-semibold">{caseItem.title}</div>
                  <div className="text-sm opacity-90">{caseItem.patientProfile?.chiefComplaint || ''}</div>
                </button>
              ))
            ) : (
              <div className="text-gray-400 py-8">
                No cases available for this difficulty level yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header with Case Info and State */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{selectedCase.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400">
                Difficulty: <span className="capitalize font-medium text-white">{selectedCase.difficulty}</span>
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                Stage: <span className="font-medium text-white">{getStateDisplayName(currentState)}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(currentState === CASE_STATES.INVESTIGATION || currentState === CASE_STATES.DIAGNOSIS) && (
              <button
                onClick={handleNextState}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Next Stage →
              </button>
            )}
            <button
              onClick={() => setShowWalkthrough(!showWalkthrough)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                showWalkthrough 
                  ? 'bg-yellow-700 hover:bg-yellow-800 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {showWalkthrough ? 'Hide' : 'Show'} Help
            </button>
            <div className="relative">
              <select
                value={selectedCase.id}
                onChange={(e) => handleCaseSelect(e.target.value)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm border border-gray-600 cursor-pointer appearance-none pr-8"
              >
                {getFilteredCases().map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleResetCase}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
              title="Reset Case"
            >
              Reset
            </button>
            <button
              onClick={() => setSelectedCase(null)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
              title="Back to Case Selection"
            >
              Cases
            </button>
          </div>
        </div>
      </div>

      {/* Patient Monitor */}
      <PatientMonitor 
        vitals={vitals || selectedCase.initialVitals}
        stability={patientStability}
        difficulty={selectedCase.difficulty}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          patientProfile={selectedCase.patientProfile}
          nursingNotes={selectedCase.initialNursingNotes}
          difficulty={selectedCase.difficulty}
        />

        {/* Center - Examination Room */}
        <ExaminationRoom
          investigations={selectedCase.investigations}
          testResults={testResults}
          orderedTests={orderedTests}
          currentTime={currentTime}
          difficulty={selectedCase.difficulty}
        />

        {/* Right Sidebar - Action Menu */}
        <ActionMenu
          investigations={selectedCase.investigations}
          onOrderTest={handleOrderTest}
          onGiveMedication={handleGiveMedication}
          onConsultSpecialist={handleConsultSpecialist}
          orderedTests={orderedTests}
          givenTreatments={givenTreatments}
          currentState={currentState}
        />
      </div>

      {/* Walkthrough Modal */}
      {showWalkthrough && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Walkthrough Guide</h2>
              <button
                onClick={() => {
                  setShowWalkthrough(false);
                  setWalkthroughStep(0);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {getWalkthroughSteps().length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Step {walkthroughStep + 1} of {getWalkthroughSteps().length}
                  </div>
                  <div className="bg-gray-900 rounded p-4 mb-4">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {getWalkthroughSteps()[walkthroughStep]?.title}
                    </h3>
                    <p className="text-gray-300">
                      {getWalkthroughSteps()[walkthroughStep]?.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleWalkthroughPrev}
                    disabled={walkthroughStep === 0}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleWalkthroughNext}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    {walkthroughStep === getWalkthroughSteps().length - 1 ? 'Close' : 'Next →'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-400">
                No walkthrough steps available for the current stage.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Science Debrief Modal */}
      <ScienceDebrief
        caseData={selectedCase}
        isOpen={showDebrief}
        onClose={() => setShowDebrief(false)}
        performance={performance}
      />
    </div>
  );
}

export default App;