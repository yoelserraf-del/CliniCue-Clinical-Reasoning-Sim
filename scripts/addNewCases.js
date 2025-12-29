// Script to add new cases to CaseLibrary.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New cases data
const newCases = [
  // Student level cases (S-01 to S-05)
  {
    id: 'S-01',
    title: 'Case: Acute MI',
    difficulty: 'student',
    caseLevel: 1,
    specialty: 'Cardiology',
    possibleDiagnoses: ['Acute MI', 'Unstable Angina', 'Aortic Dissection', 'Pericarditis', 'GERD'],
    correctDiagnosis: 'Acute MI',
    patientProfile: {
      name: 'Patient',
      age: 65,
      sex: 'Male',
      pastMedicalHistory: ['Hypertension', 'Hyperlipidemia'],
      chiefComplaint: 'Heavy pressure in my chest, feels like an elephant.',
      presentingSymptoms: ['Chest pain', 'Diaphoresis', 'Nausea']
    },
    initialVitals: {
      hr: 95,
      bp: '150/90',
      rr: 20,
      spo2: 98,
      temp: 37.0
    },
    initialNursingNotes: 'Patient presents with severe chest pressure. ECG shows ST elevation. Requires immediate intervention.',
    investigations: [
      {
        id: 'ecg',
        name: 'ECG',
        timeCost: 5,
        result: 'ST elevation in leads II, III, aVF',
        interpretation: 'Inferior ST elevation MI'
      },
      {
        id: 'troponin',
        name: 'Troponin',
        timeCost: 30,
        result: 'Troponin I: 8.5 ng/mL (elevated)',
        interpretation: 'Markedly elevated troponin consistent with acute MI'
      }
    ],
    availableTreatments: [
      {
        action: 'aspirin',
        label: 'Aspirin',
        description: 'Give aspirin 325mg',
        medication: 'Aspirin 325mg'
      },
      {
        action: 'clopidogrel',
        label: 'Clopidogrel',
        description: 'Give clopidogrel 600mg loading dose',
        medication: 'Clopidogrel 600mg'
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'aspirin', description: 'Give aspirin' },
        { action: 'clopidogrel', description: 'Give clopidogrel' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Myocardial ischemia leads to anaerobic glycolysis: $\\text{Glucose} \\rightarrow 2\\text{Lactate} + 2\\text{ATP}$.',
      keyLearningPoints: [
        'Understanding myocardial ischemia is crucial',
        'Early recognition improves outcomes',
        'Treatment should be evidence-based'
      ]
    }
  },
  {
    id: 'S-02',
    title: 'Case: DKA',
    difficulty: 'student',
    caseLevel: 2,
    specialty: 'Endocrine',
    possibleDiagnoses: ['DKA', 'HHS', 'Type 2 Diabetes', 'Hyperglycemia', 'Sepsis'],
    correctDiagnosis: 'DKA',
    patientProfile: {
      name: 'Patient',
      age: 28,
      sex: 'Female',
      pastMedicalHistory: ['Type 1 Diabetes'],
      chiefComplaint: 'I\'m so thirsty, and my breath smells fruity.',
      presentingSymptoms: ['Polydipsia', 'Polyuria', 'Fruity breath', 'Nausea']
    },
    initialVitals: {
      hr: 110,
      bp: '100/60',
      rr: 24,
      spo2: 98,
      temp: 37.2
    },
    initialNursingNotes: 'Patient presents with diabetic ketoacidosis. Blood glucose elevated. Requires insulin therapy.',
    investigations: [
      {
        id: 'glucose',
        name: 'Blood Glucose',
        timeCost: 10,
        result: 'Glucose: 450 mg/dL (severely elevated)',
        interpretation: 'Severe hyperglycemia'
      },
      {
        id: 'abg',
        name: 'Arterial Blood Gas',
        timeCost: 15,
        result: 'pH: 7.15, HCO3: 12 mEq/L (metabolic acidosis)',
        interpretation: 'Metabolic acidosis consistent with DKA'
      }
    ],
    availableTreatments: [
      {
        action: 'insulin',
        label: 'Insulin Drip',
        description: 'Start insulin infusion',
        medication: 'Insulin drip'
      },
      {
        action: 'fluids',
        label: 'IV Fluids',
        description: 'Give IV normal saline',
        medication: 'Normal saline'
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'fluids', description: 'Give IV fluids' },
        { action: 'insulin', description: 'Start insulin' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'The Anion Gap calculation: $\\text{AG} = [\\text{Na}^+] - ([\\text{Cl}^-] + [\\text{HCO}_3^-])$. Normal is $< 12$.',
      keyLearningPoints: [
        'Understanding DKA pathophysiology',
        'Anion gap calculation is important',
        'Treatment should be evidence-based'
      ]
    }
  },
  {
    id: 'S-03',
    title: 'Case: Pneumothorax',
    difficulty: 'student',
    caseLevel: 3,
    specialty: 'Pulmonology',
    possibleDiagnoses: ['Pneumothorax', 'Pleurisy', 'MI', 'Pulmonary Embolism', 'Costochondritis'],
    correctDiagnosis: 'Pneumothorax',
    patientProfile: {
      name: 'Patient',
      age: 22,
      sex: 'Male',
      pastMedicalHistory: [],
      chiefComplaint: 'Sudden sharp chest pain after a cough.',
      presentingSymptoms: ['Chest pain', 'Dyspnea', 'Tachypnea']
    },
    initialVitals: {
      hr: 105,
      bp: '120/80',
      rr: 28,
      spo2: 92,
      temp: 36.8
    },
    initialNursingNotes: 'Patient presents with sudden onset chest pain. Decreased breath sounds on right side.',
    investigations: [
      {
        id: 'chest-xray',
        name: 'Chest X-ray',
        timeCost: 30,
        result: 'Right-sided pneumothorax visible, no lung markings in right upper lobe',
        interpretation: 'Pneumothorax confirmed on imaging'
      }
    ],
    availableTreatments: [
      {
        action: 'chest-tube',
        label: 'Chest Tube',
        description: 'Insert chest tube',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'chest-tube', description: 'Insert chest tube' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Boyle\'s Law ($P_1 V_1 = P_2 V_2$): Air in the pleural space collapses the lung.',
      keyLearningPoints: [
        'Understanding pneumothorax pathophysiology',
        'Boyle\'s Law explains lung collapse',
        'Treatment should be evidence-based'
      ]
    }
  },
  {
    id: 'S-04',
    title: 'Case: Appendicitis',
    difficulty: 'student',
    caseLevel: 4,
    specialty: 'GI',
    possibleDiagnoses: ['Appendicitis', 'Cholecystitis', 'Pancreatitis', 'Gastritis', 'IBS'],
    correctDiagnosis: 'Appendicitis',
    patientProfile: {
      name: 'Patient',
      age: 18,
      sex: 'Male',
      pastMedicalHistory: [],
      chiefComplaint: 'Pain started near my belly button, moved to the right.',
      presentingSymptoms: ['Abdominal pain', 'Nausea', 'Fever']
    },
    initialVitals: {
      hr: 90,
      bp: '130/80',
      rr: 18,
      spo2: 98,
      temp: 38.2
    },
    initialNursingNotes: 'Patient presents with migrating abdominal pain. Positive McBurney\'s point tenderness.',
    investigations: [
      {
        id: 'cbc',
        name: 'Complete Blood Count',
        timeCost: 30,
        result: 'WBC: 14,000 /μL (elevated)',
        interpretation: 'Elevated white blood cells suggest infection'
      },
      {
        id: 'ct-abdomen',
        name: 'CT Abdomen',
        timeCost: 60,
        result: 'Inflamed appendix with wall thickening',
        interpretation: 'Appendicitis confirmed on imaging'
      }
    ],
    availableTreatments: [
      {
        action: 'appendectomy',
        label: 'Appendectomy',
        description: 'Surgical removal of appendix',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'appendectomy', description: 'Perform appendectomy' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Luminal obstruction leads to bacterial overgrowth and intraluminal pressure.',
      keyLearningPoints: [
        'Understanding appendicitis pathophysiology',
        'Early recognition improves outcomes',
        'Treatment should be evidence-based'
      ]
    }
  },
  {
    id: 'S-05',
    title: 'Case: Meningitis',
    difficulty: 'student',
    caseLevel: 5,
    specialty: 'Neurology',
    possibleDiagnoses: ['Meningitis', 'Encephalitis', 'Subarachnoid Hemorrhage', 'Migraine', 'Brain Tumor'],
    correctDiagnosis: 'Meningitis',
    patientProfile: {
      name: 'Patient',
      age: 25,
      sex: 'Female',
      pastMedicalHistory: [],
      chiefComplaint: 'Horrible headache, stiff neck, and light hurts my eyes.',
      presentingSymptoms: ['Headache', 'Neck stiffness', 'Photophobia', 'Fever']
    },
    initialVitals: {
      hr: 100,
      bp: '140/90',
      rr: 20,
      spo2: 98,
      temp: 39.0
    },
    initialNursingNotes: 'Patient presents with classic meningeal signs. Requires immediate lumbar puncture.',
    investigations: [
      {
        id: 'lumbar-puncture',
        name: 'Lumbar Puncture',
        timeCost: 20,
        result: 'CSF: WBC 500/μL, protein elevated, glucose decreased',
        interpretation: 'CSF findings consistent with bacterial meningitis'
      }
    ],
    availableTreatments: [
      {
        action: 'antibiotics',
        label: 'Antibiotics',
        description: 'Give IV antibiotics',
        medication: 'Ceftriaxone + Vancomycin'
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'antibiotics', description: 'Give antibiotics' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'The Blood-Brain Barrier (BBB) permeability increases during inflammation.',
      keyLearningPoints: [
        'Understanding meningitis pathophysiology',
        'BBB changes during inflammation',
        'Treatment should be evidence-based'
      ]
    }
  },
  // Resident level cases (R-01 to R-05)
  {
    id: 'R-01',
    title: 'Case: Tension Pneumothorax',
    difficulty: 'resident',
    caseLevel: 1,
    specialty: 'ER / Trauma',
    possibleDiagnoses: ['Tension Pneumothorax', 'Cardiac Tamponade', 'Massive PE', 'Hemothorax', 'Pneumothorax'],
    correctDiagnosis: 'Tension Pneumothorax',
    patientProfile: {
      name: 'Patient',
      age: 35,
      sex: 'Male',
      pastMedicalHistory: [],
      chiefComplaint: 'Severe chest pain and difficulty breathing.',
      presentingSymptoms: ['Chest pain', 'Severe dyspnea', 'Hypotension']
    },
    initialVitals: {
      hr: 130,
      bp: '80/40',
      rr: 32,
      spo2: 85,
      temp: 36.5
    },
    initialNursingNotes: 'Patient in severe distress. BP is dropping fast. Trachea is shifted. Requires immediate intervention.',
    investigations: [
      {
        id: 'chest-xray',
        name: 'Chest X-ray',
        timeCost: 15,
        result: 'Complete lung collapse, mediastinal shift',
        interpretation: 'Tension pneumothorax confirmed'
      }
    ],
    availableTreatments: [
      {
        action: 'needle-decompression',
        label: 'Needle Decompression',
        description: 'Immediate needle decompression',
        medication: null
      },
      {
        action: 'chest-tube',
        label: 'Chest Tube',
        description: 'Insert chest tube',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'needle-decompression', description: 'Immediate needle decompression' },
        { action: 'chest-tube', description: 'Insert chest tube' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Thoracic pressure exceeds atmospheric pressure: $P_{\\text{thorax}} > P_{\\text{atm}}$.',
      keyLearningPoints: [
        'Understanding tension pneumothorax',
        'Pressure dynamics are critical',
        'Treatment should be immediate'
      ]
    }
  },
  {
    id: 'R-02',
    title: 'Case: Aortic Dissection',
    difficulty: 'resident',
    caseLevel: 2,
    specialty: 'Cardiology',
    possibleDiagnoses: ['Aortic Dissection', 'Acute MI', 'Pulmonary Embolism', 'Pericarditis', 'Musculoskeletal'],
    correctDiagnosis: 'Aortic Dissection',
    patientProfile: {
      name: 'Patient',
      age: 55,
      sex: 'Male',
      pastMedicalHistory: ['Hypertension', 'Marfan Syndrome'],
      chiefComplaint: 'Tearing back pain; BP is different in each arm.',
      presentingSymptoms: ['Severe back pain', 'Chest pain', 'Diaphoresis']
    },
    initialVitals: {
      hr: 110,
      bp: '180/100 (right), 140/80 (left)',
      rr: 22,
      spo2: 96,
      temp: 37.0
    },
    initialNursingNotes: 'Patient presents with tearing pain. BP discrepancy between arms. Requires immediate imaging.',
    investigations: [
      {
        id: 'ct-aorta',
        name: 'CT Aorta',
        timeCost: 45,
        result: 'Type A aortic dissection visible, extending from ascending aorta',
        interpretation: 'Aortic dissection confirmed'
      }
    ],
    availableTreatments: [
      {
        action: 'surgery',
        label: 'Emergency Surgery',
        description: 'Emergency aortic repair',
        medication: null
      },
      {
        action: 'beta-blocker',
        label: 'Beta Blocker',
        description: 'Give beta blocker to reduce shear stress',
        medication: 'Esmolol'
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'beta-blocker', description: 'Give beta blocker' },
        { action: 'surgery', description: 'Emergency surgery' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Laplace\'s Law: Wall stress $\\sigma = \\frac{Pr}{2h}$ explains why high BP causes tears.',
      keyLearningPoints: [
        'Understanding aortic dissection',
        'Laplace\'s Law explains wall stress',
        'Treatment should be immediate'
      ]
    }
  },
  {
    id: 'R-03',
    title: 'Case: Acute Renal Failure',
    difficulty: 'resident',
    caseLevel: 3,
    specialty: 'Nephrology',
    possibleDiagnoses: ['Acute Renal Failure', 'Prerenal AKI', 'Intrinsic AKI', 'Postrenal AKI', 'Chronic Kidney Disease'],
    correctDiagnosis: 'Acute Renal Failure',
    patientProfile: {
      name: 'Patient',
      age: 60,
      sex: 'Female',
      pastMedicalHistory: ['Hypertension', 'Osteoarthritis'],
      chiefComplaint: 'Patient hasn\'t urinated in 12 hours after taking NSAIDs.',
      presentingSymptoms: ['Oliguria', 'Fatigue', 'Nausea']
    },
    initialVitals: {
      hr: 85,
      bp: '140/90',
      rr: 18,
      spo2: 98,
      temp: 36.8
    },
    initialNursingNotes: 'Patient presents with acute kidney injury after NSAID use. Creatinine elevated.',
    investigations: [
      {
        id: 'creatinine',
        name: 'Creatinine',
        timeCost: 30,
        result: 'Creatinine: 3.2 mg/dL (elevated)',
        interpretation: 'Acute kidney injury'
      },
      {
        id: 'urinalysis',
        name: 'Urinalysis',
        timeCost: 20,
        result: 'No casts, bland sediment',
        interpretation: 'Prerenal pattern'
      }
    ],
    availableTreatments: [
      {
        action: 'fluids',
        label: 'IV Fluids',
        description: 'Give IV fluids',
        medication: 'Normal saline'
      },
      {
        action: 'stop-nsaids',
        label: 'Stop NSAIDs',
        description: 'Discontinue NSAIDs',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'stop-nsaids', description: 'Stop NSAIDs' },
        { action: 'fluids', description: 'Give IV fluids' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Decreased Prostaglandins lead to afferent arteriole constriction and lower GFR.',
      keyLearningPoints: [
        'Understanding NSAID-induced AKI',
        'Prostaglandin role in renal perfusion',
        'Treatment should be evidence-based'
      ]
    }
  },
  {
    id: 'R-04',
    title: 'Case: Septic Shock',
    difficulty: 'resident',
    caseLevel: 4,
    specialty: 'Infectious Dis.',
    possibleDiagnoses: ['Septic Shock', 'Hypovolemic Shock', 'Cardiogenic Shock', 'Anaphylactic Shock', 'Neurogenic Shock'],
    correctDiagnosis: 'Septic Shock',
    patientProfile: {
      name: 'Patient',
      age: 70,
      sex: 'Male',
      pastMedicalHistory: ['Diabetes', 'COPD'],
      chiefComplaint: 'High fever, HR 130, BP 85/50. Lungs are clear.',
      presentingSymptoms: ['Fever', 'Tachycardia', 'Hypotension', 'Altered mental status']
    },
    initialVitals: {
      hr: 130,
      bp: '85/50',
      rr: 24,
      spo2: 94,
      temp: 39.5
    },
    initialNursingNotes: 'Patient in septic shock. Requires immediate fluid resuscitation and antibiotics.',
    investigations: [
      {
        id: 'lactate',
        name: 'Lactate',
        timeCost: 15,
        result: 'Lactate: 4.5 mmol/L (elevated)',
        interpretation: 'Elevated lactate indicates tissue hypoperfusion'
      },
      {
        id: 'blood-culture',
        name: 'Blood Culture',
        timeCost: 0,
        result: 'Pending',
        interpretation: 'Blood cultures sent'
      }
    ],
    availableTreatments: [
      {
        action: 'fluids',
        label: 'IV Fluids',
        description: 'Give IV fluids',
        medication: 'Normal saline bolus'
      },
      {
        action: 'antibiotics',
        label: 'Antibiotics',
        description: 'Give broad-spectrum antibiotics',
        medication: 'Vancomycin + Piperacillin-Tazobactam'
      },
      {
        action: 'vasopressor',
        label: 'Vasopressor',
        description: 'Start norepinephrine if needed',
        medication: 'Norepinephrine'
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'fluids', description: 'Give IV fluids' },
        { action: 'antibiotics', description: 'Give antibiotics' },
        { action: 'vasopressor', description: 'Start vasopressor if needed' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Sepsis causes systemic vasodilation: $\\text{BP} = \\text{CO} \\times \\downarrow \\text{SVR}$.',
      keyLearningPoints: [
        'Understanding septic shock',
        'Hemodynamic changes in sepsis',
        'Treatment should be immediate'
      ]
    }
  },
  {
    id: 'R-05',
    title: 'Case: Eclampsia',
    difficulty: 'resident',
    caseLevel: 5,
    specialty: 'OB/GYN',
    possibleDiagnoses: ['Eclampsia', 'Preeclampsia', 'Seizure Disorder', 'Stroke', 'Hypertensive Emergency'],
    correctDiagnosis: 'Eclampsia',
    patientProfile: {
      name: 'Patient',
      age: 28,
      sex: 'Female',
      pastMedicalHistory: ['Pregnancy - 32 weeks'],
      chiefComplaint: 'Pregnant patient (32 weeks) is having a seizure.',
      presentingSymptoms: ['Seizure', 'Hypertension', 'Headache', 'Visual changes']
    },
    initialVitals: {
      hr: 100,
      bp: '180/110',
      rr: 20,
      spo2: 98,
      temp: 37.0
    },
    initialNursingNotes: 'Pregnant patient with seizure. Severe hypertension. Requires immediate magnesium and delivery planning.',
    investigations: [
      {
        id: 'magnesium',
        name: 'Serum Magnesium',
        timeCost: 20,
        result: 'Magnesium: 1.2 mg/dL (low)',
        interpretation: 'Low magnesium level'
      },
      {
        id: 'urine-protein',
        name: 'Urine Protein',
        timeCost: 15,
        result: 'Protein: 3+ (elevated)',
        interpretation: 'Significant proteinuria'
      }
    ],
    availableTreatments: [
      {
        action: 'magnesium',
        label: 'Magnesium Sulfate',
        description: 'Give magnesium sulfate',
        medication: 'Magnesium sulfate 4g IV'
      },
      {
        action: 'delivery',
        label: 'Delivery',
        description: 'Plan for delivery',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'magnesium', description: 'Give magnesium' },
        { action: 'delivery', description: 'Plan delivery' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Cerebral edema caused by severe hypertension and endothelial dysfunction.',
      keyLearningPoints: [
        'Understanding eclampsia',
        'Pathophysiology of seizures in pregnancy',
        'Treatment should be immediate'
      ]
    }
  },
  // Advanced cases (A-01 to A-05) - Resident level
  {
    id: 'A-01',
    title: 'Case: Cardiac Tamponade',
    difficulty: 'resident',
    caseLevel: 6,
    specialty: 'Cardiology',
    possibleDiagnoses: ['Cardiac Tamponade', 'Heart Failure', 'Pulmonary Embolism', 'MI', 'Pneumothorax'],
    correctDiagnosis: 'Cardiac Tamponade',
    patientProfile: {
      name: 'Patient',
      age: 45,
      sex: 'Male',
      pastMedicalHistory: ['Pericarditis'],
      chiefComplaint: 'Looks like Heart Failure, but the lungs are clear.',
      presentingSymptoms: ['Dyspnea', 'Hypotension', 'JVD', 'Muffled heart sounds']
    },
    initialVitals: {
      hr: 120,
      bp: '90/60',
      rr: 24,
      spo2: 92,
      temp: 37.2
    },
    initialNursingNotes: 'Patient in distress. Pulsus paradoxus present. Lungs clear. Requires immediate pericardiocentesis.',
    investigations: [
      {
        id: 'echo',
        name: 'Echocardiogram',
        timeCost: 30,
        result: 'Large pericardial effusion with right ventricular collapse',
        interpretation: 'Cardiac tamponade confirmed'
      }
    ],
    availableTreatments: [
      {
        action: 'pericardiocentesis',
        label: 'Pericardiocentesis',
        description: 'Perform pericardiocentesis',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'pericardiocentesis', description: 'Perform pericardiocentesis' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Pulsus Paradoxus: A drop in SBP $> 10$ mmHg during inspiration.',
      keyLearningPoints: [
        'Understanding cardiac tamponade',
        'Pulsus paradoxus mechanism',
        'Treatment should be immediate'
      ]
    }
  },
  {
    id: 'A-02',
    title: 'Case: Opioid Overdose',
    difficulty: 'resident',
    caseLevel: 7,
    specialty: 'Toxicology',
    possibleDiagnoses: ['Opioid Overdose', 'Sedative Overdose', 'Stroke', 'Hypoglycemia', 'Seizure'],
    correctDiagnosis: 'Opioid Overdose',
    patientProfile: {
      name: 'Patient',
      age: 30,
      sex: 'Male',
      pastMedicalHistory: ['Substance Use Disorder'],
      chiefComplaint: 'Patient is barely breathing (RR=4); pinpoint pupils.',
      presentingSymptoms: ['Respiratory depression', 'Pinpoint pupils', 'Altered mental status', 'Cyanosis']
    },
    initialVitals: {
      hr: 50,
      bp: '100/60',
      rr: 4,
      spo2: 75,
      temp: 36.0
    },
    initialNursingNotes: 'Patient in respiratory failure. Pinpoint pupils. Suspected opioid overdose. Requires naloxone.',
    investigations: [
      {
        id: 'abg',
        name: 'Arterial Blood Gas',
        timeCost: 15,
        result: 'pH: 7.20, pCO2: 65 mmHg (respiratory acidosis)',
        interpretation: 'Severe respiratory acidosis'
      }
    ],
    availableTreatments: [
      {
        action: 'naloxone',
        label: 'Naloxone',
        description: 'Give naloxone',
        medication: 'Naloxone 2mg IV'
      },
      {
        action: 'ventilation',
        label: 'Ventilation Support',
        description: 'Support ventilation',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'naloxone', description: 'Give naloxone' },
        { action: 'ventilation', description: 'Support ventilation' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: '$\\mu$-opioid receptors in the brainstem reduce sensitivity to $\\text{CO}_2$.',
      keyLearningPoints: [
        'Understanding opioid overdose',
        'Mechanism of respiratory depression',
        'Treatment should be immediate'
      ]
    }
  },
  {
    id: 'A-03',
    title: 'Case: Wolff-Parkinson-White',
    difficulty: 'resident',
    caseLevel: 8,
    specialty: 'Cardiology',
    possibleDiagnoses: ['Wolff-Parkinson-White', 'SVT', 'Atrial Fibrillation', 'Ventricular Tachycardia', 'Anxiety'],
    correctDiagnosis: 'Wolff-Parkinson-White',
    patientProfile: {
      name: 'Patient',
      age: 20,
      sex: 'Male',
      pastMedicalHistory: [],
      chiefComplaint: 'Young athlete faints; ECG shows a \'Delta Wave\'.',
      presentingSymptoms: ['Syncope', 'Palpitations', 'Dizziness']
    },
    initialVitals: {
      hr: 180,
      bp: '100/60',
      rr: 20,
      spo2: 98,
      temp: 36.5
    },
    initialNursingNotes: 'Young athlete with syncope. ECG shows delta wave and short PR interval. WPW syndrome.',
    investigations: [
      {
        id: 'ecg',
        name: 'ECG',
        timeCost: 5,
        result: 'Delta wave present, short PR interval, wide QRS',
        interpretation: 'WPW pattern confirmed'
      }
    ],
    availableTreatments: [
      {
        action: 'cardioversion',
        label: 'Cardioversion',
        description: 'Synchronized cardioversion if unstable',
        medication: null
      },
      {
        action: 'ablation',
        label: 'Ablation',
        description: 'Consider ablation',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'cardioversion', description: 'Cardioversion if unstable' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'An accessory pathway bypasses the AV node, creating a \'short circuit\'.',
      keyLearningPoints: [
        'Understanding WPW syndrome',
        'Accessory pathway mechanism',
        'Treatment should be evidence-based'
      ]
    }
  },
  {
    id: 'A-04',
    title: 'Case: Pulmonary-Renal Syndrome',
    difficulty: 'resident',
    caseLevel: 9,
    specialty: 'Rheumatology',
    possibleDiagnoses: ['Goodpasture Syndrome', 'Wegener\'s Granulomatosis', 'Lupus', 'Pneumonia', 'Glomerulonephritis'],
    correctDiagnosis: 'Goodpasture Syndrome',
    patientProfile: {
      name: 'Patient',
      age: 35,
      sex: 'Male',
      pastMedicalHistory: [],
      chiefComplaint: 'Patient is coughing blood AND has kidney failure.',
      presentingSymptoms: ['Hemoptysis', 'Hematuria', 'Dyspnea', 'Fatigue']
    },
    initialVitals: {
      hr: 100,
      bp: '150/95',
      rr: 24,
      spo2: 90,
      temp: 37.5
    },
    initialNursingNotes: 'Patient with hemoptysis and renal failure. Suspected pulmonary-renal syndrome. Requires antibody testing.',
    investigations: [
      {
        id: 'anti-gbm',
        name: 'Anti-GBM Antibodies',
        timeCost: 48,
        result: 'Anti-GBM antibodies: Positive',
        interpretation: 'Goodpasture syndrome confirmed'
      },
      {
        id: 'creatinine',
        name: 'Creatinine',
        timeCost: 30,
        result: 'Creatinine: 4.5 mg/dL (elevated)',
        interpretation: 'Acute kidney injury'
      }
    ],
    availableTreatments: [
      {
        action: 'plasmapheresis',
        label: 'Plasmapheresis',
        description: 'Start plasmapheresis',
        medication: null
      },
      {
        action: 'steroids',
        label: 'Steroids',
        description: 'Give high-dose steroids',
        medication: 'Methylprednisolone'
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'plasmapheresis', description: 'Start plasmapheresis' },
        { action: 'steroids', description: 'Give steroids' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Goodpasture Syndrome: Antibodies attacking Type IV Collagen in Basement Membrane.',
      keyLearningPoints: [
        'Understanding Goodpasture syndrome',
        'Autoimmune mechanism',
        'Treatment should be immediate'
      ]
    }
  },
  {
    id: 'A-05',
    title: 'Case: Pheochromocytoma',
    difficulty: 'resident',
    caseLevel: 10,
    specialty: 'Endocrine',
    possibleDiagnoses: ['Pheochromocytoma', 'Hypertensive Emergency', 'Anxiety', 'Hyperthyroidism', 'Cocaine Use'],
    correctDiagnosis: 'Pheochromocytoma',
    patientProfile: {
      name: 'Patient',
      age: 40,
      sex: 'Female',
      pastMedicalHistory: [],
      chiefComplaint: 'Random bursts of extreme BP (220/110) and sweating.',
      presentingSymptoms: ['Paroxysmal hypertension', 'Diaphoresis', 'Headache', 'Palpitations']
    },
    initialVitals: {
      hr: 110,
      bp: '220/110',
      rr: 22,
      spo2: 98,
      temp: 37.0
    },
    initialNursingNotes: 'Patient with paroxysmal hypertension. Episodic symptoms. Suspected pheochromocytoma.',
    investigations: [
      {
        id: 'metanephrines',
        name: 'Plasma Metanephrines',
        timeCost: 48,
        result: 'Metanephrines: 5x upper limit (elevated)',
        interpretation: 'Elevated catecholamines'
      }
    ],
    availableTreatments: [
      {
        action: 'alpha-blocker',
        label: 'Alpha Blocker',
        description: 'Give alpha blocker',
        medication: 'Phenoxybenzamine'
      },
      {
        action: 'surgery',
        label: 'Surgery',
        description: 'Surgical removal',
        medication: null
      }
    ],
    correctTreatment: {
      sequence: [
        { action: 'alpha-blocker', description: 'Give alpha blocker' },
        { action: 'surgery', description: 'Surgical removal' }
      ],
      expectedOutcome: 'Patient should improve with appropriate treatment'
    },
    scienceBridge: {
      pathophysiology: 'Excessive Epinephrine and Norepinephrine secretion from adrenal medulla.',
      keyLearningPoints: [
        'Understanding pheochromocytoma',
        'Catecholamine excess',
        'Treatment should be evidence-based'
      ]
    }
  }
];

// Read existing case library
const caseLibraryPath = path.join(__dirname, '../src/data/CaseLibrary.json');
const existingCases = JSON.parse(fs.readFileSync(caseLibraryPath, 'utf8'));

// Add new cases to the library
const updatedCases = [...existingCases, ...newCases];

// Write back to file
fs.writeFileSync(caseLibraryPath, JSON.stringify(updatedCases, null, 2));

console.log(`Added ${newCases.length} new cases to CaseLibrary.json`);
console.log(`Total cases: ${updatedCases.length}`);
console.log('\nNew cases added:');
newCases.forEach(c => {
  console.log(`  - ${c.id}: ${c.title} (${c.difficulty}, level ${c.caseLevel})`);
});

