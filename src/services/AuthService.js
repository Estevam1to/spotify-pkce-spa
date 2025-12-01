class AuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.spotifyAuthUrl = 'https://accounts.spotify.com';
    this.spotifyApiUrl = 'https://api.spotify.com/v1';
    
    let pathname = window.location.pathname;
    if (pathname !== '/' && !pathname.endsWith('/')) {
      pathname = pathname + '/';
    }
    this.redirectUri = window.location.origin + pathname;
    
    this.accessToken = null;
    this.userProfile = null;
  }

  async generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    
    const base64 = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return base64;
  }

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return base64;
  }

  generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    const base64 = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return base64;
  }

  async initiateLogin(profile = 'viewer') {
    const scopes = profile === 'manager' 
      ? 'user-read-playback-state user-modify-playback-state'
      : 'user-read-playback-state';

    const codeVerifier = await this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();
    
    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('user_profile', profile);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    const authUrl = `${this.spotifyAuthUrl}/authorize?${params.toString()}`;
    
    window.location.href = authUrl;
  }

  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (error) {
      console.error('Erro na autenticação:', error);
      return false;
    }
    
    if (!code || !state) {
      return false;
    }
    
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      console.error('State inválido - possível ataque CSRF');
      return false;
    }
    
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
      console.error('Code verifier não encontrado');
      return false;
    }
    
    try {
      const tokenResponse = await fetch(`${this.spotifyAuthUrl}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          code_verifier: codeVerifier
        })
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Erro ao obter token:', errorData);
        return false;
      }
      
      const tokenData = await tokenResponse.json();
      
      this.accessToken = tokenData.access_token;
      
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('oauth_state');
      
      this.userProfile = sessionStorage.getItem('user_profile');
      
      return true;
    } catch (error) {
      console.error('Erro na troca de token:', error);
      return false;
    }
  }

  isAuthenticated() {
    return this.accessToken !== null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getUserProfile() {
    return this.userProfile;
  }

  async apiRequest(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('Não autenticado');
    }
    
    const response = await fetch(`${this.spotifyApiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      this.accessToken = null;
      throw new Error('Token expirado');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na requisição');
    }
    
    return response.json();
  }

  logout() {
    this.accessToken = null;
    this.userProfile = null;
    sessionStorage.clear();
    
    window.location.href = `${this.spotifyAuthUrl}/logout`;
  }
}

export default new AuthService();
