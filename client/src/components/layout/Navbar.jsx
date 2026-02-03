import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { FaSignOutAlt, FaUserCircle, FaColumns } from 'react-icons/fa';

const Nav = styled.nav`
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: ${props => props.theme.colors.primaryHover};
    text-decoration: none;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Nav>
            <Logo to="/dashboard">
                <FaColumns /> KanbanFlow
            </Logo>
            <UserMenu>
                <UserInfo>
                    <FaUserCircle size={20} />
                    {user?.username}
                </UserInfo>
                <Button onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <FaSignOutAlt style={{ marginRight: '0.5rem' }} /> Logout
                </Button>
            </UserMenu>
        </Nav>
    );
};

export default Navbar;
