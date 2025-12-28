import { User, FileText, Calendar } from 'lucide-react';

const LeftSidebar = ({ patientProfile, nursingNotes, difficulty }) => {
  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      {/* Patient Profile */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{patientProfile.name}</h2>
            <p className="text-sm text-gray-400">
              {patientProfile.age} years old, {patientProfile.sex}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Chief Complaint</span>
            </div>
            <p className="text-white text-sm">{patientProfile.chiefComplaint}</p>
          </div>
        </div>
      </div>

      {/* Past Medical History */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Past Medical History</h3>
        <ul className="space-y-2">
          {patientProfile.pastMedicalHistory.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Presenting Symptoms */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Presenting Symptoms</h3>
        <ul className="space-y-2">
          {patientProfile.presentingSymptoms.map((symptom, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Nursing Notes */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase">Clinical Notes</h3>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {nursingNotes}
          </p>
          {difficulty === 'student' && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-yellow-400 font-medium">💡 Hint: Focus on the most prominent clinical findings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
