import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import boardService from '../services/boardService';
import useBoardSocket from '../hooks/useBoardSocket';

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.background};
`;

const BoardHeader = styled.div`
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

const Canvas = styled.div`
  flex: 1;
  overflow-x: auto;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
`;

const Board = () => {
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleBoardUpdate = (updatedBoard) => {
        setBoard(updatedBoard);
    };

    const handleCardMoved = (data) => {
        console.log('Card moved:', data);
        // We will implement state update logic later when we have the full board structure
        // For now, re-fetching or simple log is enough to verify socket
    };

    useBoardSocket(boardId, {
        'card:moved': handleCardMoved
    });

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const data = await boardService.getBoardById(boardId);
                setBoard(data);
            } catch (error) {
                console.error("Failed to fetch board", error);
            } finally {
                setLoading(false);
            }
        };

        if (boardId) {
            fetchBoard();
        }
    }, [boardId]);

    if (loading) return <div>Loading board...</div>;
    if (!board) return <div>Board not found</div>;

    return (
        <Container>
            <BoardHeader>
                <Title>{board.title}</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981'
                    }} />
                    Live
                </div>
            </BoardHeader>
            <Canvas>
                {/* Columns will go here */}
                <div>Columns placeholder</div>
            </Canvas>
        </Container>
    );
};

export default Board;
