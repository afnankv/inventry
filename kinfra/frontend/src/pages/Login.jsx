import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!email || !password) {
            setFormError('Please fill in all fields.');
            return;
        }
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setFormError(result.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1 className='h1'>Kinfra</h1>
                </div>
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to your account to continue</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {formError && <div className="error-banner">{formError}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn-danger" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup">Create</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
