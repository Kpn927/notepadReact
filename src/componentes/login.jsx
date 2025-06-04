import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import '../componentescss/login.css';

export default function LoginForm({ registerPath = '/register', homePath = '/', onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
          const response = await fetch('http://localhost:5000/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok) {
              localStorage.setItem('isLoggedIn', 'true');
              if (data.username) {
                  localStorage.setItem('userName', data.username);
              }

              if (onLoginSuccess) {
                  onLoginSuccess(data.username);
              }
              console.log('Login completado!', data);

          } else {
              setError(data.message || 'Login fallido. Por favor revisa tus credenciales.');
          }
      } catch (err) {
          console.error('Error durante el login:', err);
          setError('Error de internet. Por favor intenta luego.');
      } finally {
        setLoading(false);
    };
};

  const handleRegisterClick = () => {
    navigate(registerPath);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-logo-container">
        <Link to={homePath}>
          <img src="/notepad.svg" className="login-logo"/>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="email"></label>
        <input
          type="text"
          id="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu gmail o usuario"
          required
          disabled={loading}
        />
      </div>
      <div className="form-group password-group">
        <label htmlFor="password"></label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Ingresa tu contraseña'
          required
          disabled={loading}
        />
        <button type="button" className="toggle-password-visibility" onClick={togglePasswordVisibility} disabled={loading}>
          {showPassword ? <FaEyeSlash/> : <FaEye/>}
        </button>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Logeandose...' : 'Login'}
      </button>
      <button type="button" className="btn btn-secondary" onClick={handleRegisterClick} disabled={loading}>
        Registrarse
      </button>
    </form>
  );
}
