const SUPABASE_CONFIG = {
  url: 'https://qvromhtadqksiylgotrq.supabase.co',
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

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro Supabase:", text);
        throw new Error(text);
      }

      return await res.json();
    } catch (err) {
      console.error("Erro:", err);
      if (window.Toast) Toast.error("Erro ao conectar com banco");
      return null;
    }
  }
};

const DB = {
  async login(user, pass) {
    if (user === 'admin' && pass === 'admin123') {
      SessionManager.create(user);
      return true;
    }
    return false;
  },

  async getClientes() {
    return await SupabaseClient.request('GET', 'clientes', null, '?select=*');
  },

  async salvarCliente(dados) {
    return await SupabaseClient.request('POST', 'clientes', dados);
  },

  async getTransacoes() {
    return await SupabaseClient.request('GET', 'fluxo_caixa', null, '?select=*');
  },

  async salvarTransacao(dados) {
    return await SupabaseClient.request('POST', 'fluxo_caixa', dados);
  }
};

const SessionManager = {
  TOKEN_KEY: '_kappo_session',
  create(user) {
    const data = { sub: user, exp: Date.now() + (8 * 60 * 60 * 1000) };
    localStorage.setItem(this.TOKEN_KEY, btoa(JSON.stringify(data)));
  },
  verify() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    const p = JSON.parse(atob(token));
    return (Date.now() < p.exp) ? p : null;
  },
  destroy() {
    localStorage.removeItem(this.TOKEN_KEY);
  }
};