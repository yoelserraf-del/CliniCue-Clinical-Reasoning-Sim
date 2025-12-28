// State Machine for Clinical Reasoning Flow
export const CASE_STATES = {
  TRIAGE: 'triage',
  INVESTIGATION: 'investigation',
  DIAGNOSIS: 'diagnosis',
  TREATMENT: 'treatment',
  DEBRIEF: 'debrief',
  COMPLETED: 'completed'
};

export const getNextState = (currentState) => {
  const stateFlow = {
    [CASE_STATES.TRIAGE]: CASE_STATES.INVESTIGATION,
    [CASE_STATES.INVESTIGATION]: CASE_STATES.DIAGNOSIS,
    [CASE_STATES.DIAGNOSIS]: CASE_STATES.TREATMENT,
    [CASE_STATES.TREATMENT]: CASE_STATES.DEBRIEF,
    [CASE_STATES.DEBRIEF]: CASE_STATES.COMPLETED,
  };
  return stateFlow[currentState] || currentState;
};

export const getStateDisplayName = (state) => {
  const names = {
    [CASE_STATES.TRIAGE]: 'Triage & Initial Assessment',
    [CASE_STATES.INVESTIGATION]: 'Investigation',
    [CASE_STATES.DIAGNOSIS]: 'Diagnosis',
    [CASE_STATES.TREATMENT]: 'Treatment',
    [CASE_STATES.DEBRIEF]: 'Debrief',
    [CASE_STATES.COMPLETED]: 'Case Completed',
  };
  return names[state] || state;
};
