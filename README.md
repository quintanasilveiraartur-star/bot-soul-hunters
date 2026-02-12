# Souls Hunter Bot

Bot de comunidade para o servidor Souls Hunter com comandos de moderação, diversão, economia e muito mais.

## 🎯 Novidade: Sistema de Conteúdo Dinâmico

O bot agora possui **conteúdo que se atualiza automaticamente a cada 10 minutos**:
- 📚 **90 perguntas de quiz** em 6 categorias
- 💬 **60 frases** variadas (motivacional, engraçada, reflexão)
- 🎭 **112 palavras** para mímica
- 🎮 **25 trabalhos** diferentes
- 🛒 **8 itens** na loja
- 🏷️ **1.760.000+ combinações** de apelidos

Veja mais detalhes em [SISTEMA-DINAMICO.md](SISTEMA-DINAMICO.md)

## 🚀 Deploy Automático

Este bot possui deploy automático configurado com GitHub Actions!

- ✅ Push para `main` = Deploy automático
- ✅ PM2 para gerenciamento de processos
- ✅ Reinício automático em caso de crash
- ✅ Logs centralizados

Veja o guia completo em [DEPLOY.md](DEPLOY.md)

## Recursos

### Moderação
- `/ban` - Bane membros
- `/kick` - Expulsa membros
- `/mute` - Silencia membros
- `/unmute` - Remove silenciamento
- `/warn` - Avisa membros
- `/warnings` - Ver avisos de um membro
- `/clearwarns` - Limpa avisos
- `/clear` - Limpa mensagens

### Diversão
- `/8ball` - Bola mágica
- `/dado` - Rola um dado
- `/roll` - Dados personalizados (ex: 2d6)
- `/coinflip` - Cara ou coroa
- `/ppt` - Pedra, papel, tesoura
- `/adivinhar` - Adivinhe o número
- `/shipar` - Shipa duas pessoas
- `/avaliar` - Avalia algo
- `/porcentagem` - Quanto % você é algo
- `/frase` - 60 frases em 3 tipos (atualizado a cada 10 min)
- `/apelido` - 1.760.000+ combinações (atualizado a cada 10 min)
- `/quiz` - 90 perguntas em 6 categorias (atualizado a cada 10 min)
- `/mimica` - 112 palavras (atualizado a cada 10 min)
- `/escolher` - Escolhe entre opções
- `/tictactoe` - Jogo da velha interativo
- `/blackjack` - Jogo de 21 contra o dealer
- `/slots` - Caça-níqueis

### Economia
- `/daily` - Recompensa diária
- `/weekly` - Recompensa semanal
- `/balance` - Ver saldo
- `/trabalhar` - 25 trabalhos diferentes (atualizado a cada 10 min)
- `/apostar` - Aposta coins
- `/ranking` - Ranking de coins
- `/roubar` - Tenta roubar de alguém
- `/loja` - 8 itens disponíveis (atualizado a cada 10 min)
- `/comprar` - Compra itens (1-8)
- `/inventario` - Ver seus itens

### Social
- `/casar` - Pede em casamento
- `/divorciar` - Divorcia-se
- `/perfil` - Ver perfil completo
- `/duelo` - Desafia para duelo
- `/afk` - Marca como ausente
- `/sugerir` - Envia sugestão

### Info
- `/rank` - Ver nível e XP
- `/leaderboard` - Ranking de XP
- `/avatar` - Mostra avatar
- `/serverinfo` - Info do servidor
- `/userinfo` - Info de usuário
- `/stats` - Estatísticas completas

### Utilidades
- `/lembrar` - Define lembretes

### Admin
- `/painel` - Painel de configuração

## Instalação Local

1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/souls-hunter-bot.git
cd souls-hunter-bot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o `.env`:
```env
TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
```

4. Registre os comandos:
```bash
npm run deploy
```

5. Inicie o bot:
```bash
npm start
```

## Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## Deploy em Produção

Veja o guia completo de deploy em [DEPLOY.md](DEPLOY.md)

Comandos rápidos:
```bash
# Iniciar com PM2
npm run pm2

# Ver logs
npm run pm2:logs

# Reiniciar
npm run pm2:restart

# Parar
npm run pm2:stop
```

## Estrutura

```
src/
├── commands/       # Comandos organizados por categoria
│   ├── admin/
│   ├── moderacao/
│   ├── diversao/
│   ├── economia/
│   ├── social/
│   ├── info/
│   └── utilidades/
├── events/         # Eventos do Discord
├── handlers/       # Handlers de botões e selects
└── utils/          # Utilitários e helpers

databases/          # Arquivos JSON de dados
.github/            # GitHub Actions workflows
```

## Tecnologias

- Node.js 18+
- Discord.js v14
- Sistema de database em JSON com cache
- PM2 para gerenciamento de processos
- GitHub Actions para CI/CD

## Documentação

- [SISTEMA-DINAMICO.md](SISTEMA-DINAMICO.md) - Sistema de conteúdo dinâmico
- [DEPLOY.md](DEPLOY.md) - Guia completo de deploy
- [IDEIAS-FUTURAS.md](IDEIAS-FUTURAS.md) - 45 ideias para expansão
- [REFATORACAO.md](REFATORACAO.md) - Histórico de refatoração

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## Licença

MIT

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato no Discord.

---

Desenvolvido com ❤️ para o servidor Souls Hunter
