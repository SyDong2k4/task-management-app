import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend runs on different port/url
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors (e.g. 401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token might be invalid or expired
            localStorage.removeItem('token');
            // window.location.href = '/login'; // Optional: Redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
