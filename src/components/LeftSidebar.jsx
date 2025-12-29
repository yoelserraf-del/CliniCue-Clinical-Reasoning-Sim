import { User, FileText, Calendar, AlertCircle } from 'lucide-react';

const LeftSidebar = ({ patientProfile, nursingNotes, difficulty }) => {
  return (
    <div className="w-full lg:w-96 bg-slate-900 lg:border-r border-slate-700/50 overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Patient Profile Card */}
        <div className="card rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{patientProfile.name}</h2>
              <p className="text-sm text-slate-400">
                {patientProfile.age} years old, {patientProfile.sex}
              </p>
            </div>
          </div>

          {/* Chief Complaint - Bold and Larger */}
          <div className="mb-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Chief Complaint</span>
            </div>
            <p className="text-lg font-bold text-white leading-relaxed">
              {patientProfile.chiefComplaint}
            </p>
          </div>
        </div>

        {/* Past Medical History Card */}
        <div className="card rounded-xl p-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Past Medical History
          </h3>
          <ul className="space-y-3">
            {patientProfile.pastMedicalHistory.map((item, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                <span className="text-blue-400 mt-1.5 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Presenting Symptoms Card */}
        <div className="card rounded-xl p-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Presenting Symptoms
          </h3>
          <ul className="space-y-3">
            {patientProfile.presentingSymptoms.map((symptom, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                <span className="text-red-400 mt-1.5 font-bold">•</span>
                <span className="leading-relaxed">{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical Notes Card */}
        <div className="card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Clinical Notes
            </h3>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {nursingNotes}
            </p>
            {difficulty === 'student' || difficulty === 'highschool' && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-yellow-400 font-medium flex items-center gap-2">
                  <span>💡</span>
                  <span>Focus on the most prominent clinical findings</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
