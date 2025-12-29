import { TestTube, Pill, Stethoscope, CheckCircle, XCircle } from 'lucide-react';

const ActionMenu = ({ 
  investigations, 
  onOrderTest, 
  onGiveMedication, 
  onConsultSpecialist,
  orderedTests,
  givenTreatments,
  currentState,
  availableTreatments = []
}) => {
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
          <div className="space-y-2">
            {investigations.map((test) => {
              const ordered = isTestOrdered(test.id);
              return (
                <button
                  key={test.id}
                  onClick={() => !ordered && onOrderTest(test)}
                  disabled={ordered}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    ordered
                      ? 'bg-gray-700/50 border-green-500/50 cursor-not-allowed'
                      : 'bg-gray-900 border-gray-600 hover:border-blue-500 hover:bg-gray-900/80 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{test.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Time: {test.timeCost} min
                      </div>
                    </div>
                    {ordered && (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
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
