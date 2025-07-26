// Script para o formulário dos pacientes - Ecoterapia T4B
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pacienteForm');
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // URL do Google Apps Script (será fornecida após configuração)
    // Substitua pela URL do seu Google Apps Script Web App
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec';

    // Função para mostrar/esconder elementos
    function showElement(element) {
        element.style.display = 'block';
    }

    function hideElement(element) {
        element.style.display = 'none';
    }

    // Função para limpar mensagens
    function clearMessages() {
        hideElement(loading);
        hideElement(successMessage);
        hideElement(errorMessage);
    }

    // Validação personalizada
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            } else {
                field.style.borderColor = '#27ae60';
            }
        });

        // Validação específica para email (se preenchido)
        const email = document.getElementById('email');
        if (email.value && !isValidEmail(email.value)) {
            email.style.borderColor = '#e74c3c';
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = email;
            }
        }

        // Validação específica para telefone
        const telefone = document.getElementById('telefone');
        if (telefone.value && !isValidPhone(telefone.value)) {
            telefone.style.borderColor = '#e74c3c';
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = telefone;
            }
        }

        // Validação para pelo menos um dia da semana selecionado
        const diasSelecionados = form.querySelectorAll('input[name="diasDisponiveis"]:checked');
        if (diasSelecionados.length === 0) {
            const diasContainer = form.querySelector('input[name="diasDisponiveis"]').closest('.form-group');
            diasContainer.style.borderLeft = '4px solid #e74c3c';
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = diasContainer;
            }
        } else {
            const diasContainer = form.querySelector('input[name="diasDisponiveis"]').closest('.form-group');
            diasContainer.style.borderLeft = '4px solid #27ae60';
        }

        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    // Função para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Função para validar telefone
    function isValidPhone(phone) {
        const phoneRegex = /^[\d\s\(\)\-\+]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Função para coletar dados do formulário
    function collectFormData() {
        const formData = new FormData(form);
        const data = {};

        // Coletar todos os campos do formulário
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Se já existe, transformar em array (para checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Tratar dias disponíveis (checkboxes)
        const diasDisponiveis = [];
        const checkboxes = form.querySelectorAll('input[name="diasDisponiveis"]:checked');
        checkboxes.forEach(checkbox => {
            diasDisponiveis.push(checkbox.value);
        });
        data.diasDisponiveis = diasDisponiveis.join(', ');

        // Adicionar timestamp
        data.timestamp = new Date().toLocaleString('pt-BR');
        data.tipoFormulario = 'paciente';

        return data;
    }

    // Função para enviar dados para o Google Sheets
    async function sendToGoogleSheets(data) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // Como estamos usando no-cors, não podemos verificar a resposta
            // Assumimos sucesso se não houver erro
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar para Google Sheets:', error);
            return { success: false, error: error.message };
        }
    }

    // Função alternativa usando Google Forms (mais simples)
    function sendToGoogleForm(data) {
        // Esta é uma alternativa mais simples usando Google Forms
        // Você precisará criar um Google Form e pegar a URL de submissão
        
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/SEU_FORM_ID_PACIENTE/formResponse';
        
        // Mapeamento dos campos do formulário para os IDs do Google Forms
        const formMapping = {
            'entry.111111111': data.nomeCompleto,
            'entry.222222222': data.idade,
            'entry.333333333': data.genero,
            'entry.444444444': data.telefone,
            'entry.555555555': data.email,
            'entry.666666666': data.motivacao,
            'entry.777777777': data.nivelEstresse,
            'entry.888888888': data.nivelAnsiedade,
            // Adicione mais mapeamentos conforme necessário
        };

        const formData = new FormData();
        Object.keys(formMapping).forEach(key => {
            if (formMapping[key]) {
                formData.append(key, formMapping[key]);
            }
        });

        return fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
    }

    // Event listener para o envio do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        clearMessages();

        // Validar formulário
        if (!validateForm()) {
            showElement(errorMessage);
            errorMessage.innerHTML = '<strong>❌ Erro!</strong> Por favor, preencha todos os campos obrigatórios corretamente e selecione pelo menos um dia da semana.';
            return;
        }

        // Mostrar loading
        showElement(loading);

        try {
            // Coletar dados
            const formData = collectFormData();
            
            // Enviar para Google Sheets
            const result = await sendToGoogleSheets(formData);
            
            hideElement(loading);

            if (result.success) {
                showElement(successMessage);
                form.reset();
                
                // Resetar estilos dos checkboxes
                const diasContainer = form.querySelector('input[name="diasDisponiveis"]').closest('.form-group');
                diasContainer.style.borderLeft = '';
                
                // Scroll para a mensagem de sucesso
                successMessage.scrollIntoView({ behavior: 'smooth' });
                
                // Opcional: redirecionar após alguns segundos
                setTimeout(() => {
                    // window.location.href = 'index.html';
                }, 3000);
            } else {
                throw new Error(result.error || 'Erro desconhecido');
            }

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            hideElement(loading);
            showElement(errorMessage);
            errorMessage.innerHTML = '<strong>❌ Erro!</strong> Ocorreu um erro ao enviar o formulário. Tente novamente em alguns instantes.';
        }
    });

    // Validação em tempo real para campos obrigatórios
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#27ae60';
            } else {
                this.style.borderColor = '#e74c3c';
            }
        });

        field.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)' && this.value.trim()) {
                this.style.borderColor = '#27ae60';
            }
        });
    });

    // Validação específica para email
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = '#e74c3c';
            } else if (this.value) {
                this.style.borderColor = '#27ae60';
            }
        });
    }

    // Validação específica para telefone
    const phoneField = document.getElementById('telefone');
    phoneField.addEventListener('blur', function() {
        if (this.value && !isValidPhone(this.value)) {
            this.style.borderColor = '#e74c3c';
        } else if (this.value) {
            this.style.borderColor = '#27ae60';
        }
    });

    // Formatação automática do telefone
    phoneField.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                this.value = value;
            } else if (value.length <= 7) {
                this.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else {
                this.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        } else {
            this.value = this.value.slice(0, -1);
        }
    });

    // Validação para checkboxes dos dias da semana
    const diasCheckboxes = form.querySelectorAll('input[name="diasDisponiveis"]');
    diasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const diasSelecionados = form.querySelectorAll('input[name="diasDisponiveis"]:checked');
            const diasContainer = form.querySelector('input[name="diasDisponiveis"]').closest('.form-group');
            
            if (diasSelecionados.length > 0) {
                diasContainer.style.borderLeft = '4px solid #27ae60';
            } else {
                diasContainer.style.borderLeft = '4px solid #e74c3c';
            }
        });
    });

    // Funcionalidade para melhorar UX com textareas
    const textareas = form.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            // Auto-resize textarea
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Contador de caracteres para textareas importantes
        if (textarea.id === 'motivacao' || textarea.id === 'objetivos') {
            const maxLength = 500;
            textarea.setAttribute('maxlength', maxLength);
            
            const counter = document.createElement('div');
            counter.style.fontSize = '0.8rem';
            counter.style.color = '#666';
            counter.style.textAlign = 'right';
            counter.style.marginTop = '5px';
            
            textarea.parentNode.appendChild(counter);
            
            function updateCounter() {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${remaining} caracteres restantes`;
                
                if (remaining < 50) {
                    counter.style.color = '#e74c3c';
                } else if (remaining < 100) {
                    counter.style.color = '#f39c12';
                } else {
                    counter.style.color = '#666';
                }
            }
            
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    });

    // Funcionalidade para salvar rascunho no localStorage
    function saveFormDraft() {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Salvar checkboxes
        const diasSelecionados = [];
        const checkboxes = form.querySelectorAll('input[name="diasDisponiveis"]:checked');
        checkboxes.forEach(checkbox => {
            diasSelecionados.push(checkbox.value);
        });
        data.diasDisponiveis = diasSelecionados;
        
        localStorage.setItem('ecoterapia_paciente_draft', JSON.stringify(data));
    }

    function loadFormDraft() {
        const draft = localStorage.getItem('ecoterapia_paciente_draft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                
                // Preencher campos
                Object.keys(data).forEach(key => {
                    if (key === 'diasDisponiveis') {
                        // Tratar checkboxes
                        data[key].forEach(dia => {
                            const checkbox = form.querySelector(`input[name="diasDisponiveis"][value="${dia}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    } else {
                        const field = form.querySelector(`[name="${key}"]`);
                        if (field) field.value = data[key];
                    }
                });
                
                console.log('Rascunho carregado');
            } catch (error) {
                console.error('Erro ao carregar rascunho:', error);
            }
        }
    }

    // Salvar rascunho a cada 30 segundos
    setInterval(saveFormDraft, 30000);

    // Salvar rascunho quando sair da página
    window.addEventListener('beforeunload', saveFormDraft);

    // Carregar rascunho ao inicializar
    loadFormDraft();

    // Limpar rascunho após envio bem-sucedido
    form.addEventListener('submit', function() {
        setTimeout(() => {
            if (successMessage.style.display === 'block') {
                localStorage.removeItem('ecoterapia_paciente_draft');
            }
        }, 1000);
    });

    console.log('Script do formulário dos pacientes carregado com sucesso!');
});

// Função para debug - remover em produção
function debugFormData() {
    const form = document.getElementById('pacienteForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    // Tratar dias disponíveis
    const diasDisponiveis = [];
    const checkboxes = form.querySelectorAll('input[name="diasDisponiveis"]:checked');
    checkboxes.forEach(checkbox => {
        diasDisponiveis.push(checkbox.value);
    });
    data.diasDisponiveis = diasDisponiveis;
    
    console.log('Dados do formulário:', data);
    return data;
}
