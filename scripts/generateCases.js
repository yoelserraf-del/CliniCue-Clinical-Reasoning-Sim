// Case Generator Script
// This script generates 100 cases per difficulty level (400 total cases)
// Run with: node scripts/generateCases.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Medical case templates by system
const caseTemplates = {
  respiratory: [
    { title: 'Respiratory Distress', diagnoses: ['Pneumonia', 'Asthma', 'COPD Exacerbation', 'Pulmonary Embolism', 'Heart Failure'] },
    { title: 'Chest Pain', diagnoses: ['Pneumonia', 'Pulmonary Embolism', 'MI', 'Pneumothorax', 'Costochondritis'] },
    { title: 'Shortness of Breath', diagnoses: ['Heart Failure', 'Pneumonia', 'Asthma', 'Anxiety', 'Pulmonary Embolism'] },
    { title: 'Cough', diagnoses: ['Pneumonia', 'Bronchitis', 'Asthma', 'GERD', 'Post-nasal Drip'] },
  ],
  cardiovascular: [
    { title: 'Chest Pain', diagnoses: ['Acute MI', 'Unstable Angina', 'Aortic Dissection', 'Pericarditis', 'GERD'] },
    { title: 'Palpitations', diagnoses: ['Atrial Fibrillation', 'SVT', 'Anxiety', 'Hyperthyroidism', 'Anemia'] },
    { title: 'Syncope', diagnoses: ['Arrhythmia', 'Orthostatic Hypotension', 'Vasovagal', 'Pulmonary Embolism', 'MI'] },
  ],
  gastrointestinal: [
    { title: 'Abdominal Pain', diagnoses: ['Appendicitis', 'Cholecystitis', 'Pancreatitis', 'Gastritis', 'IBS'] },
    { title: 'Nausea and Vomiting', diagnoses: ['Gastroenteritis', 'Pancreatitis', 'Appendicitis', 'Migraine', 'Medication Side Effect'] },
    { title: 'Diarrhea', diagnoses: ['Gastroenteritis', 'IBD', 'IBS', 'C. diff', 'Food Poisoning'] },
  ],
  neurological: [
    { title: 'Headache', diagnoses: ['Migraine', 'Tension Headache', 'Meningitis', 'Subarachnoid Hemorrhage', 'Sinusitis'] },
    { title: 'Seizure', diagnoses: ['Epilepsy', 'Meningitis', 'Brain Tumor', 'Stroke', 'Metabolic Disorder'] },
    { title: 'Altered Mental Status', diagnoses: ['Delirium', 'Stroke', 'Meningitis', 'Hypoglycemia', 'Drug Overdose'] },
  ],
  infectious: [
    { title: 'Fever', diagnoses: ['Bacterial Infection', 'Viral Infection', 'UTI', 'Pneumonia', 'Sepsis'] },
    { title: 'Sepsis', diagnoses: ['Bacterial Sepsis', 'Viral Sepsis', 'Fungal Sepsis', 'Source Unknown', 'UTI'] },
  ],
  endocrine: [
    { title: 'Hyperglycemia', diagnoses: ['Type 2 Diabetes', 'DKA', 'HHS', 'Medication Effect', 'Stress Hyperglycemia'] },
    { title: 'Hypoglycemia', diagnoses: ['Medication Overdose', 'Insulinoma', 'Adrenal Insufficiency', 'Liver Failure', 'Sepsis'] },
  ],
  renal: [
    { title: 'Acute Kidney Injury', diagnoses: ['Prerenal AKI', 'Intrinsic AKI', 'Postrenal AKI', 'Nephrotoxin', 'Sepsis'] },
    { title: 'Hematuria', diagnoses: ['UTI', 'Nephrolithiasis', 'Glomerulonephritis', 'Bladder Cancer', 'Trauma'] },
  ],
};

