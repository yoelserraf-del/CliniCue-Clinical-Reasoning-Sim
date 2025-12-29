// Medical Logic Validator for CaseLibrary.json
// This script validates medical and logical consistency of all cases
// Run with: node scripts/validateCases.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read case library
const caseLibraryPath = path.join(__dirname, '../src/data/CaseLibrary.json');
const cases = JSON.parse(fs.readFileSync(caseLibraryPath, 'utf8'));

const errors = [];
const warnings = [];

// Helper function to parse BP string (e.g., "120/80")
function parseBP(bpString) {
  if (!bpString || typeof bpString !== 'string') return null;
  const parts = bpString.split('/');
  if (parts.length !== 2) return null;
  const systolic = parseInt(parts[0], 10);
  const diastolic = parseInt(parts[1], 10);
  if (isNaN(systolic) || isNaN(diastolic)) return null;
  return { systolic, diastolic };
}

// Helper function to check if diagnosis matches treatment
function isTreatmentAppropriate(diagnosis, treatment) {
  const diagnosisLower = diagnosis.toLowerCase();
  const treatmentLower = treatment.toLowerCase();
  
  // Surgery for non-surgical conditions
  const nonSurgicalConditions = ['pneumonia', 'asthma', 'copd', 'diabetes', 'hypertension', 'migraine', 'anxiety'];
  if (nonSurgicalConditions.some(cond => diagnosisLower.includes(cond)) && 
      (treatmentLower.includes('surgery') || treatmentLower.includes('appendectomy') || treatmentLower.includes('cholecystectomy'))) {
    return false;
  }
  
  // Medical conditions that shouldn't require surgery
  if (diagnosisLower.includes('pneumonia') && treatmentLower.includes('surgery')) {
    return false;
  }
  
  return true;
}

