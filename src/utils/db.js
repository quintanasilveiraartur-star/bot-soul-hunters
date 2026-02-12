const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../databases');

// Garante que a pasta existe
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

class Database {
  constructor(filename) {
    this.file = path.join(DB_PATH, filename);
    this.cache = null;
    this.lastRead = 0;
    this.CACHE_TTL = 5000; // 5 segundos de cache
  }

  read() {
    const now = Date.now();
    
    // Usa cache se ainda válido
    if (this.cache && (now - this.lastRead) < this.CACHE_TTL) {
      return this.cache;
    }

    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, '{}');
      this.cache = {};
      this.lastRead = now;
      return {};
    }

    try {
      const data = fs.readFileSync(this.file, 'utf8');
      this.cache = JSON.parse(data);
      this.lastRead = now;
      return this.cache;
    } catch (err) {
      console.error(`Erro ao ler ${this.file}:`, err.message);
      return {};
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
      this.cache = data;
      this.lastRead = Date.now();
      return true;
    } catch (err) {
      console.error(`Erro ao escrever ${this.file}:`, err.message);
      return false;
    }
  }

  get(key) {
    const data = this.read();
    return data[key];
  }

  set(key, value) {
    const data = this.read();
    data[key] = value;
    return this.write(data);
  }

  delete(key) {
    const data = this.read();
    delete data[key];
    return this.write(data);
  }

  has(key) {
    const data = this.read();
    return key in data;
  }

  // Limpa cache manualmente se necessário
  clearCache() {
    this.cache = null;
    this.lastRead = 0;
  }
}

// Instâncias dos databases
const guilds = new Database('guild_config.json');
const economy = new Database('economy.json');
const xp = new Database('xp.json');
const warnings = new Database('warnings.json');
const mutes = new Database('mutes.json');
const marriages = new Database('marriage.json');
const inventory = new Database('inventory.json');
const afk = new Database('afk.json');

module.exports = {
  guilds,
  economy,
  xp,
  warnings,
  mutes,
  marriages,
  inventory,
  afk,
  Database
};
