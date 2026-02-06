import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const BoardList = ({ boards, onOpenCreateModal }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-4">
      {boards.map(board => (
        <Link
          key={board._id}
          to={`/board/${board._id}`}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 h-[140px] flex flex-col justify-between transition border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md hover:border-primary"
        >
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{board.title}</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Owner: {board.owner?.username}
          </span>
        </Link>
      ))}
      <button
        onClick={onOpenCreateModal}
        className="w-full bg-slate-50/80 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl h-[140px] flex flex-col items-center justify-center cursor-pointer transition text-slate-500 dark:text-slate-300 gap-2 hover:border-primary hover:text-primary hover:bg-white dark:hover:bg-slate-900"
      >
        <FaPlus size={24} />
        <span className="font-medium">Create New Board</span>
      </button>
    </div>
  );
};

export default BoardList;
