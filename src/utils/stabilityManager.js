// Patient Stability Manager
export const INITIAL_STABILITY = 100;

export const calculateStabilityPenalty = (action, caseData, difficulty) => {
  let penalty = 0;
  
  // Wrong actions have different penalties based on difficulty
  const basePenalty = difficulty === 'resident' ? 10 : difficulty === 'student' ? 8 : difficulty === 'premed' ? 6 : 5;
  
  // Delays also reduce stability (simulated by time passing)
  const delayPenalty = difficulty === 'resident' ? 2 : 1;
  
  return { basePenalty, delayPenalty };
};

export const applyStabilityChange = (currentStability, penalty) => {
  return Math.max(0, currentStability - penalty);
};

// Calculate stability decay based on time
export const calculateTimeDecay = (timePassed, timeLimit, difficulty) => {
  // Stability decays faster as time approaches limit
  const timeRatio = timePassed / timeLimit;
  
  // Base decay rate per minute
  const baseDecay = {
    'highschool': 0.5,
    'premed': 0.75,
    'student': 1.0,
    'resident': 1.5
  };
  
  const decayRate = baseDecay[difficulty] || 1.0;
  
  // Accelerate decay as time limit approaches
  const acceleration = timeRatio > 0.7 ? 2 : timeRatio > 0.5 ? 1.5 : 1;
  
  return decayRate * acceleration;
};

export const getStabilityColor = (stability) => {
  if (stability >= 80) return 'text-green-400';
  if (stability >= 60) return 'text-yellow-400';
  if (stability >= 40) return 'text-orange-400';
  return 'text-red-500';
};

export const getStabilityStatus = (stability) => {
  if (stability >= 80) return 'Stable';
  if (stability >= 60) return 'Fair';
  if (stability >= 40) return 'Critical';
  return 'Unstable';
};
