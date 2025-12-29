import { useState, useEffect } from 'react';
import { Clock, Search, X } from 'lucide-react';
import { CASE_STATES, getNextState, getStateDisplayName } from './utils/stateMachine';
import { INITIAL_STABILITY, applyStabilityChange, calculateStabilityPenalty, calculateTimeDecay } from './utils/stabilityManager';
import { getTimeLimit, getTimeRemaining, isTimeExpired, getTimeWarning } from './utils/timeManager';
import PatientMonitor from './components/PatientMonitor';
import LeftSidebar from './components/LeftSidebar';
import ExaminationRoom from './components/ExaminationRoom';
import ActionMenu from './components/ActionMenu';
import ScienceDebrief from './components/ScienceDebrief';
import DiagnosisSelection from './components/DiagnosisSelection';
import caseLibrary from './data/CaseLibrary.json';

function App() {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentState, setCurrentState] = useState(CASE_STATES.TRIAGE);
  const [patientStability, setPatientStability] = useState(INITIAL_STABILITY);
  const [orderedTests, setOrderedTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [givenTreatments, setGivenTreatments] = useState([]);
  const [physicalExamFindings, setPhysicalExamFindings] = useState([]);
  const [currentTime, setCurrentTime] = useState(0); // Simulation time (1 sec = 1 min)
  const [realTimeElapsed, setRealTimeElapsed] = useState(0); // Real time in seconds
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [showDebrief, setShowDebrief] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [currentCaseLevel, setCurrentCaseLevel] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [explanationsViewed, setExplanationsViewed] = useState(0);
  const [wrongTestsOrdered, setWrongTestsOrdered] = useState(0);
  const [wrongTreatmentsGiven, setWrongTreatmentsGiven] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [caseScore, setCaseScore] = useState(null);
  const [showScoreScreen, setShowScoreScreen] = useState(false);
  const [debriefViewed, setDebriefViewed] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [showCaseSearch, setShowCaseSearch] = useState(false);

  // Get time limit for current case
  const timeLimit = selectedCase && timeLimitEnabled 
    ? getTimeLimit(selectedCase.difficulty, currentCaseLevel) 
    : null;

  // Get cases filtered by difficulty
  const getFilteredCases = () => {
    if (!selectedDifficulty) return [];
    // Map difficulty levels from UI selection to case library values
    const difficultyMap = {
      'highschool': 'highschool',
      'pre-med': 'premed',
      'med school': 'student',
      'residency': 'resident'
    };
    const mappedDifficulty = difficultyMap[selectedDifficulty] || selectedDifficulty;
    return caseLibrary.filter(c => c.difficulty === mappedDifficulty);
  };

  // Get next case based on current level and difficulty
  const getNextCase = (level, difficulty) => {
    const filteredCases = getFilteredCases();
    // Find case at the specified level
    const caseAtLevel = filteredCases.find(c => c.caseLevel === level);
    if (caseAtLevel) return caseAtLevel;
    // If no case at exact level, find closest
    const sortedCases = filteredCases
      .filter(c => c.caseLevel)
      .sort((a, b) => a.caseLevel - b.caseLevel);
    if (level < 1) return sortedCases[0] || filteredCases[0];
    if (level > sortedCases.length) return sortedCases[sortedCases.length - 1] || filteredCases[0];
    return filteredCases[0];
  };

  // Load case automatically when difficulty is selected
  useEffect(() => {
    if (selectedDifficulty && !selectedCase) {
      try {
        const firstCase = getNextCase(1, selectedDifficulty);
        if (firstCase) {
          console.log('Loading case:', firstCase.id, firstCase.title);
          setSelectedCase(firstCase);
          setVitals(firstCase.initialVitals);
          setCurrentCaseLevel(1);
          setHintsUsed(0);
          setExplanationsViewed(0);
          setWrongTestsOrdered(0);
          setWrongTreatmentsGiven(0);
          setCurrentState(CASE_STATES.TRIAGE);
          setPatientStability(INITIAL_STABILITY);
          setOrderedTests([]);
          setTestResults([]);
          setGivenTreatments([]);
          setCurrentTime(0);
      setRealTimeElapsed(0);
          setRealTimeElapsed(0);
          setSelectedDiagnosis(null);
          setShowScoreScreen(false);
          setCaseScore(null);
          setDebriefViewed(false);
        } else {
          // No case found - show error and reset
          console.error(`No cases found for difficulty: ${selectedDifficulty}`);
          const filtered = getFilteredCases();
          console.error(`Filtered cases:`, filtered.length);
          alert(`No cases found for ${selectedDifficulty} difficulty. Please try another difficulty level.`);
          setSelectedDifficulty(null);
        }
      } catch (error) {
        console.error('Error loading case:', error);
        alert(`Error loading case: ${error.message}`);
        setSelectedDifficulty(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  // Real-time counter for time limit (1 second = 1 second)
  useEffect(() => {
    if (timeLimitEnabled && selectedCase && currentState !== CASE_STATES.COMPLETED) {
      const interval = setInterval(() => {
        setRealTimeElapsed(prev => {
          const newRealTime = prev + 1;
          
          // Check if time limit expired (timeLimit is in minutes, convert to seconds)
          if (timeLimit && newRealTime >= timeLimit * 60) {
            setPatientStability(0);
            setCurrentState(CASE_STATES.COMPLETED);
            calculatePerformance();
            setShowDebrief(true);
            return newRealTime;
          }
          
          // Stability decay based on real time
          if (timeLimit) {
            const timeInMinutes = newRealTime / 60;
            const decay = calculateTimeDecay(timeInMinutes, timeLimit, selectedCase.difficulty);
            setPatientStability(prev => Math.max(0, prev - decay));
          }
          
          return newRealTime;
        });
      }, 1000); // Real time: 1 second = 1 second

      return () => clearInterval(interval);
    }
  }, [timeLimitEnabled, selectedCase, currentState, timeLimit]);

  // Simulate time passing and test completion (simulation time: 1 sec = 1 min)
  useEffect(() => {
    if (currentState !== CASE_STATES.COMPLETED && selectedCase) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Check for completed tests
          orderedTests.forEach(test => {
            if (!test.completedAt && newTime >= test.orderedAt + test.timeCost) {
              const investigations = Array.isArray(selectedCase?.investigations) 
                ? selectedCase.investigations 
                : Object.values(selectedCase?.investigations || {});
              const testData = investigations.find(inv => inv.id === test.id);
              
              setTestResults(prev => {
                if (prev.some(r => r.id === test.id)) return prev;
                
                if (testData) {
                  return [...prev, {
                    id: test.id,
                    name: testData.name,
                    result: testData.result,
                    interpretation: testData.interpretation,
                    timeCost: testData.timeCost,
                    type: test.id.includes('xray') || test.id.includes('ct') || test.id.includes('ctpa') ? 'image' : 'text'
                  }];
                } else {
                  return [...prev, {
                    id: test.id,
                    name: test.name || 'Test',
                    result: "Results within normal limits. This test is not directly relevant to the current case presentation.",
                    interpretation: "Consider focusing on tests more relevant to the patient's symptoms.",
                    timeCost: test.timeCost,
                    type: test.id.includes('xray') || test.id.includes('ct') || test.id.includes('ctpa') ? 'image' : 'text',
                    isGeneric: true
                  }];
                }
              });
                
              setOrderedTests(prev => prev.map(t => 
                t.id === test.id ? { ...t, completedAt: newTime } : t
              ));
            }
          });
          
          return newTime;
        });
      }, 1000); // 1 second = 1 minute in simulation

      return () => clearInterval(interval);
    }
  }, [orderedTests, selectedCase, currentState]);

  // Handle test ordering
  const handleOrderTest = (test) => {
    if (orderedTests.some(t => t.id === test.id)) return;

    const newOrderedTest = {
      id: test.id,
      name: test.name,
      orderedAt: currentTime,
      timeCost: test.timeCost,
      completedAt: null
    };

    setOrderedTests(prev => [...prev, newOrderedTest]);

    // Check if test is recommended (first 2-3 tests are usually key)
    const investigations = Array.isArray(selectedCase?.investigations) 
      ? selectedCase.investigations 
      : Object.values(selectedCase?.investigations || {});
    const recommendedTests = investigations.slice(0, 3).map(inv => inv.id) || [];
    if (!recommendedTests.includes(test.id)) {
      setWrongTestsOrdered(prev => prev + 1);
      setPatientStability(prev => Math.max(0, prev - 2));
    }
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
      setWrongTreatmentsGiven(prev => prev + 1);
      const penalty = calculateStabilityPenalty(treatment, selectedCase, selectedCase?.difficulty);
      setPatientStability(prev => applyStabilityChange(prev, penalty.basePenalty));
    }

    // Check if all required treatments are given
    if (expectedActions.every(action => [...givenTreatments, treatment].includes(action))) {
      // Move to debrief after a short delay
      setTimeout(() => {
        setCurrentState(CASE_STATES.DEBRIEF);
        calculatePerformance();
        setShowScoreScreen(true);
      }, 2000);
    }
  };

  // Handle consultation
  const handleConsultSpecialist = () => {
    // Consultation might provide hints or reduce time
    alert('Specialist consulted. They recommend proceeding with investigations.');
  };

  // Handle physical exam
  const handlePhysicalExam = (examType) => {
    if (!selectedCase) return;
    
    // Generate findings based on case
    const findings = generatePhysicalExamFindings(examType, selectedCase);
    
    // Check if already performed
    const existingFinding = physicalExamFindings.find(f => f.type === examType);
    if (existingFinding) return;
    
    setPhysicalExamFindings(prev => [...prev, {
      type: examType,
      findings: findings,
      timestamp: currentTime
    }]);
  };

  // Generate physical exam findings based on case
  const generatePhysicalExamFindings = (examType, caseData) => {
    const diagnosis = caseData.correctDiagnosis;
    const findings = {
      'auscultation': [],
      'palpation': [],
      'neurological': [],
      'cardiac': []
    };

    // Generate findings based on diagnosis
    if (diagnosis.includes('Pneumonia') || diagnosis.includes('Respiratory')) {
      findings.auscultation = ['Bilateral crackles in lower lung fields', 'Decreased breath sounds on right side'];
      findings.palpation = ['Tactile fremitus increased on right', 'No chest wall tenderness'];
    } else if (diagnosis.includes('Cardiac') || diagnosis.includes('Infarction')) {
      findings.cardiac = ['S3 gallop present', 'Murmur grade 2/6 systolic'];
      findings.auscultation = ['Bilateral rales', 'Jugular venous distension'];
    } else if (diagnosis.includes('Appendicitis') || diagnosis.includes('Abdominal')) {
      findings.palpation = ['Right lower quadrant tenderness', 'Positive McBurney\'s point', 'Rebound tenderness present'];
    } else if (diagnosis.includes('Stroke') || diagnosis.includes('Neurological')) {
      findings.neurological = ['Left-sided hemiparesis', 'Facial droop on left', 'Dysarthria present'];
    } else {
      // Generic findings
      findings.auscultation = ['Clear to auscultation bilaterally'];
      findings.palpation = ['No focal tenderness'];
      findings.cardiac = ['Regular rate and rhythm', 'No murmurs, rubs, or gallops'];
      findings.neurological = ['Cranial nerves II-XII intact', 'No focal neurological deficits'];
    }

    return findings[examType] || ['Examination unremarkable'];
  };

  // Handle diagnosis selection
  const handleDiagnosisSelect = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    const isCorrect = diagnosis === selectedCase?.correctDiagnosis;
    
    if (isCorrect) {
      // Correct diagnosis - small stability boost
      setPatientStability(prev => Math.min(100, prev + 5));
    } else {
      // Wrong diagnosis - small penalty
      setPatientStability(prev => Math.max(0, prev - 5));
    }
    
    // Allow proceeding to treatment after diagnosis selection
    setTimeout(() => {
      setCurrentState(CASE_STATES.TREATMENT);
    }, 2000);
  };

  // Calculate performance metrics and score
  const calculatePerformance = () => {
    const timeToTreatment = currentTime;
    const correctDiagnosis = selectedDiagnosis === selectedCase?.correctDiagnosis;
    
    // Calculate score (0-100)
    let score = 100;
    
    // Deduct points for hints used (5 points each)
    score -= hintsUsed * 5;
    
    // Deduct points for explanations viewed (3 points each)
    score -= explanationsViewed * 3;
    
    // Deduct points for wrong tests (2 points each)
    score -= wrongTestsOrdered * 2;
    
    // Deduct points for wrong treatments (5 points each)
    score -= wrongTreatmentsGiven * 5;
    
    // Deduct points for time (1 point per 10 minutes over optimal)
    const optimalTime = 30; // Assume 30 minutes is optimal
    if (timeToTreatment > optimalTime) {
      score -= Math.floor((timeToTreatment - optimalTime) / 10);
    }
    
    // Deduct points for incorrect diagnosis (20 points)
    if (!correctDiagnosis) {
      score -= 20;
    }
    
    // Bonus for high stability (up to 10 points)
    if (patientStability >= 90) {
      score += 10;
    } else if (patientStability >= 80) {
      score += 5;
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    const performanceData = {
      finalStability: patientStability,
      timeToTreatment,
      correctDiagnosis,
      score: Math.round(score),
      hintsUsed,
      explanationsViewed,
      wrongTestsOrdered,
      wrongTreatmentsGiven
    };
    
    setPerformance(performanceData);
    setCaseScore(performanceData);
    
    // Determine next case level based on performance
    let nextLevel = currentCaseLevel;
    if (score >= 80) {
      // Did well - increase difficulty
      nextLevel = Math.min(currentCaseLevel + 1, 10);
    } else if (score >= 60) {
      // Did okay - stay at same level
      nextLevel = currentCaseLevel;
    } else {
      // Struggled - decrease difficulty
      nextLevel = Math.max(currentCaseLevel - 1, 1);
    }
    
    setCurrentCaseLevel(nextLevel);
    
    return performanceData;
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
      // Diagnosis must be selected before proceeding
      if (!selectedDiagnosis) {
        alert('Please select a diagnosis before proceeding to treatment.');
        return;
      }
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
      setRealTimeElapsed(0);
      setShowDebrief(false);
      setPerformance(null);
      setVitals(selectedCase.initialVitals);
      setSelectedDiagnosis(null);
    }
  };

  // Reset to start new game
  const handleNewGame = () => {
    setSelectedDifficulty(null);
    setSelectedCase(null);
    setCurrentCaseLevel(1);
    setHintsUsed(0);
    setExplanationsViewed(0);
    setWrongTestsOrdered(0);
    setWrongTreatmentsGiven(0);
    setShowScoreScreen(false);
    setCaseScore(null);
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

  // Handle walkthrough (counts as hint)
  const handleWalkthroughNext = () => {
    const steps = getWalkthroughSteps();
    if (walkthroughStep < steps.length - 1) {
      setWalkthroughStep(walkthroughStep + 1);
      // Count viewing a walkthrough step as using a hint
      if (walkthroughStep === 0) {
        setHintsUsed(prev => prev + 1);
      }
      const nextStep = steps[walkthroughStep + 1];
      if (nextStep.action) {
        setTimeout(() => nextStep.action(), 500);
      }
    } else {
      setShowWalkthrough(false);
      setWalkthroughStep(0);
    }
  };

  // Handle getting a hint
  const handleGetHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };

  // Handle viewing explanation
  const handleViewExplanation = () => {
    if (!showExplanation) {
      setShowExplanation(true);
      setExplanationsViewed(prev => prev + 1);
    }
  };

  // Handle viewing debrief (counts as explanation)
  const handleViewDebrief = () => {
    if (!debriefViewed) {
      setDebriefViewed(true);
      setExplanationsViewed(prev => prev + 1);
    }
    setShowDebrief(true);
    setShowScoreScreen(false);
  };

  // Load next case
  const handleNextCase = () => {
    const nextCase = getNextCase(currentCaseLevel, selectedDifficulty);
    if (nextCase) {
      setSelectedCase(nextCase);
      setVitals(nextCase.initialVitals);
      setCurrentState(CASE_STATES.TRIAGE);
      setPatientStability(INITIAL_STABILITY);
      setOrderedTests([]);
      setTestResults([]);
      setGivenTreatments([]);
      setCurrentTime(0);
      setRealTimeElapsed(0);
      setShowDebrief(false);
      setShowScoreScreen(false);
      setPerformance(null);
      setCaseScore(null);
      setSelectedDiagnosis(null);
      setHintsUsed(0);
      setExplanationsViewed(0);
      setWrongTestsOrdered(0);
      setWrongTreatmentsGiven(0);
      setShowHint(false);
      setShowExplanation(false);
      setWalkthroughStep(0);
      setDebriefViewed(false);
    }
  };

  const handleWalkthroughPrev = () => {
    if (walkthroughStep > 0) {
      setWalkthroughStep(walkthroughStep - 1);
    }
  };

  // Difficulty selection screen
  if (!selectedDifficulty) {
    // Filter cases by search query
    const filteredCases = caseSearchQuery ? caseLibrary.filter(caseItem => {
      const query = caseSearchQuery.toLowerCase();
      return (
        caseItem.title?.toLowerCase().includes(query) ||
        caseItem.patientProfile?.chiefComplaint?.toLowerCase().includes(query) ||
        caseItem.correctDiagnosis?.toLowerCase().includes(query) ||
        caseItem.patientProfile?.presentingSymptoms?.some(s => s.toLowerCase().includes(query))
      );
    }) : [];

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
        <div className="text-center max-w-3xl mx-auto w-full">
          <h1 className="text-5xl font-bold text-white mb-4">Clinical Reasoning Simulator</h1>
          <p className="text-slate-400 mb-8 text-lg">Select your difficulty level to begin</p>
          
          {/* Case Search */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases by symptoms, diagnosis, or complaint..."
                value={caseSearchQuery}
                onChange={(e) => setCaseSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {caseSearchQuery && (
                <button
                  onClick={() => setCaseSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {caseSearchQuery && filteredCases.length > 0 && (
              <div className="mt-4 text-sm text-slate-400">
                Found {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} matching "{caseSearchQuery}"
              </div>
            )}
            {caseSearchQuery && filteredCases.length === 0 && (
              <div className="mt-4 text-sm text-red-400">
                No cases found matching "{caseSearchQuery}"
              </div>
            )}
          </div>
          
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
              <div className="text-sm opacity-90">Advanced cases for medical students</div>
            </button>
            <button
              onClick={() => setSelectedDifficulty('residency')}
              className="block w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-lg transition-colors"
            >
              <div className="font-bold text-xl mb-1">Residency</div>
              <div className="text-sm opacity-90">Complex cases for residents and beyond</div>
            </button>
          </div>
        </div>
        
        {/* Time Limit Toggle - Bottom Right */}
        <div className="absolute bottom-4 right-4">
          <div className="card rounded-lg p-3 max-w-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">Time Limits</span>
              <input
                type="checkbox"
                checked={timeLimitEnabled}
                onChange={(e) => setTimeLimitEnabled(e.target.checked)}
                className="ml-auto w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <p className="text-xs text-slate-400 mt-1">
              {timeLimitEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Score screen after case completion
  if (showScoreScreen && caseScore) {
    const getScoreColor = (score) => {
      if (score >= 90) return 'text-green-400';
      if (score >= 80) return 'text-blue-400';
      if (score >= 70) return 'text-yellow-400';
      if (score >= 60) return 'text-orange-400';
      return 'text-red-400';
    };

    const getScoreLabel = (score) => {
      if (score >= 90) return 'Excellent!';
      if (score >= 80) return 'Great Job!';
      if (score >= 70) return 'Good Work!';
      if (score >= 60) return 'Not Bad';
      return 'Keep Practicing';
    };

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="card rounded-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Case Complete!</h1>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(caseScore.score)}`}>
              {caseScore.score}/100
            </div>
            <div className={`text-2xl font-semibold ${getScoreColor(caseScore.score)}`}>
              {getScoreLabel(caseScore.score)}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Final Patient Stability</span>
                  <span className={`font-bold ${
                    caseScore.finalStability >= 80 ? 'text-green-400' :
                    caseScore.finalStability >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {caseScore.finalStability.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Time to Treatment</span>
                  <span className="text-white font-semibold">{caseScore.timeToTreatment} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Correct Diagnosis</span>
                  <span className={caseScore.correctDiagnosis ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {caseScore.correctDiagnosis ? '✓ Yes' : '✗ No (-20 points)'}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="text-sm text-gray-400 mb-2">Deductions:</div>
                  {caseScore.hintsUsed > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Hints Used</span>
                      <span className="text-yellow-400">-{caseScore.hintsUsed * 5} points ({caseScore.hintsUsed} × 5)</span>
                    </div>
                  )}
                  {caseScore.explanationsViewed > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Explanations Viewed</span>
                      <span className="text-yellow-400">-{caseScore.explanationsViewed * 3} points ({caseScore.explanationsViewed} × 3)</span>
                    </div>
                  )}
                  {caseScore.wrongTestsOrdered > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Unnecessary Tests</span>
                      <span className="text-yellow-400">-{caseScore.wrongTestsOrdered * 2} points ({caseScore.wrongTestsOrdered} × 2)</span>
                    </div>
                  )}
                  {caseScore.wrongTreatmentsGiven > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Wrong Treatments</span>
                      <span className="text-yellow-400">-{caseScore.wrongTreatmentsGiven * 5} points ({caseScore.wrongTreatmentsGiven} × 5)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Next Case:</strong> Based on your performance, the next case will be{' '}
                {caseScore.score >= 80 ? 'more challenging' : caseScore.score >= 60 ? 'at the same level' : 'easier'}.
                Current level: {currentCaseLevel}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleNextCase}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continue to Next Case
            </button>
            <button
              onClick={handleViewDebrief}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              View Full Debrief
            </button>
            <button
              onClick={handleNewGame}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if case is not yet loaded
  if (!selectedCase) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading case...</div>
          <div className="text-slate-400">Please wait while we prepare your case.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header with Case Info and State */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-[1920px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate mb-2">{selectedCase?.title || 'Case Loading...'}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Difficulty:</span>
                  <span className="px-3 py-1 bg-slate-700/50 rounded-lg text-sm font-semibold text-white capitalize">
                    {selectedCase.difficulty}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Stage:</span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm font-semibold text-blue-400">
                    {getStateDisplayName(currentState)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(currentState === CASE_STATES.INVESTIGATION || currentState === CASE_STATES.DIAGNOSIS) && (
                <button
                  onClick={handleNextState}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <span>Next Stage</span>
                  <span>→</span>
                </button>
              )}
              <button
                onClick={handleGetHint}
                className="px-4 py-2.5 bg-yellow-600/90 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
                title="Get a hint (affects score)"
              >
                <span>💡</span>
                <span>Hint {hintsUsed > 0 && `(${hintsUsed})`}</span>
              </button>
              <button
                onClick={() => setShowWalkthrough(!showWalkthrough)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                  showWalkthrough 
                    ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                <span>{showWalkthrough ? 'Hide' : 'Show'} Walkthrough</span>
              </button>
              <button
                onClick={handleViewExplanation}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                title="View explanation (affects score)"
              >
                <span>📚</span>
                <span>Explain {explanationsViewed > 0 && `(${explanationsViewed})`}</span>
              </button>
              <button
                onClick={handleResetCase}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-all"
                title="Reset Case"
              >
                Reset
              </button>
              <button
                onClick={handleNewGame}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-all"
                title="Start New Game"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Monitor */}
      <PatientMonitor 
        vitals={vitals || selectedCase.initialVitals}
        stability={patientStability}
        difficulty={selectedCase.difficulty}
        realTimeElapsed={realTimeElapsed}
        timeLimit={timeLimit}
        timeLimitEnabled={timeLimitEnabled}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          patientProfile={selectedCase.patientProfile}
          nursingNotes={selectedCase.initialNursingNotes}
          difficulty={selectedCase.difficulty}
        />

        {/* Center - Examination Room or Diagnosis Selection */}
        {currentState === CASE_STATES.DIAGNOSIS ? (
          <div className="flex-1 overflow-y-auto p-6">
            <DiagnosisSelection
              possibleDiagnoses={selectedCase.possibleDiagnoses || []}
              correctDiagnosis={selectedCase.correctDiagnosis}
              onSelect={handleDiagnosisSelect}
              selectedDiagnosis={selectedDiagnosis}
              difficulty={selectedCase.difficulty}
            />
          </div>
        ) : (
          <ExaminationRoom
            investigations={Array.isArray(selectedCase.investigations) ? selectedCase.investigations : Object.values(selectedCase.investigations || {})}
            testResults={testResults}
            orderedTests={orderedTests}
            currentTime={currentTime}
            difficulty={selectedCase.difficulty}
            onViewExplanation={handleViewExplanation}
            physicalExamFindings={physicalExamFindings}
          />
        )}

        {/* Right Sidebar - Action Menu */}
        <ActionMenu
          investigations={Array.isArray(selectedCase.investigations) ? selectedCase.investigations : Object.values(selectedCase.investigations || {})}
          onOrderTest={handleOrderTest}
          onGiveMedication={handleGiveMedication}
          onConsultSpecialist={handleConsultSpecialist}
          onPhysicalExam={handlePhysicalExam}
          orderedTests={orderedTests}
          givenTreatments={givenTreatments}
          currentState={currentState}
          availableTreatments={selectedCase.availableTreatments || []}
          difficulty={selectedCase.difficulty}
        />
      </div>

      {/* Hint Modal */}
      {showHint && selectedCase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">💡 Hint</h2>
              <button
                onClick={() => setShowHint(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>Using hints affects your score (-5 points per hint)</span>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6">
              {currentState === CASE_STATES.TRIAGE && (
                <p className="text-white">
                  <strong>Hint:</strong> Focus on the patient's chief complaint and vital signs. Look for patterns that suggest the underlying condition.
                </p>
              )}
              {currentState === CASE_STATES.INVESTIGATION && (
                <p className="text-white">
                  <strong>Hint:</strong> Consider ordering tests that will help differentiate between the possible diagnoses. Start with the most specific tests for the suspected condition.
                </p>
              )}
              {currentState === CASE_STATES.DIAGNOSIS && (
                <p className="text-white">
                  <strong>Hint:</strong> Review all the test results together. The correct diagnosis should explain all the findings - symptoms, vitals, and test results.
                </p>
              )}
              {currentState === CASE_STATES.TREATMENT && (
                <p className="text-white">
                  <strong>Hint:</strong> Treatment should address the underlying cause. Consider what the patient needs immediately (supportive care) and what treats the root cause.
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHint(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && selectedCase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">📚 Explanation</h2>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
              <p className="text-purple-400 text-sm font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>Viewing explanations affects your score (-3 points per explanation)</span>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Current Stage Explanation</h3>
                {currentState === CASE_STATES.TRIAGE && (
                  <p className="text-gray-300">
                    In triage, you're gathering initial information about the patient. Review the patient's history, symptoms, and vital signs. This information will guide your investigation strategy.
                  </p>
                )}
                {currentState === CASE_STATES.INVESTIGATION && (
                  <p className="text-gray-300">
                    During investigation, you order diagnostic tests to confirm or rule out diagnoses. Choose tests that are most likely to provide definitive answers. Unnecessary tests waste time and resources.
                  </p>
                )}
                {currentState === CASE_STATES.DIAGNOSIS && (
                  <p className="text-gray-300">
                    Diagnosis requires synthesizing all available information. The correct diagnosis should explain all findings - symptoms, physical exam, and test results. Consider what condition best fits the complete picture.
                  </p>
                )}
                {currentState === CASE_STATES.TREATMENT && (
                  <p className="text-gray-300">
                    Treatment should address both immediate needs (supportive care) and the underlying cause. Follow evidence-based treatment protocols for the diagnosed condition.
                  </p>
                )}
              </div>
              {selectedCase.scienceBridge && (
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Pathophysiology Overview</h3>
                  <p className="text-gray-300 text-sm">
                    {selectedCase.scienceBridge.pathophysiology.split('\n\n')[0]}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowExplanation(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Modal */}
      {showWalkthrough && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
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
        onClose={() => {
          setShowDebrief(false);
          if (caseScore) {
            setShowScoreScreen(true);
          }
        }}
        performance={performance}
      />
    </div>
  );
}

export default App;