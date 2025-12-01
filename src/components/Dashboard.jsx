import { useState, useEffect } from 'react';
import authService from '../services/AuthService';
import Player from './Player';

function Dashboard() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userProfile = authService.getUserProfile();

  useEffect(() => {
    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentTrack = async () => {
    try {
      setError(null);
      const data = await authService.apiRequest('/me/player');
      
      if (data && data.item) {
        setCurrentTrack(data);
      } else if (data && !data.item) {
        setCurrentTrack(null);
      } else {
        setCurrentTrack(null);
      }
    } catch (err) {
      if (err.message === 'Token expirado' || err.message === 'Não autenticado') {
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname;
        }, 2000);
      } else if (err.message.includes('502') || err.message.includes('Bad Gateway')) {
        setError('Serviço temporariamente indisponível. Tente novamente em alguns instantes.');
      } else if (!err.message.includes('JSON')) {
        setError(err.message);
      }
      
      if (!err.message.includes('502') && !err.message.includes('Bad Gateway')) {
        setCurrentTrack(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black">
      <header className="bg-black bg-opacity-30 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Spotify Player</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6">
            <p className="font-semibold">Erro:</p>
            <p>{error}</p>
            {error.includes('Token expirado') && (
              <p className="mt-2 text-sm">Por favor, faça login novamente.</p>
            )}
          </div>
        )}

        {!currentTrack && !error && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <p className="text-xl mb-2">Nenhuma música está tocando</p>
            <p className="text-green-200">Inicie uma música no Spotify para ver aqui</p>
          </div>
        )}

        {currentTrack && (
          <div className="space-y-6">
            <Player 
              currentTrack={currentTrack} 
              isManager={userProfile === 'manager'}
              onUpdate={fetchCurrentTrack}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
