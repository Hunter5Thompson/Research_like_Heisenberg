import React from 'react';
import { Paper } from '../types';
import { Plus, Check, FileText, Trash2 } from 'lucide-react';

interface Props {
  paper: Omit<Paper, 'id' | 'physicist'> | Paper;
  isCollected: boolean;
  onCollect?: () => void;
  onRemove?: () => void;
}

export const PaperCard: React.FC<Props> = ({ paper, isCollected, onCollect, onRemove }) => {
  return (
    <div className={`
      group p-5 rounded-lg border transition-all duration-300 flex flex-col justify-between h-full
      ${isCollected 
        ? 'bg-slate-800/50 border-emerald-500/30 shadow-lg' 
        : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'}
    `}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-md bg-slate-900 text-slate-300">
            <FileText size={20} />
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
            {paper.year}
          </span>
        </div>
        <h4 className="text-lg font-semibold text-slate-100 mb-2 leading-tight group-hover:text-blue-300 transition-colors">
          {paper.title}
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          {paper.description}
        </p>
      </div>

      <div className="mt-auto pt-4">
        {onRemove ? (
          <button
            onClick={onRemove}
            className="w-full py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all bg-slate-700/50 text-slate-400 hover:bg-red-950/50 hover:text-red-400 border border-transparent hover:border-red-900/50"
          >
            <Trash2 size={16} /> Remove
          </button>
        ) : onCollect && (
          <button
            onClick={onCollect}
            disabled={isCollected}
            className={`
              w-full py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all
              ${isCollected
                ? 'bg-emerald-900/30 text-emerald-400 cursor-default'
                : 'bg-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white'}
            `}
          >
            {isCollected ? (
              <>
                <Check size={16} /> Collected
              </>
            ) : (
              <>
                <Plus size={16} /> Add to Collection
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};