# ⚡ Configurar Deploy Automático - Passo a Passo

## 🎯 O que vai acontecer depois de configurar:

1. Você faz `git push` no seu PC
2. GitHub Actions detecta automaticamente
3. Conecta no servidor Campos via SSH
4. Faz `git pull` lá
5. Instala dependências
6. Reinicia o bot com PM2
7. **TUDO AUTOMÁTICO!** 🚀

---

## 📋 Passo 1: Pegar Informações da Campos

Você precisa de:

### 1.1 IP/Domínio do Servidor
- Acesse o painel da Campos
- Copie o IP ou domínio do servidor
- Exemplo: `123.456.789.0` ou `servidor.campos.host`

### 1.2 Usuário SSH
- Geralmente é: `root` ou o usuário que você usa para conectar
- Exemplo: `root`

### 1.3 Porta SSH
- Geralmente é: `22`
- Se a Campos usar outra porta, anote

### 1.4 Caminho do Projeto
- Onde o bot está instalado no servidor
- Exemplo: `/root/bot-soul-hunters` ou `/home/usuario/bot-soul-hunters`

---

## 🔐 Passo 2: Configurar Chave SSH

### 2.1 Gerar Chave SSH (no seu PC)

Abra o Git Bash ou PowerShell e execute:

```bash
ssh-keygen -t rsa -b 4096 -C "quintanasilveiraartur@gmail.com"
```

Pressione **Enter** 3 vezes (sem senha)

### 2.2 Copiar Chave Pública para o Servidor

```bash
# Substitua com suas informações:
ssh-copy-id usuario@ip-do-servidor

# Exemplo:
ssh-copy-id root@123.456.789.0
```

Digite a senha do servidor quando pedir.

### 2.3 Copiar Chave Privada

```bash
cat ~/.ssh/id_rsa
```

Copie **TUDO** que aparecer (incluindo as linhas BEGIN e END):
```
-----BEGIN OPENSSH PRIVATE KEY-----
...todo o conteúdo...
-----END OPENSSH PRIVATE KEY-----
```

---

## 🔑 Passo 3: Adicionar Secrets no GitHub

### 3.1 Acesse a página de Secrets:

👉 https://github.com/quintanasilveiraartur-star/bot-soul-hunters/settings/secrets/actions

### 3.2 Clique em "New repository secret" e adicione:

#### Secret 1: SERVER_HOST
- **Name:** `SERVER_HOST`
- **Value:** IP ou domínio do servidor Campos
- Exemplo: `123.456.789.0`

#### Secret 2: SERVER_USER
- **Name:** `SERVER_USER`
- **Value:** Usuário SSH
- Exemplo: `root`

#### Secret 3: SSH_PRIVATE_KEY
- **Name:** `SSH_PRIVATE_KEY`
- **Value:** Cole a chave privada completa (do passo 2.3)

#### Secret 4: PROJECT_PATH
- **Name:** `PROJECT_PATH`
- **Value:** Caminho completo do projeto no servidor
- Exemplo: `/root/bot-soul-hunters`

#### Secret 5: SERVER_PORT (opcional)
- **Name:** `SERVER_PORT`
- **Value:** `22`
- Só adicione se usar porta diferente

---

## ✅ Passo 4: Testar Deploy Automático

### Opção 1: Fazer um Push
```bash
# No seu PC
git add .
git commit -m "Teste de deploy automático"
git push
```

### Opção 2: Trigger Manual
1. Vá em: https://github.com/quintanasilveiraartur-star/bot-soul-hunters/actions
2. Clique em **"Deploy Bot"**
3. Clique em **"Run workflow"**
4. Selecione **"main"**
5. Clique em **"Run workflow"**

### Acompanhar o Deploy
- Vá em: https://github.com/quintanasilveiraartur-star/bot-soul-hunters/actions
- Você verá o deploy acontecendo em tempo real
- ✅ Verde = Sucesso
- ❌ Vermelho = Erro (clique para ver o log)

---

## 🎉 Pronto!

Agora toda vez que você fizer `git push`, o bot reinicia automaticamente na Campos!

---

## 🆘 Problemas Comuns

### Erro: "Permission denied (publickey)"
- Verifique se copiou a chave SSH correta
- Rode novamente: `ssh-copy-id usuario@servidor`

### Erro: "Directory not found"
- Verifique se o `PROJECT_PATH` está correto
- Conecte no servidor e confirme o caminho: `pwd`

### Erro: "pm2 command not found"
- Instale PM2 no servidor: `npm install -g pm2`

### Bot não reinicia
- Conecte no servidor e veja os logs: `pm2 logs souls-hunter-bot`

---

**Precisa de ajuda?** Me chama que eu te ajudo! 🚀
