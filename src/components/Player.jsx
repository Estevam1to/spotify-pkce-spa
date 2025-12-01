import { useState } from 'react';
import authService from '../services/AuthService';

function Player({ currentTrack, isManager, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const track = currentTrack.item;
  const isPlaying = currentTrack.is_playing;

  const handlePlayPause = async () => {
    if (!isManager) return;
    
    setLoading(true);
    setActionError(null);
    
    try {
      const endpoint = isPlaying 
        ? '/me/player/pause' 
        : '/me/player/play';
      
      await authService.apiRequest(endpoint, {
        method: 'PUT'
      });
      
      setTimeout(() => {
        onUpdate();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao controlar reprodução:', error);
      setActionError(error.message);
      setLoading(false);
      
      if (error.message === 'Token expirado' || error.message === 'Não autenticado') {
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname;
        }, 2000);
      }
    }
  };

  const handleSkipNext = async () => {
    if (!isManager) return;
    
    setLoading(true);
    setActionError(null);
    
    try {
      await authService.apiRequest('/me/player/next', {
        method: 'POST'
      });
      
      setTimeout(() => {
        onUpdate();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao pular música:', error);
      setActionError(error.message);
      setLoading(false);
      
      if (error.message === 'Token expirado' || error.message === 'Não autenticado') {
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname;
        }, 2000);
      }
    }
  };

  const handleSkipPrevious = async () => {
    if (!isManager) return;
    
    setLoading(true);
    setActionError(null);
    
    try {
      await authService.apiRequest('/me/player/previous', {
        method: 'POST'
      });
      
      setTimeout(() => {
        onUpdate();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao voltar música:', error);
      setActionError(error.message);
      setLoading(false);
      
      if (error.message === 'Token expirado' || error.message === 'Não autenticado') {
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname;
        }, 2000);
      }
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {track.album.images && track.album.images[0] && (
          <img
            src={track.album.images[0].url}
            alt={track.album.name}
            className="w-full md:w-48 h-48 object-cover rounded-lg shadow-lg"
          />
        )}
        
        <div className="flex-1 text-white">
          <h2 className="text-3xl font-bold mb-2">{track.name}</h2>
          <p className="text-green-200 text-lg mb-4">
            {track.artists.map(artist => artist.name).join(', ')}
          </p>
          <p className="text-gray-300 text-sm mb-2">
            Álbum: {track.album.name}
          </p>
          <p className="text-gray-300 text-sm">
            Duração: {Math.floor(track.duration_ms / 60000)}:{(track.duration_ms % 60000 / 1000).toFixed(0).padStart(2, '0')}
          </p>
          
          {isPlaying ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500 bg-opacity-30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Tocando agora</span>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 bg-gray-500 bg-opacity-30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm">Pausado</span>
            </div>
          )}
        </div>
      </div>

      {isManager ? (
        <div className="border-t border-white border-opacity-20 pt-6">
          <h3 className="text-white font-semibold mb-4 text-center">
            🎛️ Controles (Manager)
          </h3>
          
          {actionError && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-lg mb-4 text-sm">
              {actionError}
            </div>
          )}
          
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleSkipPrevious}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Música anterior"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            
            <button
              onClick={handlePlayPause}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {loading ? (
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleSkipNext}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Próxima música"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>
          
          <p className="text-center text-green-200 text-sm mt-4">
            ✅ Chamadas reais à API do Spotify (PUT/POST /me/player/...)
          </p>
        </div>
      ) : (
        <div className="border-t border-white border-opacity-20 pt-6 text-center">
          <p className="text-gray-300 text-sm">
            👁️ Modo Viewer: Apenas visualização. Faça login como Manager para controlar a reprodução.
          </p>
        </div>
      )}
    </div>
  );
}

export default Player;
