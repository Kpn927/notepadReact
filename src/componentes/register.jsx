import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../componentescss/register.css';

export default function RegisterForm({ loginPath = '/login', homePath = '/' }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las claves no son las mismas!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registro efectuado, por favor logeate.');
        navigate(loginPath);

      } else {
        setError(data.message || 'Registro fallido, por favor intenta de nuevo.');

      }
    } catch (err) {
      console.error('Error durante el registro:', err);
      setError('Error de internet, pruebe más tarde.');

    } finally {
      setLoading(false);

    }
  };

  const handleLoginClick = () => {
    navigate(loginPath);
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="register-logo-container">
        <Link to={homePath}>
          <img src="/notepad.svg" className="register-logo" />
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="registerUsername"></label>
        <input
          type="username"
          id="registerUsername"
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ingrese su username"
          required
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="registerEmail"></label>
        <input
          type="email"
          id="registerEmail"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingrese su email"
          required
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="registerPassword"></label>
        <input
          type="password"
          id="registerPassword"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Crea tu contraseña'
          required
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword"></label>
        <input
          type="password"
          id="confirmPassword"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirma tu contraseña'
          required
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
      <button type="button" className="btn btn-secondary" onClick={handleLoginClick} disabled={loading}>
        Ya tienes una cuenta? logeate!
      </button>
    </form>
  );
}
