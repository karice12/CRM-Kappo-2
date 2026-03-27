/**
 * LÓGICA DO SISTEMA (app.js)
 */

const Utils = {
  formatCurrency(val) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); },
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  },
  today() { return new Date().toISOString().split('T')[0]; }
};

const App = {
  async init() {
    const user = SessionManager.getUser();
    if (!user) {
      document.getElementById('login-screen').classList.add('active');
      return;
    }

    // Se estiver logado, esconde login e mostra o painel
    document.getElementById('login-screen').classList.remove('active');
    
    // Inicia as páginas (Dashboard por padrão)
    this.loadDashboard();
    this.setupEventListeners();
  },

  async loadDashboard() {
    try {
      const clientes = await DB.getClientes();
      const transacoes = await DB.getTransacoes();
      
      // Atualiza os números no topo do painel
      document.getElementById('count-clientes').innerText = clientes.length;
      
      let total = 0;
      transacoes.forEach(t => {
        if(t.tipo === 'entrada') total += parseFloat(t.valor);
        if(t.tipo === 'saida') total -= parseFloat(t.valor);
      });
      
      document.getElementById('saldo-total').innerText = Utils.formatCurrency(total);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    }
  },

  setupEventListeners() {
    // Botão de Sair
    const btnSair = document.getElementById('btn-logout');
    if(btnSair) btnSair.onclick = () => SessionManager.destroy();
  }
};

// Função de Login acionada pelo botão do HTML
async function realizarLogin() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;

  const sucesso = await DB.login(user, pass);
  
  if (sucesso) {
    // Recarrega a página para o App.init() identificar a nova sessão
    window.location.reload();
  } else {
    alert("Usuário ou senha incorretos! Tente admin / admin123");
  }
}

// Inicializa o sistema ao carregar a página
window.onload = () => App.init();