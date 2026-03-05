import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                const redirect = searchParams.get('redirect') || '/';
                navigate(redirect);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 50%, #e3f2fd 100%)',
            padding: '1rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: '#f8fafb',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                padding: '48px 40px 36px',
                textAlign: 'center',
            }}>
                {/* Logo Circle */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#80cbc4',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M18 4 L26 28 L18 22 L10 28 Z" fill="#1e293b" />
                        <path d="M18 4 L14 18 L22 18 Z" fill="#1e293b" opacity="0.7" />
                    </svg>
                </div>

                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px',
                    letterSpacing: '-0.5px',
                }}>
                    Welcome to NUCLEUS
                </h1>
                <p style={{
                    color: '#64748b',
                    fontSize: '15px',
                    marginBottom: '32px',
                }}>
                    {isSignUp ? 'Create your account' : 'Sign in to continue'}
                </p>

                {error && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '10px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        color: '#dc2626',
                        fontSize: '13px',
                    }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '10px 14px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '10px',
                        color: '#059669',
                        fontSize: '13px',
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#334155',
                                marginBottom: '6px',
                            }}>Full Name</label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '0 14px',
                            }}>
                                <User size={18} color="#94a3b8" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    style={{
                                        flex: 1,
                                        padding: '12px 10px',
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '15px',
                                        color: '#1e293b',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#334155',
                            marginBottom: '6px',
                        }}>Email</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0 14px',
                        }}>
                            <Mail size={18} color="#94a3b8" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{
                                    flex: 1,
                                    padding: '12px 10px',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '15px',
                                    color: '#1e293b',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#334155',
                            marginBottom: '6px',
                        }}>Password</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0 14px',
                        }}>
                            <Lock size={18} color="#94a3b8" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                style={{
                                    flex: 1,
                                    padding: '12px 10px',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '15px',
                                    color: '#1e293b',
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Sign in'}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                }}>
                    <button
                        onClick={() => { }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        Forgot password?
                    </button>
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        {isSignUp ? 'Have an account? ' : 'Need an account? '}
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
