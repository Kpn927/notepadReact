import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import './App.css';
import CustomNavbar from './componentes/navbar.jsx';
import { authingGuard } from "@authing/react-ui-components";
import "@authing/react-ui-components/lib/index.min.css";

const HomePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Página de Inicio</h1>
    <p>¡Bienvenido a la Página de Inicio!</p>
  </div>
);

const LoginPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
    <p>Por favor, inicia sesión en tu cuenta.</p>
  </div>
);

const RegisterPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
    <p>Crea una nueva cuenta.</p>
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
    const hideNavbar = location.pathname === '/login';

    const botonesNavbar = [
      { texto: 'Inicio', ruta: '/', CNBoton: '', colorTexto: '' },
      { texto: 'Iniciar sesión', ruta: '/login', CNBoton: '', colorTexto: '' },
      { texto: 'Registrarse', ruta: '/register', CNBoton: 'boton-register', colorTexto: 'white' },
    ];

    return (
        <>
            {!hideNavbar && <CustomNavbar botones={botonesNavbar} titulo="Kyu's Notepad" rutaIcono="/notepad.svg"/>}
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
