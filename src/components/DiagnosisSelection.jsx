import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const DiagnosisSelection = ({ possibleDiagnoses, correctDiagnosis, onSelect, selectedDiagnosis }) => {
  const [showResult, setShowResult] = useState(false);

  const handleDiagnosisSelect = (diagnosis) => {
    if (selectedDiagnosis) return; // Already selected
    
    onSelect(diagnosis);
    setShowResult(true);
    
    // Auto-advance after showing result
    setTimeout(() => {
      // Result is handled in parent component
    }, 2000);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Select Your Diagnosis</h2>
      <p className="text-gray-400 mb-6">
        Based on the patient's presentation, vital signs, and test results, what is your diagnosis?
      </p>
      
      <div className="space-y-3">
        {possibleDiagnoses.map((diagnosis, index) => {
          const isSelected = selectedDiagnosis === diagnosis;
          const isCorrect = diagnosis === correctDiagnosis;
          const showFeedback = showResult && isSelected;
          
          return (
            <button
              key={index}
              onClick={() => !selectedDiagnosis && handleDiagnosisSelect(diagnosis)}
              disabled={selectedDiagnosis}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                showFeedback
                  ? isCorrect
                    ? 'bg-green-900/30 border-green-500'
                    : 'bg-red-900/30 border-red-500'
                  : isSelected
                  ? 'bg-blue-900/30 border-blue-500'
                  : 'bg-gray-900 border-gray-600 hover:border-blue-500 hover:bg-gray-900/80'
              } ${selectedDiagnosis && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{diagnosis}</span>
                {showFeedback && (
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-semibold">Incorrect</span>
                      </>
                    )}
                  </div>
                )}
                {isSelected && !showFeedback && (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {showResult && selectedDiagnosis && (
        <div className={`mt-4 p-4 rounded-lg ${
          selectedDiagnosis === correctDiagnosis 
            ? 'bg-green-900/30 border border-green-500' 
            : 'bg-red-900/30 border border-red-500'
        }`}>
          <p className={`font-semibold ${
            selectedDiagnosis === correctDiagnosis ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedDiagnosis === correctDiagnosis 
              ? '✓ Correct diagnosis! You may proceed to treatment.'
              : `✗ Incorrect. The correct diagnosis is: ${correctDiagnosis}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DiagnosisSelection;

