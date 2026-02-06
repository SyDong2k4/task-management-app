

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import boardService from '../../services/boardService';

const ColumnHeader = ({ title, tasksCount, columnId }) => {
  const { boardId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = async (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;

    if (newTitle.trim() !== title) {
      try {
        await boardService.updateColumn(boardId, columnId, { title: newTitle });
      } catch (error) {
        console.error("Failed to rename column", error);
        setNewTitle(title);
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await boardService.deleteColumn(boardId, columnId);
      } catch (error) {
        console.error("Failed to delete column", error);
      }
    }
  };

  return (
    <div className="p-4 font-semibold text-slate-800 flex justify-between items-center cursor-grab active:cursor-grabbing relative group">
      {isEditing ? (
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleRename}
          className="flex-1 p-1 border border-slate-300 rounded text-base font-semibold w-full"
        />
      ) : (
        <div
          className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {title}
        </div>
      )}

      <div className="text-xs text-slate-500 mx-2">{tasksCount}</div>

      <div className="opacity-100 relative" ref={menuRef}>
        <button
          className="bg-transparent border-none cursor-pointer p-1 rounded text-slate-500 hover:bg-black/10 hover:text-slate-800"
          onClick={() => setShowMenu(!showMenu)}
        >
          •••
        </button>
        {showMenu && (
          <div className="absolute top-full right-0 bg-white rounded shadow-lg z-10 min-w-[120px] overflow-hidden border border-slate-200">
            <div
              className="px-4 py-2 cursor-pointer text-sm hover:bg-slate-100 text-slate-700"
              onClick={() => { setIsEditing(true); setShowMenu(false); }}
            >
              Rename
            </div>
            <div
              className="px-4 py-2 cursor-pointer text-sm hover:bg-red-50 text-red-500"
              onClick={handleDelete}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnHeader;
