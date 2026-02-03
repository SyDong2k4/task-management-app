import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BoardList from '../components/dashboard/BoardList';
import CreateBoardModal from '../components/dashboard/CreateBoardModal';
import boardService from '../services/boardService';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const data = await boardService.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error("Failed to fetch boards", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBoardCreated = (newBoard) => {
        setBoards([...boards, newBoard]);
    };

    return (
        <Container>
            <Header>
                <Title>Your Boards</Title>
                <Subtitle>Select a board to start working</Subtitle>
            </Header>

            {loading ? (
                <div>Loading boards...</div>
            ) : (
                <BoardList
                    boards={boards}
                    onOpenCreateModal={() => setIsModalOpen(true)}
                />
            )}

            <CreateBoardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBoardCreated={handleBoardCreated}
            />
        </Container>
    );
};

export default Dashboard;
