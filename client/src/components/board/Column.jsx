import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';
import ColumnHeader from './ColumnHeader';
import boardService from '../../services/boardService';



const Column = ({ column, canEdit = true, onCardAdded, onCardClick, filterQuery }) => {
    const { boardId } = useParams();
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column._id, data: { ...column, type: 'column' }, disabled: !canEdit });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const normalizedQuery = (filterQuery || '').trim().toLowerCase();

    const filteredCards = useMemo(() => {
        if (!normalizedQuery) return column.cards || [];
        return (column.cards || []).filter((card) => {
            const title = card.title || '';
            const description = card.description || '';
            return (
                title.toLowerCase().includes(normalizedQuery) ||
                description.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [column.cards, normalizedQuery]);

    const cardIds = useMemo(
        () => filteredCards.map((c) => c._id),
        [filteredCards]
    );

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;

        try {
            setLoading(true);
            const newCard = await boardService.createCard(boardId, {
                title: newCardTitle,
                columnId: column._id
            });
            if (onCardAdded) onCardAdded(newCard);
            setNewCardTitle('');
            setShowAddCard(false);
        } catch (error) {
            console.error("Failed to add card", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`min-w-[280px] w-[280px] bg-slate-100/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col max-h-full transition-transform ${isDragging ? 'opacity-50 scale-[0.98]' : 'hover:-translate-y-[1px]'}`}
        >
            {/* Pass listeners to Header if we want drag handle there only. 
                 But simplifying: make header handle drag. */}
            <div {...listeners}>
                <ColumnHeader title={column.title} tasksCount={column.cards?.length || 0} columnId={column._id} canEdit={canEdit} />
            </div>

            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="p-2 flex-1 overflow-y-auto min-h-[50px] space-y-2">
                    {filteredCards.map((card) => (
                        <Card key={card._id} card={card} canEdit={canEdit} onClick={() => onCardClick && onCardClick(card)} />
                    ))}
                </div>
            </SortableContext>

            {canEdit && showAddCard ? (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 rounded-b-2xl">
                    <form onSubmit={handleAddCard}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter a title for this card..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            className="w-full p-2 rounded-md border border-slate-300 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                        />
                        <div className="flex gap-2 items-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-500 text-white border-none px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-indigo-600"
                            >
                                {loading ? 'Adding...' : 'Add Card'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddCard(false)}
                                className="bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-800 text-sm"
                            >
                                X
                            </button>
                        </div>
                    </form>
                </div>
            ) : canEdit ? (
                <button
                    className="bg-transparent border-none text-slate-500 p-3 text-left cursor-pointer rounded-b-2xl text-sm hover:bg-slate-200/80 hover:text-slate-800 transition-colors w-full"
                    onClick={() => setShowAddCard(true)}
                >
                    + Add a card
                </button>
            ) : null}
        </div>
    );
};

export default Column;
