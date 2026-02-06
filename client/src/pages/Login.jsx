import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input, InputGroup, Label } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';



const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login, error: authError } = useAuth();
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
            navigate('/dashboard');
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-pink-500 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-10 rounded-xl shadow-lg w-full max-w-md animate-fadeIn border border-slate-200 dark:border-slate-700">
                <h1 className="text-center mb-8 text-slate-800 dark:text-slate-100 font-bold text-2xl">Welcome Back</h1>
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

                    <Button type="submit" fullWidth disabled={isLoading} className="mt-4">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>

                    <Link
                        to="/register"
                        className="block text-center mt-4 text-sm text-slate-500 hover:text-indigo-500 transition-colors"
                    >
                        Don't have an account? Sign up
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default Login;
