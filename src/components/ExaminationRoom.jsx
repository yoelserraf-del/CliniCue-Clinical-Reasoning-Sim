import { FileText, Image as ImageIcon, Clock } from 'lucide-react';

const ExaminationRoom = ({ investigations, testResults, orderedTests, currentTime, difficulty, onViewExplanation }) => {
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
      return <p className="text-white">{result}</p>;
    }
    if (typeof result === 'object' && result !== null) {
      return (
        <div className="space-y-1">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-medium text-gray-400 capitalize">{key}:</span>{' '}
              <span className="text-white">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-white">{String(result)}</p>;
  };

  // Show all investigations that have been ordered or completed
  const displayedTests = investigations.filter(inv => {
    const ordered = orderedTests.find(t => t.id === inv.id);
    return ordered !== undefined;
  });

  return (
    <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Examination Room</h2>
          <p className="text-gray-400 text-sm">Review test results and imaging studies</p>
        </div>

        {displayedTests.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No test results yet</p>
            <p className="text-gray-500 text-sm mt-2">Order tests from the action menu to view results</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedTests.map((investigation) => {
              const status = getTestStatus(investigation.id);
              const testResult = getTestResult(investigation.id);
              const isImage = investigation.id.includes('xray') || investigation.id.includes('ct') || investigation.id.includes('ctpa');

              return (
                <div
                  key={investigation.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {isImage ? (
                        <ImageIcon className="w-6 h-6 text-blue-400" />
                      ) : (
                        <FileText className="w-6 h-6 text-green-400" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{investigation.name}</h3>
                        {investigation.timeCost && (
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Time cost: {investigation.timeCost} minutes
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {status === 'completed' ? 'Completed' : status === 'pending' ? 'Pending' : 'Not Ordered'}
                    </span>
                  </div>

                  {status === 'completed' && testResult && (
                    <div className="mt-4">
                      <div className="bg-gray-900 rounded p-4 border border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Results:</h4>
                        <div className="text-white text-sm space-y-2">
                          {formatResult(testResult.result)}
                        </div>
                        {difficulty !== 'student' && investigation.interpretation && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-500 italic">
                              Note: Manual interpretation required for {difficulty} level
                            </p>
                          </div>
                        )}
                        {difficulty === 'student' && investigation.interpretation && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-blue-300 font-medium">
                              💡 Interpretation: {investigation.interpretation}
                            </p>
                          </div>
                        )}
                        {difficulty !== 'student' && investigation.interpretation && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <button
                              onClick={() => onViewExplanation && onViewExplanation()}
                              className="text-sm text-purple-400 hover:text-purple-300 font-medium underline"
                            >
                              📚 Click to view interpretation (affects score)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                      <p className="text-sm text-yellow-400">
                        ⏳ Test in progress... Estimated completion: {investigation.timeCost || 0} minutes
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
