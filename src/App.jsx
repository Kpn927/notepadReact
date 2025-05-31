import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import CustomNavbar from './componentes/navbar.jsx';
import Login from './componentes/login.jsx';
import Register from './componentes/register.jsx';
import LineaPorLinea from './componentes/superimportantcomponent.jsx';

// NO necesitas importar el TXT aquí directamente si lo vas a cargar con fetch
// import beemovieScript from './beemoviescript.txt'; // <-- ELIMINA O COMENTA ESTA LÍNEA

const HomePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Página de Inicio</h1>
    <p>¡Bienvenido a la Página de Inicio!</p>
  </div>
);

const LoginPage = ({ onLoginSuccess }) => (
  <div className="p-6">
    <Login registerPath="/register" onLoginSuccess={onLoginSuccess} />
  </div>
);

const RegisterPage = () => (
  <div className="p-6">
    <Register loginPath="/login" homePath="/" />
  </div>
);

const NotFoundPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">404 No Encontrado</h1>
        <p>Lo siento, la página que buscas no existe.</p>
    </div>
);

const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const storedLoginStatus = localStorage.getItem('isLoggedIn');
        return storedLoginStatus === 'true';
    });

    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('userName') || '';
    });

    const hideNavbar = location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/random';

    const [beemovieScriptContent, setBeemovieScriptContent] = useState('');
    const [loadingScript, setLoadingScript] = useState(true);
    const [scriptError, setScriptError] = useState(null);

    useEffect(() => {
        const fetchScript = async () => {
            try {

                const response = await fetch('/beemoviescript.txt');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                setBeemovieScriptContent(text);
            } catch (error) {
                console.error("Error fetching Bee Movie script:", error);
                setScriptError("No se pudo cargar el script.");
            } finally {
                setLoadingScript(false);
            }
        };

        fetchScript();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    const handleLoginSuccess = (username) => {
        setIsLoggedIn(true);
        setUserName(username);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', username);
        console.log('Login completado! Username:', username);
        navigate('/');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        console.log('User cerró sesión.');
        navigate('/');
    };

    let botonesNavbar = [
      { texto: 'Inicio', ruta: '/', CNBoton: '', colorTexto: '' },
      { texto: 'Botónsupermegaimportante', ruta: '/random', CNBoton: '', colorTexto: '' }
    ];

    if (isLoggedIn) {
        botonesNavbar.push({ texto: 'Cerrar sesión', onClick: handleLogout, CNBoton: 'boton-logout', colorTexto: 'red'});
    } else {
        botonesNavbar.push(
          { texto: 'Iniciar sesión', ruta: '/login', CNBoton: '', colorTexto: '' },
          { texto: 'Registrarse', ruta: '/register', CNBoton: 'boton-register', colorTexto: 'white' }
        );
    }

    // Define qué contenido mostrar en la ruta /random
    let randomElementContent;
    if (loadingScript) {
      randomElementContent = <p>Cargando script de Bee Movie...</p>;
    } else if (scriptError) {
      randomElementContent = <p className="text-red-500">{scriptError}</p>;
    } else {
      // Pasa el contenido cargado asíncronamente
      randomElementContent = <LineaPorLinea texto={beemovieScriptContent} />;
    }

    return (
        <>
            {!hideNavbar && (
                <CustomNavbar
                    botones={botonesNavbar}
                    titulo="Kyu's Notepad"
                    rutaIcono="/notepad.svg"
                    userName={isLoggedIn ? userName : null}
                />
            )}
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/random" element={randomElementContent} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;