// Validate each case
cases.forEach((caseItem, index) => {
  const caseId = caseItem.id || `case-${index + 1}`;
  
  // 1. Physiological Impossibility Checks
  if (caseItem.initialVitals) {
    const vitals = caseItem.initialVitals;
    
    // Check BP: SBP must be >= DBP
    if (vitals.bp) {
      const bp = parseBP(vitals.bp);
      if (bp) {
        if (bp.systolic < bp.diastolic) {
          errors.push(`${caseId}: Physiological Impossibility - Systolic BP (${bp.systolic}) is lower than Diastolic BP (${bp.diastolic})`);
        }
        if (bp.systolic < 50 || bp.systolic > 250) {
          warnings.push(`${caseId}: Unusual Systolic BP - ${bp.systolic} mmHg (normal range: 90-140)`);
        }
        if (bp.diastolic < 30 || bp.diastolic > 150) {
          warnings.push(`${caseId}: Unusual Diastolic BP - ${bp.diastolic} mmHg (normal range: 60-90)`);
        }
      }
    }
    
    // Check SpO2: Must be <= 100%
    if (vitals.spo2 !== undefined && vitals.spo2 !== null) {
      const spo2 = typeof vitals.spo2 === 'string' ? parseInt(vitals.spo2, 10) : vitals.spo2;
      if (!isNaN(spo2)) {
        if (spo2 > 100) {
          errors.push(`${caseId}: Physiological Impossibility - SpO2 (${spo2}%) cannot exceed 100%`);
        }
        if (spo2 < 70) {
          warnings.push(`${caseId}: Critically low SpO2 - ${spo2}% (patient would likely be intubated)`);
        }
      }
    }
    
    // Check Heart Rate: Must be reasonable (30-220 bpm)
    if (vitals.hr !== undefined && vitals.hr !== null) {
      const hr = typeof vitals.hr === 'string' ? parseInt(vitals.hr, 10) : vitals.hr;
      if (!isNaN(hr)) {
        if (hr < 30 || hr > 220) {
          warnings.push(`${caseId}: Unusual Heart Rate - ${hr} bpm (normal range: 60-100)`);
        }
      }
    }
    
    // Check Temperature: Must be reasonable (32-42°C)
    if (vitals.temp !== undefined && vitals.temp !== null) {
      const temp = typeof vitals.temp === 'string' ? parseFloat(vitals.temp) : vitals.temp;
      if (!isNaN(temp)) {
        if (temp < 32 || temp > 42) {
          warnings.push(`${caseId}: Unusual Temperature - ${temp}°C (normal range: 36.5-37.5)`);
        }
      }
    }
  }
  
  // 2. Inconsistent Vitals Checks
  const diagnosis = caseItem.correctDiagnosis?.toLowerCase() || '';
  const vitals = caseItem.initialVitals || {};
  
  // Septic Shock should have high HR and low BP
  if (diagnosis.includes('septic') || diagnosis.includes('shock')) {
    const hr = typeof vitals.hr === 'string' ? parseInt(vitals.hr, 10) : vitals.hr;
    const bp = parseBP(vitals.bp);
    if (hr && hr < 100) {
      warnings.push(`${caseId}: Inconsistent Vitals - Septic Shock typically has tachycardia (HR > 100), but HR is ${hr}`);
    }
    if (bp && bp.systolic > 100) {
      warnings.push(`${caseId}: Inconsistent Vitals - Septic Shock typically has hypotension (SBP < 100), but SBP is ${bp.systolic}`);
    }
  }
  
  // MI should have elevated HR or abnormal BP
  if (diagnosis.includes('mi') || diagnosis.includes('myocardial')) {
    const hr = typeof vitals.hr === 'string' ? parseInt(vitals.hr, 10) : vitals.hr;
    if (hr && hr < 60) {
      warnings.push(`${caseId}: Inconsistent Vitals - MI typically has elevated HR, but HR is ${hr}`);
    }
  }
  
  // Hypoglycemia should have low glucose (if available)
  if (diagnosis.includes('hypoglycemia') || diagnosis.includes('hypoglycemic')) {
    // Check if investigations include glucose
    const hasGlucose = caseItem.investigations?.some(inv => 
      inv.id?.toLowerCase().includes('glucose') || inv.name?.toLowerCase().includes('glucose')
    );
    if (!hasGlucose) {
      warnings.push(`${caseId}: Missing Investigation - Hypoglycemia case should include glucose test`);
    }
  }
  
  // 3. Missing Science Checks
  if (!caseItem.scienceBridge) {
    errors.push(`${caseId}: Missing Science - No scienceBridge field found`);
  } else {
    if (!caseItem.scienceBridge.pathophysiology || caseItem.scienceBridge.pathophysiology.trim() === '') {
      errors.push(`${caseId}: Missing Science - scienceBridge.pathophysiology is empty`);
    }
    // Check for LaTeX formulas (should contain $ or \[ or \()
    const hasLatex = /(\$|\\\[|\\\(|\\text|\\frac|\\sqrt)/.test(caseItem.scienceBridge.pathophysiology);
    if (!hasLatex) {
      warnings.push(`${caseId}: Missing LaTeX - scienceBridge.pathophysiology should contain LaTeX formulas (use $...$ or \\[...\\])`);
    }
  }
  
  // 4. Time Inconsistency Checks
  const difficulty = caseItem.difficulty;
  const caseLevel = caseItem.caseLevel || 1;
  
  // Base time limits by difficulty
  const baseLimits = {
    'highschool': 30,
    'premed': 25,
    'student': 20,
    'resident': 15
  };
  
  const levelReduction = Math.floor((caseLevel - 1) / 2) * 2;
  const expectedTimeLimit = Math.max(10, (baseLimits[difficulty] || 20) - levelReduction);
  
  // Check if investigations have reasonable time costs
  if (caseItem.investigations && Array.isArray(caseItem.investigations)) {
    const totalTimeCost = caseItem.investigations.reduce((sum, inv) => sum + (inv.timeCost || 0), 0);
    if (totalTimeCost > expectedTimeLimit * 60) {
      warnings.push(`${caseId}: Time Inconsistency - Total investigation time (${totalTimeCost} min) exceeds expected time limit (${expectedTimeLimit} min)`);
    }
  }
  
  // 5. Treatment Path Checks
  if (caseItem.correctDiagnosis && caseItem.correctTreatment) {
    const treatmentSequence = caseItem.correctTreatment.sequence || [];
    treatmentSequence.forEach((treatment, tIndex) => {
      if (!isTreatmentAppropriate(caseItem.correctDiagnosis, treatment.description || treatment.action || '')) {
        errors.push(`${caseId}: Treatment Path Error - Diagnosis "${caseItem.correctDiagnosis}" has inappropriate treatment: "${treatment.description || treatment.action}"`);
      }
    });
  }
  
  // 6. Missing Required Fields
  if (!caseItem.id) {
    errors.push(`Case at index ${index}: Missing ID`);
  }
  if (!caseItem.title) {
    errors.push(`${caseId}: Missing Title`);
  }
  if (!caseItem.difficulty) {
    errors.push(`${caseId}: Missing Difficulty`);
  }
  if (!caseItem.correctDiagnosis) {
    errors.push(`${caseId}: Missing Correct Diagnosis`);
  }
  if (!caseItem.initialVitals) {
    errors.push(`${caseId}: Missing Initial Vitals`);
  }
  if (!caseItem.patientProfile) {
    errors.push(`${caseId}: Missing Patient Profile`);
  }
  if (!caseItem.patientProfile?.chiefComplaint) {
    warnings.push(`${caseId}: Missing Chief Complaint`);
  }
  
  // 7. Check for duplicate IDs
  const duplicateIds = cases.filter(c => c.id === caseItem.id);
  if (duplicateIds.length > 1) {
    errors.push(`${caseId}: Duplicate ID - Found ${duplicateIds.length} cases with the same ID`);
  }
});

// Print results
console.log('\n=== Medical Logic Validation Results ===\n');
console.log(`Total cases checked: ${cases.length}\n`);

if (errors.length > 0) {
  console.log(`❌ ERRORS (${errors.length}):`);
  errors.forEach(error => console.log(`  - ${error}`));
  console.log('');
} else {
  console.log('✅ No errors found!\n');
}

if (warnings.length > 0) {
  console.log(`⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach(warning => console.log(`  - ${warning}`));
  console.log('');
} else {
  console.log('✅ No warnings found!\n');
}

// Exit with error code if there are errors
if (errors.length > 0) {
  console.log('❌ Validation failed. Please fix the errors before deploying.');
  process.exit(1);
} else {
  console.log('✅ All cases passed validation!');
  process.exit(0);
}

