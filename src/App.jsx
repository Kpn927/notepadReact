import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation, useNavigate, Link } from 'react-router-dom';
import './App.css';
import CustomNavbar from './componentes/navbar.jsx';
import Login from './componentes/login.jsx';
import Register from './componentes/register.jsx';
import LineaPorLinea from './componentes/superimportantcomponent.jsx';
import NotesManager from './componentes/notes.jsx';
import NotesManager1 from './componentes/Notedisplay1.jsx';

const HomePage = ({ isLoggedIn }) => (
    <div className="home">
        <div className='welcometext'>
            {isLoggedIn ? (
                <>
                    <h2>¡Bienvenido a Kyu's Notepad!</h2>
                    <p>Es hora de organizar tus ideas. <Link to="/notas" className="link-action">Ir a tus notas</Link></p>
                </>
            ) : (
                <>
                    <h2>¡Bienvenido a Kyu's Notepad!</h2>
                    <p>Organiza tus ideas con facilidad. Por favor, <Link to="/register" className="link-action">regístrate</Link> o <Link to="/login" className="link-action">inicia sesión</Link> para continuar.</p>
                </>
            )}
        </div>
    </div>
);

const LoginPage = ({ onLoginSuccess }) => (
    <div className="login">
        <Login registerPath="/register" onLoginSuccess={onLoginSuccess} />
    </div>
);

const RegisterPage = () => (
    <div className="register">
        <Register loginPath="/login" homePath="/" />
    </div>
);

const NotFoundPage = () => (
    <div className="notfound">
        <h1>404 No Encontrado</h1>
        <p>Lo siento, la página que buscas no existe.</p>
    </div>
);

const NotesPage = () => (
    <div className="notes">
        <NotesManager1 />
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
        return localStorage.getItem('username');
    });

    const [userId, setUserId] = useState(() => {
        return localStorage.getItem('userId') || '';
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
                    throw new Error(`HTTP Error! estado: ${response.status}`);
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
    }, []);

    const handleLoginSuccess = (id, userName) => {
        setIsLoggedIn(true);
        setUserId(id);
        setUserName(userName);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', id);
        localStorage.setItem('userName', userName);
        console.log('Login completado! UserID:', id);
        navigate('/');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserId('');
        setUserName('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        console.log('User cerró sesión.');
        navigate('/');
    };

    let botonesNavbar = [
        { texto: 'Inicio', ruta: '/', CNBoton: '', colorTexto: '' },
        { texto: 'Botónsupermegaimportante', ruta: '/random', CNBoton: '', colorTexto: '' }
    ];

    if (isLoggedIn) {
        botonesNavbar.push({ texto: 'Notas', ruta: '/notas', CNBoton: '', colorTexto: '' });
        botonesNavbar.push({ texto: 'Cerrar sesión', onClick: handleLogout, CNBoton: 'boton-logout', colorTexto: 'red' });
    } else {
        botonesNavbar.push(
            { texto: 'Iniciar sesión', ruta: '/login', CNBoton: '', colorTexto: '' },
            { texto: 'Registrarse', ruta: '/register', CNBoton: 'boton-register', colorTexto: 'white' }
        );
    }

    let randomElementContent;
    if (loadingScript) {
        randomElementContent = <p>Cargando script de Bee Movie...</p>;
    } else if (scriptError) {
        randomElementContent = <p className="text-red-500">{scriptError}</p>;
    } else {
        randomElementContent = <LineaPorLinea texto={beemovieScriptContent} />;
    }

    return (
        <>
            <div className="main-app-container">
                {!hideNavbar && (
                    <CustomNavbar
                        botones={botonesNavbar}
                        titulo="Kyu's Notepad"
                        rutaIcono="/notepad.svg"
                        userName={userName}
                    />
                )}
                <Routes>
                    {/* HomePage now only receives isLoggedIn */}
                    <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
                    <Route path='/notas' element={<NotesPage />} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/random" element={randomElementContent} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;