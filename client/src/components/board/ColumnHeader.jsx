import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  padding: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const Title = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Actions = styled.div`
  opacity: 0;
  transition: opacity 0.2s;
  
  ${HeaderContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${props => props.theme.radii.sm};
  color: ${props => props.theme.colors.textSecondary};
  
  &:hover {
    background-color: rgba(0,0,0,0.1);
    color: ${props => props.theme.colors.text};
  }
`;

const ColumnHeader = ({ title, tasksCount }) => {
    return (
        <HeaderContainer>
            <Title>{title}</Title>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>{tasksCount}</div>
            <Actions>
                <ActionButton>•••</ActionButton>
            </Actions>
        </HeaderContainer>
    );
};

export default ColumnHeader;
