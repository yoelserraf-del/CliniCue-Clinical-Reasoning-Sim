import { Activity, Heart, Thermometer, Droplets, Wind } from 'lucide-react';
import ECGMonitor from './ECGMonitor';

const PatientMonitor = ({ vitals, stability, difficulty }) => {
  const getVitalColor = (type) => {
    if (difficulty === 'student') {
      // Color-coded for students
      switch (type) {
        case 'hr':
          return vitals.hr > 100 ? 'text-red-400' : vitals.hr < 60 ? 'text-yellow-400' : 'text-green-400';
        case 'bp':
          const systolic = parseInt(vitals.bp.split('/')[0]);
          return systolic > 140 ? 'text-yellow-400' : systolic < 90 ? 'text-red-400' : 'text-green-400';
        case 'spo2':
          return vitals.spo2 < 95 ? 'text-red-400' : vitals.spo2 < 98 ? 'text-yellow-400' : 'text-green-400';
        case 'temp':
          return vitals.temp > 37.5 ? 'text-red-400' : vitals.temp < 36.0 ? 'text-yellow-400' : 'text-green-400';
        case 'rr':
          return vitals.rr > 20 ? 'text-red-400' : vitals.rr < 12 ? 'text-yellow-400' : 'text-green-400';
        default:
          return 'text-gray-300';
      }
    }
    return 'text-gray-300'; // Raw values for resident/attending
  };

  const getStabilityBarColor = () => {
    if (stability >= 80) return 'bg-green-500';
    if (stability >= 60) return 'bg-yellow-500';
    if (stability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStabilityTextColor = () => {
    if (stability >= 80) return 'text-green-500';
    if (stability >= 60) return 'text-yellow-500';
    if (stability >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 w-full">
      {/* ECG Monitor */}
      <div className="h-16 bg-black rounded mb-4 overflow-hidden relative w-full" style={{ width: '100%' }}>
        <ECGMonitor heartRate={vitals?.hr || 70} height={64} />
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <VitalCard
          icon={<Heart className="w-6 h-6" />}
          label="HR"
          value={`${vitals.hr} bpm`}
          color={getVitalColor('hr')}
        />
        <VitalCard
          icon={<Droplets className="w-6 h-6" />}
          label="BP"
          value={vitals.bp}
          color={getVitalColor('bp')}
        />
        <VitalCard
          icon={<Wind className="w-6 h-6" />}
          label="RR"
          value={`${vitals.rr} /min`}
          color={getVitalColor('rr')}
        />
        <VitalCard
          icon={<Activity className="w-6 h-6" />}
          label="SpO₂"
          value={`${vitals.spo2}%`}
          color={getVitalColor('spo2')}
        />
        <VitalCard
          icon={<Thermometer className="w-6 h-6" />}
          label="Temp"
          value={`${vitals.temp}°C`}
          color={getVitalColor('temp')}
        />
      </div>

      {/* Stability Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-400">Patient Stability</span>
          <span className={`text-lg font-bold ${getStabilityTextColor()}`}>
            {stability.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getStabilityBarColor()}`}
            style={{ width: `${stability}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const VitalCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <div className="text-gray-400 text-xs font-medium">{label}</div>
      {icon}
    </div>
    <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
  </div>
);

export default PatientMonitor;
