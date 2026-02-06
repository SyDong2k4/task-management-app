import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input, InputGroup, Label } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';



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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-pink-500 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-10 rounded-xl shadow-lg w-full max-w-md animate-fadeIn border border-slate-200 dark:border-slate-700">
                <h1 className="text-center mb-8 text-slate-800 dark:text-slate-100 font-bold text-2xl">Create Account</h1>
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

                    <Button type="submit" fullWidth disabled={isLoading} className="mt-4">
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>

                    <Link
                        to="/login"
                        className="block text-center mt-4 text-sm text-slate-500 hover:text-indigo-500 transition-colors"
                    >
                        Already have an account? Login
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default Register;
