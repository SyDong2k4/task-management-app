import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const BoardCard = styled(Link)`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: 1.5rem;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: ${props => props.theme.transitions.fast};
  border: 1px solid ${props => props.theme.colors.border};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BoardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const CreateBoardCard = styled.button`
  background: ${props => props.theme.colors.background};
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.lg};
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  color: ${props => props.theme.colors.textSecondary};
  gap: 0.5rem;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: white;
  }
`;

const BoardList = ({ boards, onOpenCreateModal }) => {
    return (
        <Grid>
            {boards.map(board => (
                <BoardCard key={board._id} to={`/board/${board._id}`}>
                    <BoardTitle>{board.title}</BoardTitle>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Owner: {board.owner?.username}
                    </span>
                </BoardCard>
            ))}
            <CreateBoardCard onClick={onOpenCreateModal}>
                <FaPlus size={24} />
                <span>Create New Board</span>
            </CreateBoardCard>
        </Grid>
    );
};

export default BoardList;
