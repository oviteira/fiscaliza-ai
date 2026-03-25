# Guia de Deployment - FiscalizaAI

## Visão Geral

Este documento descreve como fazer o deployment da plataforma FiscalizaAI em um ambiente de produção.

## Pré-requisitos

- Node.js 18+ ou superior
- pnpm 10+
- MySQL 8.0+ ou MariaDB 10.5+
- Git
- Um domínio configurado (fiscalizaai.com.br ou similar)

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@host:porta/fiscaliza_ai

# Autenticação
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Aplicação
NODE_ENV=production
VITE_APP_TITLE=FiscalizaAI
APP_DOMAIN=fiscalizaai.com.br
APP_URL=https://fiscalizaai.com.br
```

Veja `.env.example` para a lista completa de variáveis.

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/oviteira/fiscaliza-ai.git
cd fiscaliza-ai
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar banco de dados

```bash
# Gerar e executar migrações
pnpm db:push
```

### 4. Build da aplicação

```bash
pnpm build
```

## Deployment com Docker

### Dockerfile

Crie um `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: fiscaliza_ai
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  app:
    build: .
    environment:
      DATABASE_URL: mysql://root:${DB_ROOT_PASSWORD}@db:3306/fiscaliza_ai
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      VITE_APP_ID: ${VITE_APP_ID}
    ports:
      - "3000:3000"
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

volumes:
  db_data:
```

### Executar com Docker Compose

```bash
# Criar arquivo .env com as variáveis necessárias
cp .env.example .env
# Editar .env com seus valores

# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

## Deployment em Servidores Cloud

### Railway

1. Conectar repositório GitHub ao Railway
2. Configurar variáveis de ambiente no painel do Railway
3. Railway detectará automaticamente que é um projeto Node.js
4. Deploy automático será acionado

### Render

1. Criar novo "Web Service" no Render
2. Conectar repositório GitHub
3. Configurar:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
4. Adicionar variáveis de ambiente
5. Criar banco MySQL (ou usar MySQL externo)

### Vercel (apenas frontend)

Para deployar apenas o frontend em Vercel:

```bash
# Build apenas frontend
pnpm build:frontend

# Fazer deploy do diretório dist
```

## Nginx como Proxy Reverso

Configure Nginx para rotear requisições:

```nginx
upstream fiscaliza_ai {
    server localhost:3000;
}

server {
    listen 80;
    server_name fiscalizaai.com.br www.fiscalizaai.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fiscalizaai.com.br www.fiscalizaai.com.br;

    # SSL (usar Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/fiscalizaai.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fiscalizaai.com.br/privkey.pem;

    # Configurações de segurança
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://fiscaliza_ai;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## SSL/TLS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --nginx -d fiscalizaai.com.br -d www.fiscalizaai.com.br

# Renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoramento e Logs

### PM2 (Process Manager)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start "pnpm start" --name "fiscaliza-ai"

# Monitorar
pm2 monit

# Ver logs
pm2 logs fiscaliza-ai

# Salvar configuração
pm2 save
```

### Logs

Os logs são salvos em `.manus-logs/`:

- `devserver.log` - Servidor
- `browserConsole.log` - Console do navegador
- `networkRequests.log` - Requisições HTTP
- `sessionReplay.log` - Eventos de usuário

### Backup do Banco de Dados

```bash
# Backup diário
0 2 * * * mysqldump -u root -p$DB_ROOT_PASSWORD fiscaliza_ai > /backups/fiscaliza_ai_$(date +\%Y\%m\%d).sql

# Restaurar backup
mysql -u root -p$DB_ROOT_PASSWORD fiscaliza_ai < /backups/fiscaliza_ai_20240101.sql
```

## Performance

### Otimizações Recomendadas

1. **Cache**: Implementar Redis para cache de dados frequentes
2. **CDN**: Usar CDN para servir assets estáticos
3. **Compressão**: Habilitar gzip no Nginx
4. **Database**: Adicionar índices nas colunas mais consultadas
5. **Sincronização**: Executar sincronização de dados em horários de baixo uso

### Monitoramento de Performance

```bash
# Verificar uso de memória
free -h

# Verificar CPU
top

# Verificar disco
df -h

# Verificar conexões do banco
mysql -u root -p -e "SHOW PROCESSLIST;"
```

## Troubleshooting

### Erro: "Banco de dados não disponível"

```bash
# Verificar conexão MySQL
mysql -u root -p -h localhost -e "SELECT 1;"

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Erro: "Porta 3000 já em uso"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro: "Certificado SSL inválido"

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Testar renovação
sudo certbot renew --dry-run
```

## Checklist de Deployment

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrações executadas
- [ ] Build da aplicação bem-sucedido
- [ ] SSL/TLS configurado
- [ ] Nginx/proxy reverso configurado
- [ ] Backup do banco de dados configurado
- [ ] Monitoramento ativado
- [ ] Logs sendo coletados
- [ ] Testes de carga executados
- [ ] Documentação atualizada

## Suporte

Para problemas ou dúvidas sobre deployment, consulte:

- [Documentação do Node.js](https://nodejs.org/docs/)
- [Documentação do MySQL](https://dev.mysql.com/doc/)
- [Documentação do Nginx](https://nginx.org/en/docs/)
- [Issues do GitHub](https://github.com/oviteira/fiscaliza-ai/issues)
