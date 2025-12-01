import { useState, useEffect } from 'react';
import authService from './services/AuthService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleOAuthCallback();
    } else {
      setIsAuthenticated(authService.isAuthenticated());
      setIsLoading(false);
    }
  }, []);

  const handleOAuthCallback = async () => {
    setIsLoading(true);
    try {
      const success = await authService.handleCallback();
      setIsAuthenticated(success);
    } catch (error) {
      console.error('Erro no callback OAuth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

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
