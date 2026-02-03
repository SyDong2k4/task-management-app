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
  max-width: 450px;
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

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Card>
                <Title>Create Account</Title>
                <form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Username</Label>
                        <Input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </InputGroup>
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
                    <InputGroup>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </InputGroup>

                    {localError && <ErrorMessage>{localError}</ErrorMessage>}

                    <Button type="submit" fullWidth disabled={isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>

                    <StyledLink to="/login">Already have an account? Login</StyledLink>
                </form>
            </Card>
        </Container>
    );
};

export default Register;
