import { useState } from 'react';
import { CheckCircle, XCircle, Search, X } from 'lucide-react';
import diagnosisLibrary from '../data/DiagnosisLibrary.json';

const DiagnosisSelection = ({ possibleDiagnoses, correctDiagnosis, onSelect, selectedDiagnosis, difficulty = 'student' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Map difficulty from case to diagnosis library format
  const difficultyMap = {
    'highschool': 'highschool',
    'premed': 'premed',
    'student': 'student',
    'resident': 'resident'
  };
  const mappedDifficulty = difficultyMap[difficulty] || 'student';

  // Filter diagnoses by difficulty
  const availableDiagnoses = diagnosisLibrary.filter(diag => 
    diag.availableAtDifficulty.includes(mappedDifficulty)
  );

  // Get unique categories
  const categories = ['all', ...new Set(availableDiagnoses.map(d => d.category))];

  // Filter diagnoses by search and category
  const filteredDiagnoses = availableDiagnoses.filter(diag => {
    const matchesSearch = diag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diag.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || diag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Make a Diagnosis</h2>
      <p className="text-gray-400 mb-6">Select the most likely diagnosis based on your findings.</p>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search diagnoses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Diagnoses List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredDiagnoses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No diagnoses found matching your search.
          </div>
        ) : (
          filteredDiagnoses.map((diagnosis, index) => {
            const diagnosisName = diagnosis.name;
            const isSelected = selectedDiagnosis === diagnosisName;
            const isCorrect = diagnosisName === correctDiagnosis;
            
            return (
              <button
                key={index}
                onClick={() => onSelect(diagnosisName)}
                disabled={!!selectedDiagnosis}
                className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between ${
                  isSelected
                    ? (isCorrect ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500')
                    : 'bg-gray-900 border-gray-600 hover:border-blue-500 hover:bg-gray-900/80 cursor-pointer'
                } ${selectedDiagnosis ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex-1">
                  <span className="font-medium text-white text-lg">{diagnosisName}</span>
                  <div className="text-xs text-gray-400 mt-1">{diagnosis.category}</div>
                </div>
                {isSelected && (
                  isCorrect
                    ? <CheckCircle className="w-6 h-6 text-green-400" />
                    : <XCircle className="w-6 h-6 text-red-400" />
                )}
              </button>
            );
          })
        )}
      </div>

      {selectedDiagnosis && (
        <div className={`mt-6 p-4 rounded-lg ${
          selectedDiagnosis === correctDiagnosis 
            ? 'bg-green-900/20 border border-green-500/30' 
            : 'bg-red-900/20 border border-red-500/30'
        }`}>
          <p className={`font-semibold ${
            selectedDiagnosis === correctDiagnosis ? 'text-green-300' : 'text-red-300'
          }`}>
            {selectedDiagnosis === correctDiagnosis ? '✓ Correct Diagnosis!' : '✗ Incorrect Diagnosis.'}
          </p>
          {selectedDiagnosis !== correctDiagnosis && (
            <p className="text-sm text-gray-400 mt-2">
              An incorrect diagnosis will affect your final score. Review the case and try to understand why this was not the best choice.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosisSelection;
