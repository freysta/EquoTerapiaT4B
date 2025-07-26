// Script para o formulário dos profissionais
console.log('Script do formulário dos profissionais carregado com sucesso!');

// Configuração do Google Sheets (substitua pela sua URL do Google Apps Script)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Elementos do DOM
const form = document.getElementById('profissionaisForm');
const loadingDiv = document.getElementById('loading');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Função para mostrar/esconder mensagens
function showMessage(element) {
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Função para validar o formulário
function validateForm(formData) {
    const requiredFields = [
        'areaAtuacao',
        'tempoExperiencia',
        'impactoFamiliar',
        'colaboracao'
    ];

    for (let field of requiredFields) {
        if (!formData.get(field)) {
            return false;
        }
    }

    // Validações específicas
    if (formData.get('areaAtuacao') === 'outro' && !formData.get('outroAreaEspecificar')) {
        return false;
    }

    if (formData.get('colaboracao') === 'outro-colaboracao' && !formData.get('outroColaboracaoEspecificar')) {
        return false;
    }

    return true;
}

// Função para enviar dados para o Google Sheets
async function sendToGoogleSheets(formData) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });

        return true; // Como é no-cors, assumimos sucesso se não houver erro
    } catch (error) {
        console.error('Erro ao enviar para Google Sheets:', error);
        return false;
    }
}

// Função para salvar dados localmente como backup
function saveLocalBackup(formData) {
    const timestamp = new Date().toISOString();
    const backupData = {
        timestamp: timestamp,
        formType: 'profissionais',
        data: Object.fromEntries(formData)
    };
    
    try {
        const existingBackups = JSON.parse(localStorage.getItem('formBackups') || '[]');
        existingBackups.push(backupData);
        localStorage.setItem('formBackups', JSON.stringify(existingBackups));
        console.log('Backup local salvo com sucesso');
    } catch (error) {
        console.error('Erro ao salvar backup local:', error);
    }
}

// Event listener para o envio do formulário
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Mostrar loading
    loadingDiv.style.display = 'block';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Coletar dados do formulário
    const formData = new FormData(form);
    
    // Adicionar timestamp
    formData.append('timestamp', new Date().toISOString());
    formData.append('formType', 'profissionais');
    
    // Validar formulário
    if (!validateForm(formData)) {
        loadingDiv.style.display = 'none';
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    try {
        // Salvar backup local
        saveLocalBackup(formData);
        
        // Tentar enviar para Google Sheets
        const success = await sendToGoogleSheets(formData);
        
        loadingDiv.style.display = 'none';
        
        if (success) {
            showMessage(successMessage);
            form.reset();
            
            // Scroll para o topo
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            showMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Erro no envio:', error);
        loadingDiv.style.display = 'none';
        showMessage(errorMessage);
    }
});

// Função para formatar dados para exibição
function formatFormData(formData) {
    const data = Object.fromEntries(formData);
    
    // Formatações específicas
    const areaAtuacaoMap = {
        'psicologia': 'Psicologia',
        'fonoaudiologia': 'Fonoaudiologia',
        'terapia-ocupacional': 'Terapia Ocupacional',
        'pedagogia': 'Pedagogia',
        'fisioterapia': 'Fisioterapia',
        'outro': data.outroAreaEspecificar || 'Outro'
    };
    
    const tempoExperienciaMap = {
        'menos-1-ano': 'Menos de 1 ano',
        '1-3-anos': 'De 1 a 3 anos',
        '4-6-anos': 'De 4 a 6 anos',
        'mais-6-anos': 'Mais de 6 anos'
    };
    
    const impactoFamiliarMap = {
        'sim': 'Sim',
        'nao': 'Não',
        'em-parte': 'Em parte'
    };
    
    const colaboracaoMap = {
        'reunioes-periodicas': 'Através de reuniões periódicas',
        'acompanhamento-integrado': 'Acompanhamento multidisciplinar integrado',
        'comunicacao-pontual': 'Comunicação pontual entre áreas',
        'outro-colaboracao': data.outroColaboracaoEspecificar || 'Outro'
    };
    
    return {
        ...data,
        areaAtuacaoFormatted: areaAtuacaoMap[data.areaAtuacao] || data.areaAtuacao,
        tempoExperienciaFormatted: tempoExperienciaMap[data.tempoExperiencia] || data.tempoExperiencia,
        impactoFamiliarFormatted: impactoFamiliarMap[data.impactoFamiliar] || data.impactoFamiliar,
        colaboracaoFormatted: colaboracaoMap[data.colaboracao] || data.colaboracao
    };
}

