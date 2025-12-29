import { X, BookOpen, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const ScienceDebrief = ({ caseData, isOpen, onClose, performance }) => {
  if (!isOpen || !caseData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Science Debrief</h2>
              <p className="text-sm text-gray-400">{caseData.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Performance Summary */}
        {performance && (
          <div className="p-6 bg-gray-900/50 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Performance Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Final Stability</div>
                <div className={`text-2xl font-bold ${
                  performance.finalStability >= 80 ? 'text-green-400' :
                  performance.finalStability >= 60 ? 'text-yellow-400' :
                  performance.finalStability >= 40 ? 'text-orange-400' :
                  'text-red-500'
                }`}>
                  {performance.finalStability}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Time to Treatment</div>
                <div className="text-2xl font-bold text-white">
                  {performance.timeToTreatment} min
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Correct Diagnosis</div>
                <div className={`text-2xl font-bold ${
                  performance.correctDiagnosis ? 'text-green-400' : 'text-red-400'
                }`}>
                  {performance.correctDiagnosis ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Pathophysiology */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Pathophysiology & Science Bridge</h3>
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                className="text-gray-300 leading-relaxed"
              >
                {caseData.scienceBridge.pathophysiology}
              </ReactMarkdown>
            </div>
          </div>

          {/* Key Learning Points */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-bold text-white mb-4">Key Learning Points</h3>
            <ul className="space-y-3">
              {caseData.scienceBridge.keyLearningPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Treatment */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Expected Treatment Sequence</h3>
            <div className="space-y-3">
              {caseData.correctTreatment.sequence.map((step, idx) => (
                <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{step.description}</div>
                      {step.medication && (
                        <div className="text-sm text-blue-400 mt-1">
                          Medication: {step.medication}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Expected Outcome:</strong> {caseData.correctTreatment.expectedOutcome}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScienceDebrief;
