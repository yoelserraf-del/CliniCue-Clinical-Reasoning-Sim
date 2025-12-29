import { FileText, Image as ImageIcon, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const ExaminationRoom = ({ investigations, testResults, orderedTests, currentTime, difficulty, onViewExplanation, physicalExamFindings = [] }) => {
  const getTestStatus = (testId) => {
    const ordered = orderedTests.find(t => t.id === testId);
    if (!ordered) return 'not_ordered';
    const completedResult = testResults.find(r => r.id === testId);
    if (completedResult) return 'completed';
    if (currentTime >= ordered.orderedAt + ordered.timeCost) return 'completed';
    return 'pending';
  };

  const getTestResult = (testId) => {
    return testResults.find(r => r.id === testId);
  };

  const formatResult = (result) => {
    if (typeof result === 'string') {
      return <p className="text-slate-900">{result}</p>;
    }
    if (typeof result === 'object' && result !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex justify-between py-2 border-b border-slate-200 last:border-0">
              <span className="font-semibold text-slate-700 capitalize">{key}:</span>
              <span className="text-slate-900">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-slate-900">{String(result)}</p>;
  };

  // Show all tests that have been ordered (from case investigations or test library)
  const displayedTests = orderedTests.map(orderedTest => {
    const caseTest = investigations.find(inv => inv.id === orderedTest.id);
    if (caseTest) return caseTest;
    return {
      id: orderedTest.id,
      name: orderedTest.name || `Test ${orderedTest.id}`,
      timeCost: orderedTest.timeCost
    };
  });

  return (
    <div className="flex-1 bg-slate-900 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">The Clinical Workspace</h2>
          <p className="text-slate-400 text-sm">Review physical exam findings, test results, and imaging studies</p>
        </div>

        {/* Physical Exam Findings */}
        {physicalExamFindings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Physical Examination Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {physicalExamFindings.map((exam, idx) => (
                <div key={idx} className="card rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white capitalize">{exam.type} Exam</h4>
                  </div>
                  <ul className="space-y-2">
                    {exam.findings.map((finding, fIdx) => (
                      <li key={fIdx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Laboratory & Imaging Results */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Laboratory & Imaging Results</h3>
        </div>

        {displayedTests.length === 0 ? (
          <div className="card rounded-xl p-16 text-center border-2 border-dashed border-slate-700/50">
            <FileText className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <p className="text-slate-400 text-xl mb-2">No test results yet</p>
            <p className="text-slate-500 text-sm">Order tests from the action menu to view results</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedTests.map((investigation) => {
              const status = getTestStatus(investigation.id);
              const testResult = getTestResult(investigation.id);
              const isImage = investigation.id.includes('xray') || investigation.id.includes('ct') || investigation.id.includes('ctpa');

              return (
                <div
                  key={investigation.id}
                  className="card rounded-xl p-6 card-hover"
                >
                  {/* Test Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isImage ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {isImage ? (
                          <ImageIcon className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{investigation.name}</h3>
                        {investigation.timeCost && (
                          <p className="text-sm text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time: {investigation.timeCost} minutes
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                      status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                    }`}>
                      {status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      ) : status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Pending</span>
                        </div>
                      ) : (
                        'Not Ordered'
                      )}
                    </div>
                  </div>

                  {/* Test Results - Table Style */}
                  {status === 'completed' && testResult && (
                    <div className="mt-6">
                      <div className={`bg-white rounded-xl p-6 border-2 ${
                        testResult.isGeneric ? 'border-yellow-500/50 bg-yellow-50/50' : 'border-slate-200'
                      }`}>
                        {testResult.isGeneric && (
                          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                              <span>⚠️</span>
                              <span>This test was ordered but is not directly relevant to this case.</span>
                            </p>
                          </div>
                        )}
                        <div className="mb-4 pb-4 border-b border-slate-200">
                          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                            Results
                          </h4>
                          <div className="text-slate-900">
                            {formatResult(testResult.result)}
                          </div>
                        </div>
                        {testResult.interpretation && (
                          <div className="pt-4 border-t border-slate-200">
                            {difficulty === 'student' || difficulty === 'highschool' ? (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-blue-900 font-medium flex items-start gap-2">
                                  <span>💡</span>
                                  <span><strong>Interpretation:</strong> {testResult.interpretation}</span>
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs text-slate-500 italic mb-3">
                                  Manual interpretation required for {difficulty} level
                                </p>
                                <button
                                  onClick={() => onViewExplanation && onViewExplanation()}
                                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold underline flex items-center gap-2"
                                >
                                  <span>📚</span>
                                  <span>View interpretation (affects score)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pending Status */}
                  {status === 'pending' && (
                    <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-sm text-yellow-400 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Test in progress... Estimated completion: {investigation.timeCost || 0} minutes</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationRoom;
