import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input, InputGroup, Label } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  padding: 1rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: ${props => props.theme.radii.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
  font-weight: 700;
`;

const StyledLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login, error: authError } = useAuth(); // Assume auth context handles global errors too, or simplified
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLocalError('');
        try {
            await login(formData);
            navigate('/dashboard'); // Redirect after login
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Card>
                <Title>Welcome Back</Title>
                <form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </InputGroup>

                    {(localError || authError) && <ErrorMessage>{localError || authError}</ErrorMessage>}

                    <Button type="submit" fullWidth disabled={isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>

                    <StyledLink to="/register">Don't have an account? Sign up</StyledLink>
                </form>
            </Card>
        </Container>
    );
};

export default Login;
