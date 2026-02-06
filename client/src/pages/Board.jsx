import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
    DndContext,
    closestCorners,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import boardService from '../services/boardService';
import useBoardSocket from '../hooks/useBoardSocket';
import Column from '../components/board/Column';
import Card from '../components/board/Card'; // Import for Overlay
import BoardHeader from '../components/board/BoardHeader';
import { useSocket } from '../context/SocketContext';
import { boardReducer } from '../reducers/boardReducer';

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

const Board = () => {
    const { boardId } = useParams();
    const [board, dispatch] = useReducer(boardReducer, { columns: [] }); // Init with object
    const [loading, setLoading] = useState(true);
    const socket = useSocket();
    const [connected, setConnected] = useState(false);

    // Add Column State
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [columnLoading, setColumnLoading] = useState(false);

    // DnD State
    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor)
    );

    useEffect(() => {
        if (!socket) {
            setConnected(false);
            return;
        }

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (socket.connected) {
            setConnected(true);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [socket]);

    const socketHandlers = useMemo(() => ({
        'card:created': (newCard) => dispatch({ type: 'ADD_CARD', payload: newCard }),
        'card:updated': (updatedCard) => dispatch({ type: 'UPDATE_CARD', payload: updatedCard }),
        'card:moved': ({ card, oldColumnId }) => {
            dispatch({
                type: 'MOVE_CARD',
                payload: {
                    cardId: card._id,
                    sourceColumnId: oldColumnId,
                    destColumnId: card.columnId,
                    destIndex: card.order ?? 0 // Default to 0 if order invalid
                }
            });
        },
        'card:deleted': (cardId) => {
            dispatch({ type: 'DELETE_CARD', payload: cardId });
        },
        'column:created': (newColumn) => dispatch({ type: 'ADD_COLUMN', payload: newColumn }),
        'column:updated': (updatedColumn) => dispatch({ type: 'UPDATE_COLUMN', payload: updatedColumn }),
        'column:deleted': (columnId) => dispatch({ type: 'DELETE_COLUMN', payload: columnId }),
        'column:reordered': (columnIds) => dispatch({ type: 'REORDER_COLUMNS', payload: { newOrder: columnIds } })
    }), []);

    useBoardSocket(boardId, socketHandlers);

    const fetchBoard = async () => {
        try {
            const data = await boardService.getBoardById(boardId);
            dispatch({ type: 'SET_BOARD', payload: data });
        } catch (error) {
            console.error("Failed to fetch board", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (boardId) {
            fetchBoard();
        }
    }, [boardId]);

    const handleAddColumn = async (e) => {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;

        try {
            setColumnLoading(true);
            const newColumn = await boardService.createColumn(boardId, { title: newColumnTitle });
            dispatch({ type: 'ADD_COLUMN', payload: newColumn });
            setNewColumnTitle('');
            setShowAddColumn(false);
        } catch (error) {
            console.error("Failed to add column", error);
        } finally {
            setColumnLoading(false);
        }
    };

    // DnD Handlers
    const onDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setActiveItem(active.data.current);
    };

    const onDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveCard = active.data.current?.type === 'card';
        const isOverCard = over.data.current?.type === 'card';
        const isOverColumn = over.data.current?.type === 'column';

        if (!isActiveCard) return;

        // Card over Card
        if (isActiveCard && isOverCard) {
            const activeCard = active.data.current;
            const overCard = over.data.current;

            if (activeCard && overCard && activeCard.columnId !== overCard.columnId) {
                // Different column -> move logic (optimistic)
                // We actually change state in `onDragOver` for smoothness
                const activeColumnId = activeCard.columnId;
                const overColumnId = overCard.columnId;

                dispatch({
                    type: 'MOVE_CARD',
                    payload: {
                        cardId: activeId,
                        sourceColumnId: activeColumnId,
                        destColumnId: overColumnId,
                        destIndex: over.data.current.sortable.index // Approximate
                    }
                });

                // Update active item data to reflect new column
                active.data.current.columnId = overColumnId;
            }
        }

        // Card over Column (Empty column handling)
        if (isActiveCard && isOverColumn) {
            const activeCard = active.data.current;
            const overColumnId = overId;

            if (activeCard.columnId !== overColumnId) {
                dispatch({
                    type: 'MOVE_CARD',
                    payload: {
                        cardId: activeId,
                        sourceColumnId: activeCard.columnId,
                        destColumnId: overColumnId,
                        destIndex: 0 // Add to top or bottom? 0 is fine
                    }
                });
                active.data.current.columnId = overColumnId;
            }
        }
    };

    const onDragEnd = async (event) => {
        const { active, over } = event;

        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeType = active.data.current?.type;

        if (activeType === 'column') {
            // Reorder columns
            const oldIndex = board.columns.findIndex(c => c._id === activeId);
            const newIndex = board.columns.findIndex(c => c._id === overId);

            if (oldIndex !== newIndex) {
                const newColumnsOrder = arrayMove(board.columns, oldIndex, newIndex);
                const newOrderIds = newColumnsOrder.map(c => c._id);

                // Optimistic update
                dispatch({
                    type: 'REORDER_COLUMNS',
                    payload: { newOrder: newOrderIds }
                });

                // API call
                try {
                    await boardService.reorderColumns(boardId, newOrderIds);
                } catch (err) {
                    console.error("Failed to reorder columns", err);
                    // Revert? fetchBoard()
                    fetchBoard();
                }
            }
        }
        else if (activeType === 'card') {
            // Card moved
            // The state is likely already updated by onDragOver for cross-column moves
            // But for reordering within same column, we need to handle it here
            const activeCard = active.data.current;
            const overCard = over.data.current;

            // If dropped on a card in same column
            if (overCard && activeCard.columnId === overCard.columnId) {
                const column = board.columns.find(c => c._id === activeCard.columnId);
                if (column) {
                    const oldIndex = column.cards.findIndex(c => c._id === activeId);
                    const newIndex = column.cards.findIndex(c => c._id === overId);

                    if (oldIndex !== newIndex) {
                        // Dispatch move internal
                        dispatch({
                            type: 'MOVE_CARD',
                            payload: {
                                cardId: activeId,
                                sourceColumnId: column._id,
                                destColumnId: column._id,
                                destIndex: newIndex
                            }
                        });

                        // API Call
                        await boardService.moveCard(activeId, {
                            columnId: column._id,
                            order: newIndex
                        });
                    }
                }
            }
            // If dropped on different column (already handled visually by DragOver, but need API call)
            else {
                // We need to persist the change calculated in DragOver
                // BUT: DragOver changes state. activeCard.columnId might be stale?
                // No, active.data.current was mutated? No.
                // We need to find where the card ended up.

                // Find which column has the card now
                const destCol = board.columns.find(c => c.cards.some(card => card._id === activeId));
                if (destCol) {
                    const destIndex = destCol.cards.findIndex(c => c._id === activeId);

                    await boardService.moveCard(activeId, {
                        columnId: destCol._id,
                        order: destIndex
                    });
                }
            }
        }
    };

    if (loading) return <div>Loading board...</div>;
    if (!board) return <div>Board not found</div>;

    const columnIds = board.columns ? board.columns.map(c => c._id) : [];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div
                className="min-h-[70vh] flex flex-col bg-cover overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-md bg-slate-50/60 dark:bg-slate-900/60 transition-colors"
                style={{ backgroundColor: board.background || undefined }}
            >
                <BoardHeader board={board} connected={connected} />
                <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex items-start gap-4 sm:gap-6 h-full">
                    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                        {board.columns && board.columns.map(column => (
                            <Column
                                key={column._id}
                                column={column}
                                onCardAdded={(card) => dispatch({ type: 'ADD_CARD', payload: card })}
                            />
                        ))}
                    </SortableContext>

                    <div style={{ minWidth: '280px' }}>
                        {showAddColumn ? (
                            <div className="bg-slate-100/80 p-3 rounded-2xl flex flex-col gap-2 border border-slate-200/80 shadow-sm">
                                <form onSubmit={handleAddColumn}>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Enter list title..."
                                        value={newColumnTitle}
                                        onChange={(e) => setNewColumnTitle(e.target.value)}
                                        className="w-full p-2 rounded-md border border-slate-300 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                                    />
                                    <div className="flex gap-2 items-center">
                                        <button
                                            type="submit"
                                            disabled={columnLoading}
                                            className="bg-indigo-500 text-white border-none px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-indigo-600"
                                        >
                                            {columnLoading ? 'Adding...' : 'Add List'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddColumn(false)}
                                            className="bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-800 text-sm"
                                        >
                                            X
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <button
                                className="min-w-[280px] p-4 bg-black/10 hover:bg-black/20 text-slate-600 hover:text-slate-900 text-left rounded-2xl font-medium transition-colors border border-black/5"
                                onClick={() => setShowAddColumn(true)}
                            >
                                + Add another list
                            </button>
                        )}
                    </div>
                </div>
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? (
                        activeItem.type === 'column' ? (
                            <div style={{ opacity: 0.8 }}>
                                <Column column={activeItem} />
                            </div>
                        ) : (
                            <Card card={activeItem} />
                        )
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default Board;
