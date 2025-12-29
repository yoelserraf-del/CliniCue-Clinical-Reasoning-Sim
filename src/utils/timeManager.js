// Time Limit Manager
export const getTimeLimit = (difficulty, caseLevel) => {
  // Base time limits in minutes (simulated time)
  const baseLimits = {
    'highschool': 30,
    'premed': 25,
    'student': 20,
    'resident': 15
  };
  
  // Reduce time limit as case level increases
  const levelReduction = Math.floor((caseLevel - 1) / 2) * 2; // -2 minutes every 2 levels
  
  const baseLimit = baseLimits[difficulty] || 20;
  return Math.max(10, baseLimit - levelReduction); // Minimum 10 minutes
};

export const getTimeRemaining = (timeLimit, currentTime) => {
  return Math.max(0, timeLimit - currentTime);
};

export const isTimeExpired = (timeLimit, currentTime) => {
  return currentTime >= timeLimit;
};

export const getTimeWarning = (timeLimit, currentTime) => {
  const remaining = getTimeRemaining(timeLimit, currentTime);
  const percentage = (remaining / timeLimit) * 100;
  
  if (percentage <= 10) return 'critical';
  if (percentage <= 25) return 'warning';
  return 'normal';
};

