# Spotify PKCE SPA

Single Page Application (SPA) que demonstra autenticação OAuth 2.0 com PKCE (Proof Key for Code Exchange) usando a API do Spotify.

## 🎯 Objetivo

Este projeto foi desenvolvido para um trabalho acadêmico de segurança, demonstrando:

- **Requisito A**: Implementação manual do PKCE usando Web Crypto API
- **Requisito B**: Segregação de permissões (Viewer vs Manager)
- **Requisito C**: Proteção CSRF com state validation
- **Requisito 3**: Deploy automatizado com GitHub Actions

## 🚀 Tecnologias

- **React** (com Vite)
- **JavaScript puro** para criptografia (Web Crypto API)
- **TailwindCSS** para estilização
- **GitHub Pages** para hospedagem

## 📋 Pré-requisitos

1. Conta no Spotify Developer
2. Node.js 18+ instalado
3. Conta no GitHub (para deploy)

## 🔧 Configuração

### 1. Criar App no Spotify Developer Dashboard

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Clique em "Create App"
3. Preencha:
   - **App name**: Spotify PKCE SPA
   - **App description**: SPA com OAuth 2.0 PKCE
   - **Redirect URIs**: 
     - Para produção: `https://SEU_USUARIO.github.io/spotify-pkce-spa/`
     - (Opcional) Para desenvolvimento local: `http://localhost:5173` (pode não ser aceito em alguns casos)
4. Copie o **Client ID**

**Nota**: Se o Spotify não permitir adicionar `localhost`, use apenas a URL de produção. Você pode testar fazendo o deploy primeiro.

### 2. Configurar Variáveis de Ambiente

#### Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui
```

#### Produção (GitHub Pages)

1. No repositório GitHub, vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione:
   - **Name**: `SPOTIFY_CLIENT_ID`
   - **Value**: Seu Client ID do Spotify

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar Localmente

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
spotify-pkce-spa/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Tela de login com seleção de perfil
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   └── Player.jsx          # Componente de player (condicional)
│   ├── services/
│   │   └── AuthService.js      # Lógica OAuth 2.0 com PKCE
│   ├── App.jsx                 # Componente raiz
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Implementação de Segurança

### PKCE (Proof Key for Code Exchange)

O PKCE é implementado manualmente usando Web Crypto API:

1. **Code Verifier**: String aleatória de 43-128 caracteres (base64url)
2. **Code Challenge**: SHA-256 hash do verifier, codificado em base64url
3. Armazenamento: `code_verifier` salvo no `sessionStorage` (não `localStorage`)

```javascript
// Geração do code_verifier
const codeVerifier = await generateCodeVerifier();

// Cálculo do code_challenge
const codeChallenge = await generateCodeChallenge(codeVerifier);
```

### Proteção CSRF (State)

- Geração de `state` aleatório antes do redirecionamento
- Validação do `state` no callback
- Armazenamento temporário no `sessionStorage`

### Armazenamento de Token

- **Access Token**: Armazenado em memória (variável de classe)
- **NÃO** usa `localStorage` para tokens
- Limpeza automática ao fazer logout

## 👥 Perfis de Usuário

### Viewer (Visualizador)

- **Escopo**: `user-read-playback-state`
- **Permissões**: Apenas leitura
- **Funcionalidades**:
  - Visualizar música atual
  - Ver status de reprodução (tocando/pausado)

### Manager (Gerenciador)

- **Escopos**: 
  - `user-read-playback-state`
  - `user-modify-playback-state`
- **Permissões**: Leitura e escrita
- **Funcionalidades**:
  - Todas do Viewer
  - Controle de reprodução (Play/Pause)
  - Pular música (Next/Previous)

## 🚢 Deploy no GitHub Pages

### Configuração Automática

O projeto está configurado para deploy automático via GitHub Actions:

1. Faça push para a branch `main`
2. O workflow será executado automaticamente
3. A aplicação estará disponível em: `https://SEU_USUARIO.github.io/spotify-pkce-spa/`

### Configuração Manual

1. No repositório GitHub, vá em **Settings** → **Pages**
2. Selecione:
   - **Source**: GitHub Actions
3. Certifique-se de que o secret `SPOTIFY_CLIENT_ID` está configurado

### Atualizar Redirect URI

Após o deploy, atualize o Redirect URI no Spotify Dashboard:

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Edite seu app
3. Adicione o Redirect URI de produção:
   ```
   https://SEU_USUARIO.github.io/spotify-pkce-spa/
   ```

## 📝 Fluxo de Autenticação

1. Usuário seleciona perfil (Viewer ou Manager)
2. Aplicação gera `code_verifier` e `code_challenge` (PKCE)
3. Aplicação gera `state` (CSRF protection)
4. Redirecionamento para Spotify Authorization
5. Usuário autoriza a aplicação
6. Spotify redireciona de volta com `code` e `state`
7. Aplicação valida `state`
8. Aplicação troca `code` + `code_verifier` por `access_token`
9. Token armazenado em memória
10. Acesso à API do Spotify

## 🧪 Testando a Aplicação

### Como Viewer

1. Faça login como Viewer
2. Inicie uma música no Spotify (app ou web player)
3. A aplicação deve exibir a música atual
4. **Não** deve haver botões de controle

### Como Manager

1. Faça login como Manager
2. Inicie uma música no Spotify
3. A aplicação deve exibir a música atual
4. **Deve** haver botões de controle (Play/Pause/Skip)
5. Teste os controles - devem fazer chamadas reais à API

## 🔍 Endpoints da API Utilizados

- `GET /me/player` - Obter estado atual de reprodução
- `PUT /me/player/play` - Iniciar reprodução
- `PUT /me/player/pause` - Pausar reprodução
- `POST /me/player/next` - Próxima música
- `POST /me/player/previous` - Música anterior

## 📚 Referências

- [OAuth 2.0 Authorization Code Flow with PKCE](https://oauth.net/2/pkce/)
- [Spotify Web API Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

## ⚠️ Notas Importantes

- O `access_token` expira após 1 hora
- Para produção, implemente refresh token (não incluído neste projeto acadêmico)
- O `code_verifier` é limpo do `sessionStorage` após a troca de token
- O `state` é validado para prevenir ataques CSRF

