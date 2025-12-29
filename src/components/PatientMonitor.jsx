import { Activity, Heart, Thermometer, Droplets, Wind, Clock, AlertTriangle } from 'lucide-react';
import ECGMonitor from './ECGMonitor';
import { getTimeRemaining, getTimeWarning } from '../utils/timeManager';

const PatientMonitor = ({ vitals, stability, difficulty, realTimeElapsed, timeLimit, timeLimitEnabled }) => {
  const getVitalColor = (type) => {
    if (difficulty === 'student' || difficulty === 'highschool') {
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
          return 'text-slate-300';
      }
    }
    return 'text-slate-300';
  };

  const getStabilityColor = () => {
    if (stability >= 80) return 'bg-green-500';
    if (stability >= 60) return 'bg-yellow-500';
    if (stability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStabilityTextColor = () => {
    if (stability >= 80) return 'text-green-400';
    if (stability >= 60) return 'text-yellow-400';
    if (stability >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700/50 w-full">
      <div className="max-w-[1920px] mx-auto px-8 py-6">
        {/* Control Center Header */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Patient Monitoring System
          </h2>
          
          {/* ECG Monitor Frame */}
          <div className="card rounded-xl p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">ECG Monitor</span>
              <span className="text-xs text-slate-500">HR: {vitals?.hr || 70} bpm</span>
            </div>
            <div className="h-24 bg-black rounded-lg overflow-hidden relative border border-slate-800">
              <ECGMonitor heartRate={vitals?.hr || 70} height={96} />
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <VitalCard
              icon={<Heart className="w-5 h-5" />}
              label="Heart Rate"
              value={`${vitals.hr}`}
              unit="bpm"
              color={getVitalColor('hr')}
            />
            <VitalCard
              icon={<Droplets className="w-5 h-5" />}
              label="Blood Pressure"
              value={vitals.bp}
              unit=""
              color={getVitalColor('bp')}
            />
            <VitalCard
              icon={<Wind className="w-5 h-5" />}
              label="Respiratory Rate"
              value={`${vitals.rr}`}
              unit="/min"
              color={getVitalColor('rr')}
            />
            <VitalCard
              icon={<Activity className="w-5 h-5" />}
              label="SpO₂"
              value={`${vitals.spo2}`}
              unit="%"
              color={getVitalColor('spo2')}
            />
            <VitalCard
              icon={<Thermometer className="w-5 h-5" />}
              label="Temperature"
              value={typeof vitals.temp === 'number' ? vitals.temp.toFixed(1) : vitals.temp}
              unit="°C"
              color={getVitalColor('temp')}
            />
          </div>

          {/* Time Limit & Stability */}
          <div className={`grid gap-4 ${timeLimitEnabled && timeLimit ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Time Limit */}
            {timeLimitEnabled && timeLimit && realTimeElapsed !== undefined && (
              <div className="card rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                      Time Remaining
                    </span>
                  </div>
                  <span className={`text-2xl font-bold font-mono ${
                    timeLimit && realTimeElapsed !== undefined && getTimeWarning(timeLimit, realTimeElapsed) === 'critical' ? 'text-red-400' :
                    timeLimit && realTimeElapsed !== undefined && getTimeWarning(timeLimit, realTimeElapsed) === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {timeLimit && realTimeElapsed !== undefined ? getTimeRemaining(timeLimit, realTimeElapsed) : '--'}m
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-500 ${
                      timeLimit && realTimeElapsed !== undefined && getTimeWarning(timeLimit, realTimeElapsed) === 'critical' ? 'bg-red-500' :
                      timeLimit && realTimeElapsed !== undefined && getTimeWarning(timeLimit, realTimeElapsed) === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    } rounded-full`}
                    style={{ width: timeLimit && realTimeElapsed !== undefined ? `${(getTimeRemaining(timeLimit, realTimeElapsed) / timeLimit) * 100}%` : '100%' }}
                  ></div>
                </div>
                {timeLimit && realTimeElapsed !== undefined && getTimeWarning(timeLimit, realTimeElapsed) === 'critical' && (
                  <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical: Patient condition deteriorating</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Stability Progress Bar */}
            <div className="card rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                  <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Patient Stability
                  </span>
                </div>
                <span className={`text-2xl font-bold ${getStabilityTextColor()}`}>
                  {stability.toFixed(0)}%
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-700 ease-out ${getStabilityColor()} rounded-full`}
                  style={{ width: `${stability}%` }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VitalCard = ({ icon, label, value, unit, color }) => (
  <div className="card rounded-xl p-6 card-hover">
    <div className="flex items-center justify-between mb-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={color}>{icon}</div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-3xl font-bold font-mono ${color}`}>{value}</span>
      {unit && <span className={`text-lg font-medium ${color} opacity-70`}>{unit}</span>}
    </div>
  </div>
);

export default PatientMonitor;
