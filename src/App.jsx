import { useState, useEffect } from 'react';
import authService from './services/AuthService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleOAuthCallback = async () => {
    setIsLoading(true);
    try {
      const success = await authService.handleCallback();
      
      if (success) {
        const token = sessionStorage.getItem('access_token');
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        await handleOAuthCallback();
      } else {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black flex items-center justify-center">
        <div className="text-white text-xl">Processando autenticação...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
