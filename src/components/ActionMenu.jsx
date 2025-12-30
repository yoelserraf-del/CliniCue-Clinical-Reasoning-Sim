import { useState } from 'react';
import { TestTube, Pill, Stethoscope, CheckCircle, Search, X, FlaskConical, Activity, Heart, Brain, ClipboardList } from 'lucide-react';
import testLibrary from '../data/TestLibrary.json';

const ActionMenu = ({ 
  investigations, 
  onOrderTest, 
  onGiveMedication, 
  onConsultSpecialist,
  onPhysicalExam,
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
    const caseTest = investigations.find(inv => inv.id === testId);
    if (caseTest) return caseTest;
    const libraryTest = testLibrary.find(t => t.id === testId);
    return libraryTest;
  };

  const isTestOrdered = (testId) => {
    return orderedTests.some(t => t.id === testId);
  };

  const isTreatmentGiven = (treatment) => {
    return givenTreatments.some(t => t === treatment);
  };

  const getTestIcon = (category) => {
    if (category.includes('Lab')) return <FlaskConical className="w-4 h-4" />;
    if (category.includes('Imaging')) return <Activity className="w-4 h-4" />;
    if (category.includes('Cardiac')) return <Heart className="w-4 h-4" />;
    if (category.includes('Assessment')) return <Stethoscope className="w-4 h-4" />;
    return <TestTube className="w-4 h-4" />;
  };

  return (
    <div className="w-full lg:w-96 bg-slate-900 lg:border-l border-slate-700/50 overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Clinical Actions</h2>
          <p className="text-sm text-slate-400">Perform exams, order tests, make diagnoses, and provide treatment</p>
        </div>

        {/* [Physical Exam] */}
        <div className="card rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">[Physical Exam]</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onPhysicalExam && onPhysicalExam('auscultation')}
              className="p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 card-hover"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Auscultation</span>
            </button>
            <button
              onClick={() => onPhysicalExam && onPhysicalExam('palpation')}
              className="p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 card-hover"
            >
              <Activity className="w-4 h-4" />
              <span>Palpation</span>
            </button>
            <button
              onClick={() => onPhysicalExam && onPhysicalExam('neurological')}
              className="p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 card-hover"
            >
              <Brain className="w-4 h-4" />
              <span>Neurological</span>
            </button>
            <button
              onClick={() => onPhysicalExam && onPhysicalExam('cardiac')}
              className="p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 card-hover"
            >
              <Heart className="w-4 h-4" />
              <span>Cardiac</span>
            </button>
          </div>
        </div>

        {/* [Order Labs/Imaging] */}
        {(currentState === 'investigation' || currentState === 'triage') && (
          <div className="card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">[Order Labs/Imaging]</h3>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tests List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
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
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        ordered
                          ? 'bg-slate-800/50 border-green-500/50 cursor-not-allowed opacity-60'
                          : 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:bg-slate-800/80 cursor-pointer card-hover'
                      }`}
                      title={test.description}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-0.5 ${ordered ? 'text-green-400' : 'text-blue-400'}`}>
                            {getTestIcon(test.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm mb-1">{test.name}</div>
                            <div className="text-xs text-slate-400 mb-2">
                              {test.category} • {test.timeCost} min
                            </div>
                            {test.description && (
                              <div className="text-xs text-slate-500 line-clamp-2">
                                {test.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {ordered && (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* [Differential Diagnosis] */}
        {currentState === 'diagnosis' && (
          <div className="card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">[Differential Diagnosis]</h3>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-300">
                Review all findings and select the most likely diagnosis from the center panel.
              </p>
            </div>
            <button
              onClick={() => {
                // Diagnosis selection is handled in the center panel (DiagnosisSelection component)
                // This button can scroll to it or show a message
                const diagnosisPanel = document.querySelector('[data-diagnosis-panel]');
                if (diagnosisPanel) {
                  diagnosisPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="w-full p-4 rounded-lg border border-orange-500/50 bg-orange-500/10 hover:border-orange-500 hover:bg-orange-500/20 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 card-hover"
            >
              <ClipboardList className="w-4 h-4" />
              <span>View Diagnosis Options</span>
            </button>
          </div>
        )}

        {/* [Treatments] */}
        {currentState === 'treatment' && (
          <div className="card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">[Treatments]</h3>
            </div>
            {availableTreatments.length > 0 ? (
              <div className="space-y-2">
                {availableTreatments.map((treatment) => (
                  <ActionButton
                    key={treatment.action}
                    label={treatment.label || treatment.description}
                    action={treatment.action}
                    icon={<Pill className="w-4 h-4" />}
                    onClick={() => onGiveMedication(treatment.action)}
                    completed={isTreatmentGiven(treatment.action)}
                    medication={treatment.medication}
                  />
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-sm text-center py-8">
                No treatment options available.
              </div>
            )}
          </div>
        )}

        {/* Consultation */}
        <div className="card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Consultation</h3>
          </div>
          <button
            onClick={onConsultSpecialist}
            className="w-full p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 card-hover"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Consult Specialist</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick, completed, medication }) => (
  <button
    onClick={onClick}
    disabled={completed}
    className={`w-full text-left p-4 rounded-lg border transition-all ${
      completed
        ? 'bg-slate-800/50 border-green-500/50 cursor-not-allowed opacity-60'
        : 'bg-slate-800 border-slate-700 hover:border-green-500 hover:bg-slate-800/80 cursor-pointer card-hover'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1">
        <div className={completed ? 'text-green-400' : 'text-green-400'}>
          {icon}
        </div>
        <div className="flex-1">
          <span className="text-white text-sm font-semibold">{label}</span>
          {medication && (
            <div className="text-xs text-slate-400 mt-1">{medication}</div>
          )}
        </div>
      </div>
      {completed && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
    </div>
  </button>
);

export default ActionMenu;