// Generate vitals based on diagnosis
function generateVitals(diagnosis, difficulty) {
  const baseVitals = {
    hr: 70 + Math.floor(Math.random() * 30),
    bp: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)}`,
    rr: 16 + Math.floor(Math.random() * 6),
    spo2: 96 + Math.floor(Math.random() * 3),
    temp: 36.5 + Math.random() * 1.5
  };

  // Adjust based on diagnosis
  if (diagnosis.includes('Pneumonia') || diagnosis.includes('Infection')) {
    baseVitals.temp = 37.5 + Math.random() * 1.5;
    baseVitals.hr += 10;
    baseVitals.rr += 4;
  }
  if (diagnosis.includes('Heart Failure') || diagnosis.includes('MI')) {
    baseVitals.hr += 15;
    baseVitals.bp = `${90 + Math.floor(Math.random() * 40)}/${60 + Math.floor(Math.random() * 20)}`;
  }

  return baseVitals;
}

// Generate a single case
function generateCase(id, difficulty, caseLevel, system, template) {
  const diagnosis = template.diagnoses[0]; // Use first as correct
  const otherDiagnoses = template.diagnoses.slice(1);
  
  return {
    id: `case-${String(id).padStart(3, '0')}`,
    title: `Case ${caseLevel}: ${template.title}`,
    difficulty: difficulty,
    caseLevel: caseLevel,
    possibleDiagnoses: template.diagnoses,
    correctDiagnosis: diagnosis,
    availableTreatments: generateTreatments(diagnosis),
    patientProfile: generatePatientProfile(template.title, difficulty),
    initialVitals: generateVitals(diagnosis, difficulty),
    initialNursingNotes: generateNursingNotes(template.title, diagnosis, difficulty),
    investigations: generateInvestigations(diagnosis, difficulty),
    correctTreatment: generateCorrectTreatment(diagnosis),
    scienceBridge: generateScienceBridge(diagnosis, difficulty)
  };
}

function generatePatientProfile(title, difficulty) {
  const names = ['John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis'];
  const ages = difficulty === 'highschool' ? [18, 25] : difficulty === 'premed' ? [25, 45] : difficulty === 'student' ? [30, 65] : [40, 80];
  
  return {
    name: names[Math.floor(Math.random() * names.length)],
    age: ages[0] + Math.floor(Math.random() * (ages[1] - ages[0])),
    sex: Math.random() > 0.5 ? 'Male' : 'Female',
    pastMedicalHistory: generatePMH(difficulty),
    chiefComplaint: generateChiefComplaint(title),
    presentingSymptoms: generateSymptoms(title)
  };
}

function generatePMH(difficulty) {
  const common = ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia'];
  const advanced = ['CAD', 'COPD', 'CKD', 'CHF'];
  
  const pmh = [];
  if (Math.random() > 0.3) pmh.push(common[Math.floor(Math.random() * common.length)]);
  if (difficulty !== 'highschool' && Math.random() > 0.5) {
    pmh.push(advanced[Math.floor(Math.random() * advanced.length)]);
  }
  return pmh.length > 0 ? pmh : ['None'];
}

function generateChiefComplaint(title) {
  const complaints = {
    'Respiratory Distress': 'Shortness of breath and cough for 3 days',
    'Chest Pain': 'Acute onset chest pain',
    'Shortness of Breath': 'Progressive dyspnea',
    'Cough': 'Persistent cough with sputum',
    'Abdominal Pain': 'Severe abdominal pain',
    'Nausea and Vomiting': 'Nausea and vomiting for 24 hours',
    'Headache': 'Severe headache',
    'Fever': 'Fever and chills'
  };
  return complaints[title] || `${title.toLowerCase()} for several days`;
}

function generateSymptoms(title) {
  const symptomSets = {
    'Respiratory Distress': ['Dyspnea', 'Cough', 'Fever', 'Fatigue'],
    'Chest Pain': ['Chest pressure', 'Diaphoresis', 'Nausea', 'Shortness of breath'],
    'Abdominal Pain': ['Nausea', 'Vomiting', 'Fever', 'Abdominal tenderness']
  };
  return symptomSets[title] || ['Fever', 'Malaise', 'Fatigue'];
}

function generateNursingNotes(title, diagnosis, difficulty) {
  return `Patient presents with ${title.toLowerCase()}. Clinical findings consistent with ${diagnosis}. Requires further investigation.`;
}

function generateInvestigations(diagnosis, difficulty) {
  const investigations = [];
  
  // Always include basic tests
  investigations.push({
    id: 'cbc',
    name: 'Complete Blood Count',
    timeCost: 30,
    result: { wbc: '12,500 /μL (elevated)', hemoglobin: '13.2 g/dL', platelets: '250,000 /μL' },
    interpretation: difficulty === 'highschool' ? 'Elevated white blood cells suggest infection' : null
  });
  
  // Add diagnosis-specific tests
  if (diagnosis.includes('Pneumonia')) {
    investigations.push({
      id: 'chest-xray',
      name: 'Chest X-Ray',
      timeCost: 45,
      result: 'Consolidation in right lower lobe',
      interpretation: difficulty === 'highschool' ? 'Consolidation suggests pneumonia' : null
    });
  }
  
  return investigations;
}

function generateTreatments(diagnosis) {
  const treatments = [
    { action: 'monitor', label: 'Monitor Patient', description: 'Continue monitoring', medication: null }
  ];
  
  if (diagnosis.includes('Pneumonia')) {
    treatments.push({
      action: 'start_antibiotics',
      label: 'Start Antibiotics',
      description: 'Empiric antibiotic therapy',
      medication: 'Ceftriaxone 1g IV + Azithromycin 500mg IV'
    });
  }
  
  return treatments;
}

function generateCorrectTreatment(diagnosis) {
  return {
    sequence: [
      { action: 'monitor', description: 'Monitor patient' }
    ],
    expectedOutcome: 'Patient should improve with appropriate treatment'
  };
}

function generateScienceBridge(diagnosis, difficulty) {
  const formulas = {
    'Pneumonia': '$$V/Q = \\frac{Ventilation}{Perfusion}$$',
    'Heart Failure': '$$CO = HR \\times SV$$',
    'Sepsis': '$$SVR = \\frac{MAP - CVP}{CO} \\times 80$$'
  };
  
  return {
    pathophysiology: `${diagnosis} pathophysiology involves complex interactions. ${formulas[diagnosis] || ''}`,
    keyLearningPoints: [
      `Understanding ${diagnosis} is crucial for clinical practice`,
      'Early recognition improves outcomes',
      'Treatment should be evidence-based'
    ]
  };
}

// Main generation function
function generateAllCases() {
  const difficulties = ['highschool', 'premed', 'student', 'resident'];
  const allCases = [];
  let caseId = 1;
  
  difficulties.forEach(difficulty => {
    const systems = Object.keys(caseTemplates);
    
    for (let level = 1; level <= 100; level++) {
      const system = systems[level % systems.length];
      const templates = caseTemplates[system];
      const template = templates[level % templates.length];
      
      const case_ = generateCase(caseId, difficulty, level, system, template);
      allCases.push(case_);
      caseId++;
    }
  });
  
  return allCases;
}

// Write to file
const cases = generateAllCases();
const outputPath = path.join(__dirname, '../src/data/CaseLibrary.json');
fs.writeFileSync(outputPath, JSON.stringify(cases, null, 2));
console.log(`Generated ${cases.length} cases and saved to ${outputPath}`);

