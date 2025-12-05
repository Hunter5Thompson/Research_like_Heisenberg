import React from 'react';
import { PhysicistName } from '../types';
import { Atom, Zap, Waves, Infinity as InfinityIcon } from 'lucide-react';

interface Props {
  selected: PhysicistName | null;
  onSelect: (name: PhysicistName) => void;
}

export const PhysicistSelector: React.FC<Props> = ({ selected, onSelect }) => {
  const physicists = [
    { name: PhysicistName.Heisenberg, icon: <Atom className="w-6 h-6" />, color: "text-blue-400", border: "hover:border-blue-500" },
    { name: PhysicistName.Pauli, icon: <Zap className="w-6 h-6" />, color: "text-purple-400", border: "hover:border-purple-500" },
    { name: PhysicistName.Schrodinger, icon: <Waves className="w-6 h-6" />, color: "text-orange-400", border: "hover:border-orange-500" },
    { name: PhysicistName.Dirac, icon: <InfinityIcon className="w-6 h-6" />, color: "text-emerald-400", border: "hover:border-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {physicists.map((phys) => (
        <button
          key={phys.name}
          onClick={() => onSelect(phys.name)}
          className={`
            relative p-6 rounded-xl border-2 transition-all duration-300 flex items-center gap-4
            ${selected === phys.name 
              ? `bg-slate-800 border-current ${phys.color} shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
              : `bg-slate-900 border-slate-700 text-slate-400 ${phys.border} hover:bg-slate-800`}
          `}
        >
          <div className={`${selected === phys.name ? phys.color : "text-slate-500"}`}>
            {phys.icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg leading-tight">{phys.name.split(' ')[1]}</h3>
            <p className="text-[10px] opacity-60 uppercase tracking-wider">Pioneer</p>
          </div>
          {selected === phys.name && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};