/* ──────────────────────────────────────────────
   CONFIGURAÇÃO DO BANCO DE DADOS (db.js)
   ────────────────────────────────────────────── */
const SUPABASE_CONFIG = {
  // 1. Substitua pelo link do seu projeto no Supabase
  url: 'https://qvromhtadqksiylgotrq.supabase.co', 
  // 2. Substitua pela sua "anon public key" (aquela que começa com ey...)
  key: 'sb_publishable_5LNpGfaW6hqb7jXLaA4CQw_2QalW4x_' 
};

const SupabaseClient = {
  url: SUPABASE_CONFIG.url.replace(/\/$/, ''),
  key: SUPABASE_CONFIG.key,
  
  async request(method, table, data = null, query = '') {
    const endpoint = `${this.url}/rest/v1/${table}${query}`;
    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });
      if (!res.ok) throw new Error(`Erro: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error("Erro na comunicação com o banco:", err);
      return [];
    }
  }
};

const SessionManager = {
  TOKEN_KEY: '_kappo_session',
  create(user) {
    const data = { sub: user, exp: Date.now() + (8 * 60 * 60 * 1000) };
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(data));
  },
  getUser() {
    const session = localStorage.getItem(this.TOKEN_KEY);
    if (!session) return null;
    const data = JSON.parse(session);
    if (Date.now() > data.exp) {
      this.destroy();
      return null;
    }
    return data.sub;
  },
  destroy() {
    localStorage.removeItem(this.TOKEN_KEY);
    window.location.reload();
  }
};

const DB = {
  // Login fixo para facilitar seu acesso inicial
  async login(user, pass) {
    if (user === 'admin' && pass === 'admin123') {
      SessionManager.create(user);
      return true;
    }
    return false;
  },

  async getClientes() {
    return await SupabaseClient.request('GET', 'clientes', null, '?order=nome.asc');
  },

  async salvarCliente(dados) {
    return await SupabaseClient.request('POST', 'clientes', dados);
  },

  async getTransacoes() {
    return await SupabaseClient.request('GET', 'financeiro', null, '?order=data.desc');
  },

  async salvarTransacao(dados) {
    return await SupabaseClient.request('POST', 'financeiro', dados);
  }
};