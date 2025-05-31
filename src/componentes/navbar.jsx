import { useState } from 'react';
import "../componentescss/navbar.css"; // Ensure this path is correct
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// We now accept 'userName' as a prop
function CustomNavbar({ botones, rutaIcono, titulo, userName }) {
  return (
    <nav className="navbar">
      <Link to='/' className='logo'> {/* Use Link instead of <a> for internal navigation */}
        <img src={rutaIcono} alt="App Icon"></img> {/* Add alt attribute for accessibility */}
        <p className='logo-title'> {titulo} </p>
      </Link>

      <ul className="ul">
        {/* Render the welcome message if userName exists */}
        {userName && (
          <li className="li welcome-message-container">
            <span className="welcome-text">¡Hola, {userName}!</span>
          </li>
        )}

        {botones.map((boton, index) => (
          <BotonNavbar key={index} boton={boton} />
        ))}
      </ul>
    </nav>
  );
}

function BotonNavbar({ boton }) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseEnter = () => {
    setIsMouseOver(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
  };

  const handleClick = () => {
    // Check if it's a route, then use Link for internal navigation (best practice)
    // For now, keeping window.location.href as in your original for simplicity,
    // but typically you'd use useNavigate from react-router-dom here if this component
    // is part of the Router context, or pass a navigate function down.
    if (boton.ruta) {
      window.location.href = boton.ruta;
    }
    if (boton.onClick) {
      boton.onClick();
    }
  };

  const colorTexto = boton.colorTexto || 'black';

  return (
    <li className="li">
      <div
        className={`button-container ${boton.CNBoton || ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={handleClick}
          className="button"
          style={{ color: colorTexto }}
        >
          {boton.texto}
          <div className={`hover-box ${isMouseOver ? 'show' : ''}`}></div>
        </button>
      </div>
    </li>
  );
}

export default CustomNavbar;