import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleHover, setGoogleHover] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        try {
            setError('');
            setMessage('');
            setLoading(true);
            const { error, data } = await signUp(email, password);
            if (error) throw error;

            if (data?.user && data?.session === null) {
                setMessage('Account created! Please check your email for verification.');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        page: {
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
        },
        brandSection: {
            flex: '1.2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end', // Align items to the right
            textAlign: 'right',     // Align text to the right
            padding: '4rem',
            paddingRight: '8rem',   // Extra padding to account for diagonal cut
            background: 'linear-gradient(135deg, #b2f0c4ff 0%, #e1fee9 100%)', // Mint Gradient
        },
        rightSection: {
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Center the card
            padding: '2rem',
            backgroundColor: '#ffffff',
        },
        // The Dark Floating Card
        loginCard: {
            backgroundColor: '#12151A', // App Dark Mode Background
            padding: '3rem',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            color: 'white',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
        },
        logoIcon: {
            width: '48px',
            height: '48px',
            objectFit: 'contain'
        },
        brandName: {
            fontFamily: "'Roboto', sans-serif",
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
        },
        heroHeadline: {
            fontSize: '4rem', // Bigger headline
            fontWeight: '800',
            color: '#0aac35',
            lineHeight: '1.1',
            marginBottom: '1rem',
        },
        heroSub: {
            fontSize: '1.1rem',
            color: '#555',
            maxWidth: '500px',
            lineHeight: '1.6',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: 'white',
        },
        subtitle: {
            marginBottom: '2rem',
            color: '#aaa',
            fontSize: '0.95rem',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        },
        label: {
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#ccc',
            marginLeft: '4px',
        },
        input: {
            padding: '1rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'white', // White inputs on dark card
            color: '#333',
            fontSize: '1rem',
            outline: 'none',
            fontWeight: '500',
            transition: 'all 0.2s',
        },
        button: {
            padding: '1rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#0aac35', // Green button
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem',
            transition: 'opacity 0.2s, transform 0.1s',
            boxShadow: '0 4px 12px rgba(10, 172, 53, 0.4)',
        },
        googleButton: {
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #333',
            backgroundColor: googleHover ? '#252525' : '#1a1a1a',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s',
        },
        error: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
        },
        success: {
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#6ee7b7',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
        },
        footer: {
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#888',
        },
        link: {
            color: '#0aac35',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginLeft: '0.25rem',
        },
        divider: {
            display: 'flex',
            alignItems: 'center',
            margin: '1rem 0'
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            backgroundColor: '#333'
        }
    };

    return (
        <div style={styles.page}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .brand-section {
                            display: none !important;
                        }
                        .right-section {
                            flex: 1 !important;
                            padding: 0 !important;
                            display: flex !important;
                            flex-direction: column !important; /* Stack header and card */
                            align-items: center !important;
                            justify-content: flex-end !important; /* Push card to bottom */
                            background: linear-gradient(135deg, #b2f0c4ff 0%, #e1fee9 100%) !important; /* Mint background */
                        }
                        .login-card {
                            max-width: 100% !important;
                            width: 100% !important;
                            padding: 2.5rem 1.5rem !important;
                            background-color: #12151A !important;
                            border-radius: 32px 32px 0 0 !important; /* Rounded top only */
                            box-shadow: 0 -10px 40px rgba(0,0,0,0.2) !important;
                        }
                        .welcome-title, .welcome-subtitle {
                            display: none !important;
                        }
                        .mobile-header {
                            display: block !important;
                            text-align: center !important;
                            margin-top: auto !important;
                            margin-bottom: auto !important;
                        }
                    }
                `}
            </style>
            {/* Left Side - Branding */}
            <div className="brand-section" style={styles.brandSection}>
                <div style={styles.logoContainer}>
                    <img src="/assets/budgee_icon.png" alt="Budgee Logo" style={styles.logoIcon} />
                    <span style={styles.brandName}>Budgee</span>
                </div>
                <div style={styles.heroHeadline}>
                    Take control <br /> of your finances.
                </div>
                <div style={styles.heroSub}>
                    Budgee is the easiest way to keep track of your finances and help you achieve your goals.
                </div>
            </div>

            {/* Right Side - Dark Floating Card */}
            <div className="right-section" style={styles.rightSection}>
                {/* Mobile Only Header - Outside Modal */}
                <div className="mobile-header" style={{ display: 'none' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0aac35', margin: 0 }}>Create Account</h2>
                </div>

                <div className="login-card" style={styles.loginCard}>

                    <h2 className="welcome-title" style={styles.title}>Create Account</h2>
                    <p className="welcome-subtitle" style={styles.subtitle}>Enter your details to sign up for free.</p>

                    {error && <div style={styles.error}>{error}</div>}
                    {message && <div style={styles.success}>{message}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <div style={styles.divider}>
                            <div style={styles.dividerLine}></div>
                            <span style={{ padding: '0 10px', color: '#555', fontSize: '0.8rem' }}>OR</span>
                            <div style={styles.dividerLine}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setLoading(true);
                                signInWithGoogle();
                            }}
                            onMouseEnter={() => setGoogleHover(true)}
                            onMouseLeave={() => setGoogleHover(false)}
                            disabled={loading}
                            style={styles.googleButton}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                            Sign up with Google
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
