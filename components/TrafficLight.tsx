import React from 'react';
import { HealthStatus } from '../types';

interface TrafficLightProps {
  status: HealthStatus;
}

const TrafficLight: React.FC<TrafficLightProps> = ({ status }) => {
  const isHealthy = status === HealthStatus.HEALTHY;
  const isCaution = status === HealthStatus.CAUTION;
  const isUnhealthy = status === HealthStatus.UNHEALTHY;

  return (
    <div className="relative">
      {/* Paw Container */}
      <div className="bg-slate-800 p-4 rounded-[3rem] flex flex-col gap-4 shadow-xl border-4 border-slate-700 w-24 sm:w-28 items-center relative z-10">
        
        {/* Red Light */}
        <div className="relative">
             <div
            className={`w-16 h-16 rounded-full transition-all duration-700 border-4 border-slate-900 ${
              isUnhealthy
                ? 'bg-red-500 shadow-[0_0_20px_2px_rgba(239,68,68,0.8)] scale-105'
                : 'bg-red-950 opacity-40'
            }`}
          />
           {isUnhealthy && <span className="absolute -left-8 top-4 text-2xl animate-bounce">❌</span>}
        </div>
       
        {/* Yellow Light */}
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-full transition-all duration-700 border-4 border-slate-900 ${
              isCaution
                ? 'bg-yellow-400 shadow-[0_0_20px_2px_rgba(250,204,21,0.8)] scale-105'
                : 'bg-yellow-900 opacity-40'
            }`}
          />
           {isCaution && <span className="absolute -left-8 top-4 text-2xl animate-bounce">⚠️</span>}
        </div>

        {/* Green Light */}
        <div className="relative">
           <div
            className={`w-16 h-16 rounded-full transition-all duration-700 border-4 border-slate-900 ${
              isHealthy
                ? 'bg-green-500 shadow-[0_0_20px_2px_rgba(34,197,94,0.8)] scale-105'
                : 'bg-green-950 opacity-40'
            }`}
          />
          {isHealthy && <span className="absolute -left-8 top-4 text-2xl animate-bounce">✅</span>}
        </div>
      </div>
      
      {/* Cat Ear Decorations for the Traffic Light Box */}
      <div className="absolute -top-4 -left-2 w-10 h-10 bg-slate-800 rounded-tl-xl rotate-12 z-0 border-l-4 border-t-4 border-slate-700"></div>
      <div className="absolute -top-4 -right-2 w-10 h-10 bg-slate-800 rounded-tr-xl -rotate-12 z-0 border-r-4 border-t-4 border-slate-700"></div>
    </div>
  );
};

export default TrafficLight;