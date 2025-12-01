class AuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.spotifyAuthUrl = 'https://accounts.spotify.com';
    this.spotifyApiUrl = 'https://api.spotify.com/v1';
    
    let pathname = window.location.pathname;
    if (pathname !== '/' && !pathname.endsWith('/')) {
      pathname = pathname + '/';
    }
    
    let origin = window.location.origin;
    if (origin.includes('estevam1to.github.io')) {
      origin = origin.replace('estevam1to', 'Estevam1to');
    }
    
    this.redirectUri = origin + pathname;
    
    const storedToken = sessionStorage.getItem('access_token');
    const storedProfile = sessionStorage.getItem('user_profile');
    
    this.accessToken = storedToken;
    this.userProfile = storedProfile;
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

    if (!this.clientId) {
      alert('Erro: Client ID não configurado. Verifique as variáveis de ambiente.');
      return;
    }

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
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('code_verifier');
      return false;
    }
    
    if (!code || !state) {
      return false;
    }
    
    const storedState = sessionStorage.getItem('oauth_state');
    
    if (!storedState) {
      return false;
    }
    
    if (state !== storedState) {
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('code_verifier');
      return false;
    }
    
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
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
        await tokenResponse.json();
        return false;
      }
      
      const tokenData = await tokenResponse.json();
      
      this.accessToken = tokenData.access_token;
      sessionStorage.setItem('access_token', this.accessToken);
      
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('oauth_state');
      
      const requestedProfile = sessionStorage.getItem('user_profile');
      
      const grantedScopes = tokenData.scope ? tokenData.scope.split(' ') : [];
      const hasModifyScope = grantedScopes.includes('user-modify-playback-state');
      
      if (requestedProfile === 'manager' && hasModifyScope) {
        this.userProfile = 'manager';
      } else {
        this.userProfile = 'viewer';
      }
      
      sessionStorage.setItem('user_profile', this.userProfile);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated() {
    if (this.accessToken) {
      return true;
    }
    
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) {
      this.accessToken = storedToken;
      return true;
    }
    
    return false;
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
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user_profile');
      throw new Error('Token expirado');
    }
    
    if (response.status === 204) {
      return null;
    }
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro na requisição');
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await response.text();
        if (text && text.trim()) {
          return JSON.parse(text);
        }
        return null;
      } catch (parseError) {
        return null;
      }
    }
    
    return null;
  }

  logout() {
    this.accessToken = null;
    this.userProfile = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_profile');
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('oauth_state');
    
    const logoutUrl = `${this.spotifyAuthUrl}/logout?redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    window.location.href = logoutUrl;
  }
}

export default new AuthService();
