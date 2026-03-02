import React from 'react';
import { FaCog, FaSearch } from 'react-icons/fa';
import BoardMembers from './BoardMembers';

const BoardHeader = ({
  board,
  connected = false,
  onMembersChange,
  searchQuery,
  onSearchChange,
  searchInputRef,
  onOpenSettings,
}) => {
  const canManageBoard = board?.currentUserRole === 'admin';

  return (
    <div className="px-4 md:px-6 py-3 md:py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-t-2xl shadow-sm transition-colors">
      <div className="flex items-start gap-3 flex-shrink-0">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
            {board?.title}
          </h1>
          {board?.description && (
            <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
              {board.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search cards ( / )"
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-xs md:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          {canManageBoard && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FaCog size={10} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-4 justify-between md:justify-end w-full">
          <BoardMembers board={board} onMembersChange={onMembersChange} />
          <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
