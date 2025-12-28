// Patient Stability Manager
export const INITIAL_STABILITY = 100;

export const calculateStabilityPenalty = (action, caseData, difficulty) => {
  let penalty = 0;
  
  // Wrong actions have different penalties based on difficulty
  const basePenalty = difficulty === 'attending' ? 15 : difficulty === 'resident' ? 10 : 5;
  
  // Delays also reduce stability (simulated by time passing)
  const delayPenalty = difficulty === 'attending' ? 2 : 1;
  
  return { basePenalty, delayPenalty };
};

export const applyStabilityChange = (currentStability, penalty) => {
  return Math.max(0, currentStability - penalty);
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
