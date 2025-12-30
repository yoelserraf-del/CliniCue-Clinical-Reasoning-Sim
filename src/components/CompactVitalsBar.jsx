import { Heart, Droplets, Wind, Thermometer, Activity } from 'lucide-react';

const CompactVitalsBar = ({ vitals, stability }) => {
  if (!vitals) return null;

  const getStabilityColor = () => {
    if (stability >= 80) return 'text-green-400';
    if (stability >= 60) return 'text-yellow-400';
    if (stability >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="grid grid-cols-5 gap-2 items-center">
        {/* Heart Rate */}
        <div className="flex flex-col items-center">
          <Heart className="w-4 h-4 text-red-400 mb-1" />
          <span className="text-xs font-mono text-white">{vitals.hr}</span>
          <span className="text-[10px] text-slate-400">HR</span>
        </div>

        {/* Blood Pressure */}
        <div className="flex flex-col items-center">
          <Droplets className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-xs font-mono text-white">{vitals.bp}</span>
          <span className="text-[10px] text-slate-400">BP</span>
        </div>

        {/* SpO2 */}
        <div className="flex flex-col items-center">
          <Activity className="w-4 h-4 text-green-400 mb-1" />
          <span className="text-xs font-mono text-white">{vitals.spo2}%</span>
          <span className="text-[10px] text-slate-400">SpO2</span>
        </div>

        {/* Temperature */}
        <div className="flex flex-col items-center">
          <Thermometer className="w-4 h-4 text-orange-400 mb-1" />
          <span className="text-xs font-mono text-white">
            {typeof vitals.temp === 'number' ? vitals.temp.toFixed(1) : vitals.temp}°
          </span>
          <span className="text-[10px] text-slate-400">Temp</span>
        </div>

        {/* Stability */}
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full mb-1 ${
            stability >= 80 ? 'bg-green-500' :
            stability >= 60 ? 'bg-yellow-500' :
            stability >= 40 ? 'bg-orange-500' :
            'bg-red-500'
          }`} />
          <span className={`text-xs font-mono ${getStabilityColor()}`}>
            {Math.round(stability)}%
          </span>
          <span className="text-[10px] text-slate-400">Stable</span>
        </div>
      </div>
    </div>
  );
};

export default CompactVitalsBar;


