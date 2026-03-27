const Utils = {
  formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }
};

const Toast = {
  success(msg) { alert(msg); },
  error(msg) { alert(msg); }
};

const Modal = {
  open(id) { document.getElementById(id)?.classList.remove('hidden'); },
  close(id) { document.getElementById(id)?.classList.add('hidden'); }
};

const App = {
  init() {
    const session = SessionManager.verify();
    if (session) this.showApp(session.sub);
    this.bindEvents();
  },

  showApp(user) {
    document.getElementById('login-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    document.getElementById('sidebar-username').innerText = user;
    this.loadView('dashboard');
  },

  bindEvents() {
    // LOGIN
    document.getElementById('btn-login')?.addEventListener('click', async () => {
      const user = document.getElementById('login-user').value;
      const pass = document.getElementById('login-pass').value;

      const ok = await DB.login(user, pass);

      if (ok) this.showApp(user);
      else Toast.error("Login inválido");
    });

    // MENU
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        if (link.id === 'btn-logout') {
          SessionManager.destroy();
          location.reload();
          return;
        }

        const page = link.getAttribute('data-page');
        if (page) this.loadView(page);
      });
    });

    // BOTÃO NOVO CLIENTE
    document.getElementById('btn-novo-cliente')?.addEventListener('click', () => {
      Modal.open('modal-cliente');
    });

    // SALVAR CLIENTE
    document.getElementById('btn-save-cliente')?.addEventListener('click', async () => {
      const nome = document.getElementById('cli-nome').value;

      if (!nome) {
        Toast.error("Nome obrigatório");
        return;
      }

      const dados = {
        nome,
        whatsapp: document.getElementById('cli-whatsapp').value,
        dia_vencimento: parseInt(document.getElementById('cli-vencimento').value) || 10,
        valor_mensal: parseFloat(document.getElementById('cli-valor').value) || 0,
        status: 'ativo'
      };

      const res = await DB.salvarCliente(dados);

      if (res) {
        Toast.success("Salvo!");
        Modal.close('modal-cliente');
        this.loadClientes();
        this.updateDashboard();
      }
    });
  },

  navigate(page) {
    this.loadView(page);
  },

  loadView(view) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${view}`)?.classList.add('active');

    if (view === 'dashboard') this.updateDashboard();
    if (view === 'clientes') this.loadClientes();
  },

  async loadClientes() {
    const tbody = document.getElementById('tbody-clientes');
    if (!tbody) return;

    tbody.innerHTML = "Carregando...";

    const clientes = await DB.getClientes();

    if (!clientes || clientes.length === 0) {
      tbody.innerHTML = "Nenhum cliente";
      return;
    }

    tbody.innerHTML = clientes.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.whatsapp || '-'}</td>
        <td>${c.email || '-'}</td>
        <td>${c.dia_vencimento}</td>
        <td>${Utils.formatCurrency(c.valor_mensal)}</td>
        <td>${c.status}</td>
      </tr>
    `).join('');
  },

  async updateDashboard() {
    const clientes = await DB.getClientes();
    document.getElementById('val-clientes').innerText = clientes?.length || 0;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());