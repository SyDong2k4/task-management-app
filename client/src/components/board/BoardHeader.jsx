import React from 'react';

const BoardHeader = ({ board, connected = false }) => {
  return (
    <div className="px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-t-2xl shadow-sm transition-colors">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{board?.title}</h1>
        {board?.description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{board.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`} />
        {connected ? 'Live collaboration' : 'Disconnected'}
      </div>
    </div>
  );
};

export default BoardHeader;