// Função para gerar relatório dos dados coletados
function generateReport() {
    const backups = JSON.parse(localStorage.getItem('formBackups') || '[]');
    const profissionaisData = backups.filter(backup => backup.formType === 'profissionais');
    
    if (profissionaisData.length === 0) {
        console.log('Nenhum dado de profissionais encontrado');
        return;
    }
    
    console.log(`Relatório de Formulários dos Profissionais (${profissionaisData.length} respostas):`);
    
    profissionaisData.forEach((backup, index) => {
        console.log(`\n--- Resposta ${index + 1} (${new Date(backup.timestamp).toLocaleString()}) ---`);
        const formatted = formatFormData(new FormData(Object.entries(backup.data)));
        console.log('Área de Atuação:', formatted.areaAtuacaoFormatted);
        console.log('Tempo de Experiência:', formatted.tempoExperienciaFormatted);
        console.log('Impacto Familiar:', formatted.impactoFamiliarFormatted);
        console.log('Colaboração:', formatted.colaboracaoFormatted);
    });
}

// Disponibilizar função globalmente para debug
window.generateProfissionaisReport = generateReport;

// Função para limpar dados locais (apenas para desenvolvimento)
window.clearProfissionaisData = function() {
    const backups = JSON.parse(localStorage.getItem('formBackups') || '[]');
    const filteredBackups = backups.filter(backup => backup.formType !== 'profissionais');
    localStorage.setItem('formBackups', JSON.stringify(filteredBackups));
    console.log('Dados dos profissionais limpos do localStorage');
};

// Auto-save (salvar rascunho automaticamente)
let autoSaveTimeout;
const formInputs = form.querySelectorAll('input, select, textarea');

formInputs.forEach(input => {
    input.addEventListener('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            const formData = new FormData(form);
            const draftData = Object.fromEntries(formData);
            localStorage.setItem('profissionaisDraft', JSON.stringify(draftData));
            console.log('Rascunho salvo automaticamente');
        }, 2000); // Salva após 2 segundos de inatividade
    });
});

// Carregar rascunho ao carregar a página
window.addEventListener('load', function() {
    const draft = localStorage.getItem('profissionaisDraft');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            
            // Perguntar se o usuário quer carregar o rascunho
            if (confirm('Encontramos um rascunho salvo. Deseja carregá-lo?')) {
                Object.keys(draftData).forEach(key => {
                    const element = form.querySelector(`[name="${key}"]`);
                    if (element) {
                        if (element.type === 'radio') {
                            const radio = form.querySelector(`[name="${key}"][value="${draftData[key]}"]`);
                            if (radio) radio.checked = true;
                        } else {
                            element.value = draftData[key];
                        }
                    }
                });
                
                // Trigger change events para mostrar campos condicionais
                formInputs.forEach(input => {
                    if (input.checked || input.value) {
                        input.dispatchEvent(new Event('change'));
                    }
                });
                
                console.log('Rascunho carregado com sucesso');
            } else {
                localStorage.removeItem('profissionaisDraft');
            }
        } catch (error) {
            console.error('Erro ao carregar rascunho:', error);
            localStorage.removeItem('profissionaisDraft');
        }
    }
});

// Limpar rascunho quando o formulário for enviado com sucesso
form.addEventListener('submit', function() {
    // Aguardar um pouco para garantir que o envio foi bem-sucedido
    setTimeout(() => {
        if (successMessage.style.display === 'block') {
            localStorage.removeItem('profissionaisDraft');
            console.log('Rascunho removido após envio bem-sucedido');
        }
    }, 1000);
});

// Validação em tempo real
formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });
    
    input.addEventListener('input', function() {
        if (this.classList.contains('is-invalid') && this.value) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });
});

console.log('Script do formulário dos profissionais inicializado com sucesso!');
