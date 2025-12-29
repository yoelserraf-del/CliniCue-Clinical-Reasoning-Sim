import { useState } from 'react';
import { TestTube, Pill, Stethoscope, CheckCircle, Search, X } from 'lucide-react';
import testLibrary from '../data/TestLibrary.json';

const ActionMenu = ({ 
  investigations, 
  onOrderTest, 
  onGiveMedication, 
  onConsultSpecialist,
  orderedTests,
  givenTreatments,
  currentState,
  availableTreatments = [],
  difficulty = 'student'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Map difficulty from case to test library format
  const difficultyMap = {
    'highschool': 'highschool',
    'premed': 'premed',
    'student': 'student',
    'resident': 'resident'
  };
  const mappedDifficulty = difficultyMap[difficulty] || 'student';

  // Filter tests by difficulty
  const availableTests = testLibrary.filter(test => 
    test.availableAtDifficulty.includes(mappedDifficulty)
  );

  // Get unique categories
  const categories = ['all', ...new Set(availableTests.map(t => t.category))];

  // Filter tests by search and category
  const filteredTests = availableTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Merge with case-specific investigations (for results)
  const getTestData = (testId) => {
    // First check if it's in the case investigations (has results)
    const caseTest = investigations.find(inv => inv.id === testId);
    if (caseTest) return caseTest;
    
    // Otherwise use library test
    const libraryTest = testLibrary.find(t => t.id === testId);
    return libraryTest;
  };

  const isTestOrdered = (testId) => {
    return orderedTests.some(t => t.id === testId);
  };

  const isTreatmentGiven = (treatment) => {
    return givenTreatments.some(t => t === treatment);
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Action Menu</h2>
        <p className="text-sm text-gray-400 mt-1">Select actions to manage the patient</p>
      </div>

      {/* Order Tests */}
      {(currentState === 'investigation' || currentState === 'triage') && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Order Tests</h3>
          </div>

          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests..."
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
          <div className="mb-3">
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

          {/* Tests List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTests.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No tests found matching your search.
              </div>
            ) : (
              filteredTests.map((test) => {
                const ordered = isTestOrdered(test.id);
                const testData = getTestData(test.id);
                return (
                  <button
                    key={test.id}
                    onClick={() => !ordered && onOrderTest(testData || test)}
                    disabled={ordered}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      ordered
                        ? 'bg-gray-700/50 border-green-500/50 cursor-not-allowed'
                        : 'bg-gray-900 border-gray-600 hover:border-blue-500 hover:bg-gray-900/80 cursor-pointer'
                    }`}
                    title={test.description}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{test.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {test.category} • {test.timeCost} min
                        </div>
                        {test.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {test.description}
                          </div>
                        )}
                      </div>
                      {ordered && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Treatment Actions */}
      {currentState === 'treatment' && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">Treatment Options</h3>
          </div>
          {availableTreatments.length > 0 ? (
            <div className="space-y-2">
              {availableTreatments.map((treatment) => (
                <ActionButton
                  key={treatment.action}
                  label={treatment.label || treatment.description}
                  action={treatment.action}
                  icon={treatment.icon || <Pill className="w-4 h-4" />}
                  onClick={() => onGiveMedication(treatment.action)}
                  completed={isTreatmentGiven(treatment.action)}
                  medication={treatment.medication}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              No treatment options available. Check case configuration.
            </div>
          )}
        </div>
      )}

      {/* Consultation */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Consultation</h3>
        </div>
        <button
          onClick={onConsultSpecialist}
          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-900 hover:border-purple-500 hover:bg-gray-900/80 transition-all text-white text-sm font-medium"
        >
          Consult Specialist
        </button>
      </div>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick, completed, medication }) => (
  <button
    onClick={onClick}
    disabled={completed}
    className={`w-full text-left p-3 rounded-lg border transition-all ${
      completed
        ? 'bg-gray-700/50 border-green-500/50 cursor-not-allowed'
        : 'bg-gray-900 border-gray-600 hover:border-green-500 hover:bg-gray-900/80 cursor-pointer'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white text-sm font-medium">{label}</span>
        </div>
        {medication && (
          <div className="text-xs text-gray-400 mt-1 ml-6">{medication}</div>
        )}
      </div>
      {completed && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
    </div>
  </button>
);

export default ActionMenu;
