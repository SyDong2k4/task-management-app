

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import boardService from '../../services/boardService';

const Card = ({ card }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card._id, data: { ...card, type: 'card' } });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  // Update local title if prop changes (e.g. from socket)
  React.useEffect(() => {
    setTitle(card.title);
  }, [card.title]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleSave = async (e) => {
    if (e && e.type === 'keydown' && (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      // Save logic
      try {
        if (title !== card.title) {
          await boardService.updateCard(card._id, { title });
        }
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update card", error);
      }
    }
  };

  const handleBlur = async () => {
    try {
      if (title !== card.title) {
        await boardService.updateCard(card._id, { title });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update card", error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent drag start if possible, though button is inside
    if (window.confirm("Delete this card?")) {
      try {
        await boardService.deleteCard(card._id);
      } catch (error) {
        console.error("Failed to delete card", error);
      }
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm p-3 mb-2 cursor-pointer transition border border-slate-200 dark:border-slate-700 relative ${isDragging ? 'opacity-50' : ''}`}
      >
        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleSave}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()} // Stop drag
          className="w-full border border-slate-300 rounded p-1 font-inherit text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-900 group rounded-xl shadow-sm p-3 cursor-pointer transition border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary/80 relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <h4 className="m-0 text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight break-words">
        {card.title}
      </h4>
      {!isDragging && (
        <div className="flex gap-1 absolute top-2 right-2">
          <button
            className="bg-transparent border-none cursor-pointer p-1 rounded text-slate-500 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            ✎
          </button>
          <button
            className="bg-transparent border-none cursor-pointer p-1 rounded text-slate-500 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            onClick={handleDelete}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;
