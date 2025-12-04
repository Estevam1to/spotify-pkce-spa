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

## Documentação Técnica

Esta seção explica as decisões técnicas e de segurança tomadas durante o desenvolvimento da aplicação.

### Por que PKCE?

O PKCE (Proof Key for Code Exchange) foi escolhido como método de autenticação por várias razões críticas de segurança:

1. **Proteção contra Authorization Code Interception Attack**: Em aplicações Single Page Application (SPA), não há um servidor backend para proteger o `client_secret`. O PKCE elimina a necessidade de um `client_secret`, tornando a aplicação segura mesmo quando o código-fonte é público.

2. **Compatibilidade com SPAs**: O fluxo OAuth 2.0 tradicional requer um `client_secret`, que não pode ser armazenado com segurança em aplicações client-side. O PKCE foi especificamente projetado para resolver esse problema, permitindo que SPAs usem o fluxo Authorization Code de forma segura.

3. **Recomendação do OAuth 2.1**: O OAuth 2.1 (draft) torna o PKCE obrigatório para todos os fluxos de Authorization Code, refletindo a evolução das melhores práticas de segurança.

4. **Implementação Nativa**: A Web Crypto API, disponível nativamente nos navegadores modernos, permite implementar PKCE sem dependências externas, mantendo o bundle da aplicação pequeno e seguro.

**Como funciona o PKCE:**

- **Code Verifier**: Um valor aleatório de 32 bytes é gerado e codificado em base64url. Este valor permanece secreto no cliente.
- **Code Challenge**: Um hash SHA-256 do verifier é calculado e também codificado em base64url. Este valor é enviado publicamente na requisição de autorização.
- **Validação**: Quando o servidor de autorização retorna o `authorization_code`, o cliente envia o `code_verifier` original junto com o código. O servidor recalcula o hash e compara com o `code_challenge` original. Se corresponderem, a troca é autorizada.

Este mecanismo garante que mesmo que um atacante intercepte o `authorization_code`, ele não conseguirá trocá-lo por um token sem o `code_verifier` original.

### Como Funciona a Validação de State?

A validação de `state` é uma proteção essencial contra ataques CSRF (Cross-Site Request Forgery) no fluxo OAuth 2.0:

1. **Geração do State**: Antes de redirecionar o usuário para o servidor de autorização, a aplicação gera um valor aleatório e único (geralmente um UUID ou string aleatória de alta entropia).

2. **Armazenamento Local**: Este valor é armazenado no `sessionStorage` do navegador, associado à sessão atual do usuário.

3. **Inclusão na Requisição**: O valor do `state` é incluído como parâmetro na URL de autorização enviada ao Spotify.

4. **Retorno do State**: Quando o Spotify redireciona o usuário de volta para a aplicação após a autorização, ele inclui o mesmo valor de `state` nos parâmetros da URL de callback.

5. **Validação**: A aplicação compara o `state` retornado na URL com o valor armazenado no `sessionStorage`. Se os valores corresponderem, a requisição é considerada legítima. Se não corresponderem, a requisição é rejeitada como um possível ataque CSRF.

**Por que isso é importante?**

Sem a validação de `state`, um atacante poderia:
- Criar uma URL de autorização maliciosa que redireciona para a aplicação da vítima
- Se a vítima estiver autenticada, o atacante poderia obter tokens de acesso em nome da vítima
- O `state` garante que apenas requisições iniciadas pela própria aplicação sejam aceitas

### Decisões de Arquitetura

**Separação de Responsabilidades**: O código foi organizado em componentes React para a UI e um serviço dedicado (`AuthService.js`) para toda a lógica de autenticação. Isso facilita manutenção, testes e reutilização.

**Armazenamento de Tokens**: Os tokens são mantidos em memória (variáveis JavaScript) com backup temporário no `sessionStorage`. Isso garante que:
- Tokens não persistem após o fechamento do navegador
- Tokens não são acessíveis por outras abas/origins (diferente do `localStorage`)
- A limpeza é automática ao fazer logout

**Escopos Granulares**: A aplicação implementa dois perfis (Viewer e Manager) com escopos diferentes, demonstrando o princípio de menor privilégio. Usuários só recebem as permissões necessárias para suas funcionalidades.

**Deploy Automatizado**: O uso de GitHub Actions para deploy garante que:
- O código seja testado antes do deploy
- As credenciais sejam gerenciadas de forma segura via Secrets
- O processo seja reproduzível e auditável

### Armazenamento de Tokens

A decisão de armazenar tokens em memória (variáveis JavaScript) com backup temporário no `sessionStorage` foi tomada por razões de segurança:

- **Não persistência**: Tokens não persistem após o fechamento do navegador, reduzindo o risco de acesso não autorizado
- **Isolamento por aba**: Diferente do `localStorage`, o `sessionStorage` é isolado por aba, impedindo que outras abas/origins acessem os tokens
- **Limpeza automática**: O token é limpo automaticamente no logout, garantindo que não permaneça no navegador após o término da sessão
- **Backup temporário**: O backup no `sessionStorage` permite que a sessão persista entre recarregamentos da página, mas apenas durante a sessão do navegador

**Por que não usar `localStorage`?**
O `localStorage` persiste indefinidamente e é acessível por todas as abas do mesmo origin, aumentando a superfície de ataque. Em caso de XSS (Cross-Site Scripting), um atacante poderia acessar tokens armazenados no `localStorage` mesmo após o fechamento da aplicação.

### Logout Seguro

O logout implementa um processo completo de encerramento de sessão:

1. **Limpeza local**: Remove o token da memória e do `sessionStorage`, garantindo que não haja resíduos locais
2. **Encerramento de sessão remota**: Redireciona para o `end_session_endpoint` do Spotify (`/logout`), encerrando a sessão no servidor de autorização
3. **Redirecionamento**: Após logout no Spotify, o usuário é redirecionado de volta para a aplicação

Esta abordagem garante que a sessão seja encerrada tanto localmente quanto no servidor do Spotify, seguindo as melhores práticas de segurança OAuth 2.0.

### Gerenciamento de Credenciais

O `CLIENT_ID` é gerenciado de forma segura através de:

- **GitHub Secrets**: Em produção, o `CLIENT_ID` é injetado via GitHub Secrets durante o build, nunca hardcoded no código-fonte
- **Variáveis de ambiente**: A variável `VITE_SPOTIFY_CLIENT_ID` é usada apenas no build, não sendo exposta no código final
- **Separação de ambientes**: Diferentes valores podem ser usados para desenvolvimento e produção, sem comprometer a segurança

Esta abordagem garante que mesmo com o código-fonte público, as credenciais não sejam expostas.

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
