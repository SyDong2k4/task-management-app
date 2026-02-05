import React from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CardContainer = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.sm};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  border: 1px solid transparent;

  /* Sortable styles */
  transform: ${props => props.transform};
  transition: ${props => props.transition};
  opacity: ${props => props.isDragging ? 0.5 : 1};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
`;

const Card = ({ card }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: card._id, data: { ...card, type: 'card' } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <CardContainer
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            transform={style.transform}
            transition={style.transition}
            isDragging={isDragging}
        >
            <CardTitle>{card.title}</CardTitle>
        </CardContainer>
    );
};

export default Card;
