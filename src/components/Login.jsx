import { useState } from 'react';
import authService from '../services/AuthService';

function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (profile) => {
    setLoading(true);
    try {
      await authService.initiateLogin(profile);
    } catch (error) {
      console.error('Erro ao iniciar login:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Spotify PKCE SPA
          </h1>
          <p className="text-gray-600">
            Autenticação OAuth 2.0 com PKCE
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              👁️ Viewer
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Apenas visualização. Escopo: <code className="bg-gray-100 px-2 py-1 rounded">user-read-playback-state</code>
            </p>
            <button
              onClick={() => handleLogin('viewer')}
              disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : 'Entrar como Viewer'}
            </button>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🎛️ Manager
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Controle completo. Escopos: <code className="bg-gray-100 px-2 py-1 rounded">user-read-playback-state</code> e <code className="bg-gray-100 px-2 py-1 rounded">user-modify-playback-state</code>
            </p>
            <button
              onClick={() => handleLogin('manager')}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : 'Entrar como Manager'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Este projeto demonstra OAuth 2.0 com PKCE para segurança acadêmica
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
