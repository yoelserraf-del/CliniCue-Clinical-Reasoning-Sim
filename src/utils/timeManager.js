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

// Get time remaining in minutes (timeLimit is in minutes, realTimeElapsed is in seconds)
export const getTimeRemaining = (timeLimit, realTimeElapsed) => {
  const timeLimitSeconds = timeLimit * 60; // Convert minutes to seconds
  const remainingSeconds = Math.max(0, timeLimitSeconds - realTimeElapsed);
  return Math.ceil(remainingSeconds / 60); // Convert back to minutes and round up
};

export const isTimeExpired = (timeLimit, realTimeElapsed) => {
  const timeLimitSeconds = timeLimit * 60;
  return realTimeElapsed >= timeLimitSeconds;
};

export const getTimeWarning = (timeLimit, realTimeElapsed) => {
  const timeLimitSeconds = timeLimit * 60;
  const remainingSeconds = Math.max(0, timeLimitSeconds - realTimeElapsed);
  const percentage = (remainingSeconds / timeLimitSeconds) * 100;
  
  if (percentage <= 10) return 'critical';
  if (percentage <= 25) return 'warning';
  return 'normal';
};

