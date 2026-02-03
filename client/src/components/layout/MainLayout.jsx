import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const MainLayout = () => {
    return (
        <LayoutContainer>
            <Navbar />
            <Content>
                <Outlet />
            </Content>
        </LayoutContainer>
    );
};

export default MainLayout;
