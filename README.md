# Spotify PKCE SPA

Single Page Application (SPA) desenvolvida em React que implementa autenticação OAuth 2.0 com PKCE (Proof Key for Code Exchange) utilizando a API do Spotify.

**Aplicação em produção**: https://estevam1to.github.io/spotify-pkce-spa/

## Objetivo

Este projeto foi desenvolvido como trabalho acadêmico para demonstrar a implementação segura de autenticação OAuth 2.0 em aplicações Single Page Application, com foco em:

- Implementação manual do fluxo PKCE usando Web Crypto API
- Segregação de permissões baseada em escopos (Viewer vs Manager)
- Proteção contra ataques CSRF através de validação de state
- Deploy automatizado com GitHub Actions e gerenciamento seguro de credenciais

## Tecnologias Utilizadas

- React 18.2.0
- Vite 5.0.8
- TailwindCSS 3.3.6
- Web Crypto API (nativa do navegador)
- GitHub Pages (hospedagem)

## Estrutura do Projeto

```
spotify-pkce-spa/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de deploy automatizado
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Componente de autenticação
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   └── Player.jsx          # Componente de player (renderização condicional)
│   ├── services/
│   │   └── AuthService.js      # Serviço de autenticação OAuth 2.0 com PKCE
│   ├── App.jsx                 # Componente raiz
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Pré-requisitos

1. Conta no Spotify Developer (https://developer.spotify.com/dashboard)
2. Node.js 18 ou superior
3. Conta no GitHub (para deploy e GitHub Actions)

## Configuração

### 1. Criar Aplicação no Spotify Developer Dashboard

1. Acesse o Spotify Developer Dashboard: https://developer.spotify.com/dashboard
2. Clique em "Create App"
3. Preencha o formulário:
   - **App name**: Nome da sua aplicação
   - **App description**: Descrição da aplicação
   - **Which API/SDKs are you planning to use?**: Selecione "Web API"
   - **Redirect URIs**: Adicione a URL de produção:
     ```
     https://estevam1to.github.io/spotify-pkce-spa/
     ```
     Se seu repositório tiver outro nome de usuário, substitua `estevam1to` pelo seu usuário do GitHub.
4. Após criar, copie o **Client ID** exibido na página do app

### 2. Configurar Variáveis de Ambiente

#### Para Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui
```

Substitua `seu_client_id_aqui` pelo Client ID copiado do Spotify Dashboard.

#### Para Produção (GitHub Pages)

1. No repositório GitHub, acesse **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Configure:
   - **Name**: `SPOTIFY_CLIENT_ID`
   - **Value**: Cole o Client ID do Spotify
4. Clique em **Add secret**

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

**Nota**: Para desenvolvimento local, você precisará adicionar `http://localhost:5173` como Redirect URI no Spotify Dashboard. Se o Spotify não permitir, teste diretamente em produção.

## Deploy no GitHub Pages

### Configuração Automática

O projeto está configurado para deploy automático via GitHub Actions:

1. Faça commit e push do código para a branch `main`:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. O workflow será executado automaticamente

3. Acesse **Settings** > **Pages** no repositório GitHub

4. Selecione **Source**: GitHub Actions

5. Após o deploy, a aplicação estará disponível em:
   ```
   https://estevam1to.github.io/spotify-pkce-spa/
   ```

### Atualizar Redirect URI no Spotify

Após o deploy, atualize o Redirect URI no Spotify Dashboard:

1. Acesse o Spotify Developer Dashboard
2. Edite seu app
3. Adicione o Redirect URI de produção:
   ```
   https://estevam1to.github.io/spotify-pkce-spa/
   ```
4. Salve as alterações

## Como Usar

### Fluxo de Autenticação

1. Acesse a aplicação (local ou produção)
2. Selecione um perfil:
   - **Viewer**: Apenas visualização da música atual
   - **Manager**: Visualização e controle de reprodução
3. Clique no botão correspondente
4. Você será redirecionado para o Spotify para autorizar a aplicação
5. Após autorizar, será redirecionado de volta para a aplicação
6. O Dashboard será exibido com as funcionalidades baseadas no perfil escolhido

### Funcionalidades por Perfil

#### Perfil Viewer

- Visualização da música atual (nome, artista, álbum, capa)
- Status de reprodução (tocando/pausado)
- Não possui controles de reprodução

#### Perfil Manager

- Todas as funcionalidades do Viewer
- Controles de reprodução:
  - Play/Pause
  - Próxima música
  - Música anterior

### Requisitos para Funcionamento

- Ter uma música tocando no Spotify (aplicativo desktop, web player ou dispositivo)
- Estar autenticado no Spotify
- Ter autorizado a aplicação com os escopos necessários

## Implementação de Segurança

### PKCE (Proof Key for Code Exchange)

O PKCE é implementado manualmente usando Web Crypto API:

1. **Geração do code_verifier**: Valor aleatório de 32 bytes, codificado em base64url
2. **Cálculo do code_challenge**: Hash SHA-256 do verifier, codificado em base64url
3. **Armazenamento**: O `code_verifier` é armazenado no `sessionStorage` durante o fluxo
4. **Troca de token**: O `code_verifier` é enviado junto com o `authorization_code` para obter o token

### Proteção CSRF (State)

1. **Geração**: Um `state` aleatório é gerado antes do redirecionamento
2. **Armazenamento**: Salvo no `sessionStorage`
3. **Validação**: No callback, o `state` retornado é comparado com o armazenado
4. **Rejeição**: Se não corresponder, a requisição é rejeitada (possível ataque CSRF)

### Armazenamento de Tokens

- O `access_token` é armazenado em memória (variável JavaScript)
- Um backup temporário é mantido no `sessionStorage` para persistir entre recarregamentos
- **NÃO** é usado `localStorage` para tokens
- O token é limpo automaticamente no logout

### Logout Seguro

O logout implementa o requisito de segurança completo:

1. **Limpeza local**: Remove o token da memória e do `sessionStorage`
2. **Encerramento de sessão remota**: Redireciona para o `end_session_endpoint` do Spotify (`/logout`)
3. **Redirecionamento**: Após logout no Spotify, o usuário é redirecionado de volta para a aplicação

Isso garante que a sessão seja encerrada tanto localmente quanto no servidor do Spotify.

### Gerenciamento de Credenciais

- O `CLIENT_ID` é injetado via GitHub Secrets durante o build
- Nunca é hardcoded no código-fonte
- A variável de ambiente `VITE_SPOTIFY_CLIENT_ID` é usada apenas no build

## Endpoints da API Utilizados

- `GET /me/player` - Obter estado atual de reprodução
- `PUT /me/player/play` - Iniciar reprodução
- `PUT /me/player/pause` - Pausar reprodução
- `POST /me/player/next` - Próxima música
- `POST /me/player/previous` - Música anterior

## Escopos Utilizados

- `user-read-playback-state`: Leitura do estado de reprodução (Viewer e Manager)
- `user-modify-playback-state`: Controle de reprodução (apenas Manager)

## Limitações Conhecidas

- O `access_token` expira após 1 hora. Após expirar, é necessário fazer login novamente
- Não há implementação de refresh token (fora do escopo deste trabalho acadêmico)
- Requer que o Spotify esteja ativo e reproduzindo música para exibir informações

## Referências

- [OAuth 2.0 Authorization Code Flow with PKCE](https://oauth.net/2/pkce/)
- [Spotify Web API Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Licença

Este projeto foi desenvolvido para fins acadêmicos.
