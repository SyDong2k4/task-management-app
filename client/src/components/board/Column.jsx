import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';
import ColumnHeader from './ColumnHeader';
import boardService from '../../services/boardService';

const ColumnContainer = styled.div`
  min-width: 280px;
  width: 280px;
  background-color: #f1f5f9;
  border-radius: ${props => props.theme.radii.md};
  display: flex;
  flex-direction: column;
  max-height: 100%;
  
  /* Sortable styles */
  transform: ${props => props.transform};
  transition: ${props => props.transition};
  opacity: ${props => props.isDragging ? 0.5 : 1};
`;

const CardList = styled.div`
  padding: 0 0.5rem 0.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 50px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
  }
`;

const AddCardButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.75rem;
  text-align: left;
  cursor: pointer;
  border-radius: 0 0 ${props => props.theme.radii.md} ${props => props.theme.radii.md};
  font-size: 0.875rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e2e8f0;
    color: ${props => props.theme.colors.text};
  }
`;

const Column = ({ column }) => {
    const { boardId } = useParams();
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Sortable for the Column itself
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column._id, data: { ...column, type: 'column' } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const cardIds = useMemo(() => column.cards?.map(c => c._id) || [], [column.cards]);

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;

        try {
            setLoading(true);
            await boardService.createCard(boardId, {
                title: newCardTitle,
                columnId: column._id
            });
            setNewCardTitle('');
            setShowAddCard(false);
            // Socket will handle the update via board:updated or card:created
        } catch (error) {
            console.error("Failed to add card", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ColumnContainer
            ref={setNodeRef}
            style={style}
            {...attributes} // Attributes for drag handle, if we want whole column draggable
            // For now, let's make whole column draggable only from header maybe?
            // Currently applying to container.
            transform={style.transform}
            transition={style.transition}
            isDragging={isDragging}
        >
            {/* Pass listeners to Header if we want drag handle there only. 
                 But simplifying: make header handle drag. */}
            <div {...listeners}>
                <ColumnHeader title={column.title} tasksCount={column.cards?.length || 0} />
            </div>

            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <CardList>
                    {column.cards && column.cards.map(card => (
                        <Card key={card._id} card={card} />
                    ))}
                </CardList>
            </SortableContext>

            {showAddCard ? (
                <div style={{ padding: '0.5rem' }}>
                    <form onSubmit={handleAddCard}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter a title for this card..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #e2e8f0',
                                marginBottom: '0.5rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    backgroundColor: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? 'Adding...' : 'Add Card'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddCard(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                X
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <AddCardButton onClick={() => setShowAddCard(true)}>+ Add a card</AddCardButton>
            )}
        </ColumnContainer>
    );
};

export default Column;
