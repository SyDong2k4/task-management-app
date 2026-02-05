import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? props.theme.colors.success : props.theme.colors.error};
`;

const BoardHeader = ({ board, connected = false }) => {
    return (
        <HeaderContainer>
            <Title>{board?.title}</Title>
            <StatusBadge>
                <LiveDot connected={connected} />
                {connected ? 'Live' : 'Disconnected'}
            </StatusBadge>
        </HeaderContainer>
    );
};

export default BoardHeader;
