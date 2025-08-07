import { db } from './firebase-init.js';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- CONFIGURAÇÃO ---
const SENHA_CORRETA = 'YunaCliente2024';

// --- ELEMENTOS DO DOM ---
const loginContainer = document.getElementById('login-container');
const resultsContainer = document.getElementById('results-container');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// --- LÓGICA DE AUTENTICAÇÃO ---

// Verifica se o usuário já está logado na sessão
if (sessionStorage.getItem('isLoggedIn') === 'true') {
    mostrarResultados();
}

loginButton.addEventListener('click', () => {
    if (passwordInput.value === SENHA_CORRETA) {
        sessionStorage.setItem('isLoggedIn', 'true');
        mostrarResultados();
    } else {
        errorMessage.style.display = 'block';
    }
});

logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    loginContainer.style.display = 'flex';
    resultsContainer.style.display = 'none';
    passwordInput.value = '';
});

function mostrarResultados() {
    loginContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    carregarDados();
}

// --- LÓGICA DE CARREGAMENTO DE DADOS ---

function carregarDados() {
    // Carrega dados dos Profissionais
    const qProfissionais = query(collection(db, "respostas-profissionais"), orderBy("timestamp", "desc"));
    onSnapshot(qProfissionais, (snapshot) => {
        const respostas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarEstatisticasProfissionais(respostas);
        renderizarTabela(respostas, 'table-head-profissionais', 'table-body-profissionais');
    });

    // Carrega dados dos Professores
    const qProfessores = query(collection(db, "respostas-professores"), orderBy("timestamp", "desc"));
    onSnapshot(qProfessores, (snapshot) => {
        const respostas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarEstatisticasProfessores(respostas);
        renderizarTabela(respostas, 'table-head-professores', 'table-body-professores');
    });
}

// --- RENDERIZAÇÃO DAS ESTATÍSTICAS ---

function renderizarEstatisticasProfissionais(respostas) {
    const container = document.getElementById('stats-profissionais');
    if (!respostas || respostas.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma resposta ainda.</p>';
        return;
    }

    let html = '';
    // Card: Total de Respostas
    html += criarCardTotal(respostas.length);
    // Card: Área de Atuação (q1)
    html += criarCardDistribuicao(respostas, 'q1', 'Área de Atuação');
    // Card: Tempo de Experiência (q2)
    html += criarCardDistribuicao(respostas, 'q2', 'Tempo de Experiência com TEA');

    container.innerHTML = html;
}

function renderizarEstatisticasProfessores(respostas) {
    const container = document.getElementById('stats-professores');
     if (!respostas || respostas.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma resposta ainda.</p>';
        return;
    }
    
    let html = '';
    // Card: Total de Respostas
    html += criarCardTotal(respostas.length);
    // Card: Já trabalhou com TEA? (q1)
    html += criarCardDistribuicao(respostas, 'q1', 'Já trabalhou com TEA?');
     // Card: Tem crianças com TEA na turma? (q2)
    html += criarCardDistribuicao(respostas, 'q2', 'Tem crianças com TEA na turma?');

    container.innerHTML = html;
}


// --- FUNÇÕES AUXILIARES DE ESTATÍSTICAS ---

function criarCardTotal(total) {
    return `
        <div class="stat-card">
            <h5>Total de Respostas</h5>
            <p class="total-count">${total}</p>
        </div>
    `;
}

function criarCardDistribuicao(respostas, chave, titulo) {
    const contagem = {};
    respostas.forEach(r => {
        const valor = r[chave] || 'Não respondido';
        contagem[valor] = (contagem[valor] || 0) + 1;
    });

    let itensHtml = '';
    for (const [opcao, qtd] of Object.entries(contagem)) {
        const percentual = ((qtd / respostas.length) * 100).toFixed(1);
        itensHtml += `
            <li>
                <span>${opcao.replace(/_/g, ' ')}</span>
                <strong>${qtd} (${percentual}%)</strong>
            </li>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${percentual}%;" aria-valuenow="${percentual}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;
    }

    return `
        <div class="stat-card">
            <h5>${titulo}</h5>
            <ul>${itensHtml}</ul>
        </div>
    `;
}


// --- RENDERIZAÇÃO DA TABELA DETALHADA ---

function renderizarTabela(respostas, idHead, idBody) {
    const thead = document.getElementById(idHead);
    const tbody = document.getElementById(idBody);

    if (!respostas || respostas.length === 0) {
        thead.innerHTML = '';
        tbody.innerHTML = '<tr><td colspan="99" class="text-center">Nenhuma resposta para exibir.</td></tr>';
        return;
    }

    // Criar cabeçalho dinamicamente
    const headers = Object.keys(respostas[0]);
    // Excluir 'id' do cabeçalho
    const filteredHeaders = headers.filter(h => h !== 'id');
    thead.innerHTML = `<tr><th>${filteredHeaders.join('</th><th>')}</th></tr>`;

    // Preencher corpo da tabela
    let bodyHtml = '';
    respostas.forEach(resposta => {
        bodyHtml += '<tr>';
        filteredHeaders.forEach(header => {
            let valor = resposta[header];
            // Formatar timestamp
            if (header === 'timestamp' && valor && typeof valor.toDate === 'function') {
                valor = valor.toDate().toLocaleString('pt-BR');
            }
            bodyHtml += `<td>${valor || ''}</td>`;
        });
        bodyHtml += '</tr>';
    });

    tbody.innerHTML = bodyHtml;
}
