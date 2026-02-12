# 🚀 Guia de Deploy - Souls Hunter Bot

## Configuração do GitHub

### 1. Criar Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Souls Hunter Bot"

# Adicionar repositório remoto
git remote add origin https://github.com/SEU_USUARIO/souls-hunter-bot.git

# Push para o GitHub
git branch -M main
git push -u origin main
```

### 2. Configurar Secrets no GitHub

Vá em: **Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `SERVER_HOST` | IP ou domínio do servidor | `123.456.789.0` ou `bot.seudominio.com` |
| `SERVER_USER` | Usuário SSH | `ubuntu` ou `root` |
| `SSH_PRIVATE_KEY` | Chave SSH privada | Conteúdo do arquivo `~/.ssh/id_rsa` |
| `SERVER_PORT` | Porta SSH (opcional) | `22` (padrão) |
| `PROJECT_PATH` | Caminho do projeto no servidor | `/home/ubuntu/souls-hunter-bot` |

### 3. Gerar Chave SSH (se necessário)

```bash
# No seu computador local
ssh-keygen -t rsa -b 4096 -C "seu-email@example.com"

# Copiar chave pública para o servidor
ssh-copy-id usuario@seu-servidor.com

# Copiar chave privada para usar no GitHub Secret
cat ~/.ssh/id_rsa
```

## Configuração do Servidor

### 1. Instalar Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 3. Clonar Repositório no Servidor

```bash
# Navegar para o diretório desejado
cd ~

# Clonar repositório
git clone https://github.com/SEU_USUARIO/souls-hunter-bot.git

# Entrar na pasta
cd souls-hunter-bot

# Instalar dependências
npm install
```

### 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

Adicione:
```env
TOKEN=seu_token_do_bot_aqui
CLIENT_ID=seu_client_id_aqui
```

### 5. Registrar Comandos

```bash
npm run deploy
```

### 6. Iniciar Bot com PM2

```bash
# Iniciar bot
pm2 start index.js --name souls-hunter-bot

# Salvar configuração
pm2 save

# Ver logs
pm2 logs souls-hunter-bot

# Ver status
pm2 status
```

## Deploy Automático

### Como Funciona

1. Você faz push para a branch `main`
2. GitHub Actions detecta o push
3. Workflow de deploy é executado
4. Código é enviado para o servidor via SSH
5. Dependências são instaladas
6. Comandos são registrados
7. Bot é reiniciado com PM2

### Comandos Úteis

```bash
# Ver logs do GitHub Actions
# Vá em: Actions → Deploy Bot → Ver último workflow

# Forçar deploy manual
# Vá em: Actions → Deploy Bot → Run workflow

# Ver logs no servidor
pm2 logs souls-hunter-bot

# Reiniciar bot manualmente
pm2 restart souls-hunter-bot

# Parar bot
pm2 stop souls-hunter-bot

# Ver status
pm2 status
```

## Estrutura de Branches

```
main (produção)
  ↑
  └── dev (desenvolvimento)
       ↑
       └── feature/nova-funcionalidade
```

### Workflow Recomendado

1. Criar branch para nova feature:
```bash
git checkout -b feature/novo-comando
```

2. Fazer alterações e commit:
```bash
git add .
git commit -m "Adiciona novo comando /exemplo"
```

3. Push para o GitHub:
```bash
git push origin feature/novo-comando
```

4. Criar Pull Request no GitHub
5. Após aprovação, merge para `main`
6. Deploy automático é executado

## Monitoramento

### PM2 Monitoring

```bash
# Ver uso de CPU/Memória
pm2 monit

# Ver logs em tempo real
pm2 logs souls-hunter-bot --lines 100

# Ver informações detalhadas
pm2 show souls-hunter-bot
```

### Logs do Bot

```bash
# Ver últimas 50 linhas
pm2 logs souls-hunter-bot --lines 50

# Limpar logs
pm2 flush
```

## Troubleshooting

### Bot não inicia após deploy

```bash
# Verificar logs
pm2 logs souls-hunter-bot --err

# Verificar se .env existe
cat .env

# Reinstalar dependências
npm ci

# Reiniciar
pm2 restart souls-hunter-bot
```

### Deploy falha no GitHub Actions

1. Verificar se todos os Secrets estão configurados
2. Verificar se a chave SSH está correta
3. Verificar se o caminho do projeto está correto
4. Ver logs detalhados no GitHub Actions

### Comandos não aparecem no Discord

```bash
# Registrar comandos novamente
npm run deploy

# Verificar se CLIENT_ID está correto no .env
```

## Backup

### Backup Automático dos Databases

```bash
# Criar script de backup
nano ~/backup-bot.sh
```

Adicione:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/souls-hunter-bot
mkdir -p $BACKUP_DIR
cp -r ~/souls-hunter-bot/databases $BACKUP_DIR/databases_$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Tornar executável
chmod +x ~/backup-bot.sh

# Adicionar ao crontab (backup diário às 3h)
crontab -e
```

Adicione:
```
0 3 * * * ~/backup-bot.sh
```

## Atualizações

### Atualizar Dependências

```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar todas
npm update

# Commit e push
git add package.json package-lock.json
git commit -m "Atualiza dependências"
git push
```

## Segurança

### Checklist de Segurança

- ✅ `.env` está no `.gitignore`
- ✅ `config.json` está no `.gitignore`
- ✅ Databases não são commitados
- ✅ Token do bot não está exposto
- ✅ Chave SSH privada está segura
- ✅ Servidor tem firewall configurado
- ✅ PM2 está configurado para reiniciar automaticamente

### Renovar Token do Bot

1. Ir no [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecionar sua aplicação
3. Bot → Reset Token
4. Atualizar `.env` no servidor
5. Reiniciar bot: `pm2 restart souls-hunter-bot`

## Comandos Rápidos

```bash
# Status do bot
pm2 status

# Logs em tempo real
pm2 logs souls-hunter-bot

# Reiniciar
pm2 restart souls-hunter-bot

# Parar
pm2 stop souls-hunter-bot

# Iniciar
pm2 start souls-hunter-bot

# Ver uso de recursos
pm2 monit

# Atualizar código
cd ~/souls-hunter-bot && git pull && npm ci && pm2 restart souls-hunter-bot
```

## Suporte

Se tiver problemas:

1. Verificar logs: `pm2 logs souls-hunter-bot`
2. Verificar status: `pm2 status`
3. Verificar GitHub Actions: Aba "Actions" no repositório
4. Verificar se o bot está online no Discord

---

**Pronto!** Agora você tem deploy automático configurado. Toda vez que fizer push para `main`, o bot será atualizado automaticamente no servidor! 🚀
