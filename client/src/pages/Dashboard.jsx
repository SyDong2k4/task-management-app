import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <Container>
            <Header>
                <h1>Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Welcome, {user?.username}</span>
                    <Button onClick={logout}>Logout</Button>
                </div>
            </Header>
            <div>
                <p>Your boards will appear here.</p>
            </div>
        </Container>
    );
};

export default Dashboard;
