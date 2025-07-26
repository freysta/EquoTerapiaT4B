// Script para o formulário das famílias - Ecoterapia T4B
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('familiaForm');
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

        // Validação específica para email
        const email = document.getElementById('emailResponsavel');
        if (email.value && !isValidEmail(email.value)) {
            email.style.borderColor = '#e74c3c';
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = email;
            }
        }

        // Validação específica para telefone
        const telefone = document.getElementById('telefoneResponsavel');
        if (telefone.value && !isValidPhone(telefone.value)) {
            telefone.style.borderColor = '#e74c3c';
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = telefone;
            }
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
            data[key] = value;
        }

        // Adicionar timestamp
        data.timestamp = new Date().toLocaleString('pt-BR');
        data.tipoFormulario = 'familia';

        // Campos específicos que podem precisar de tratamento especial
        if (document.getElementById('parentesco').value === 'outro') {
            data.parentescoCompleto = data.outroParentesco || 'Não especificado';
        } else {
            data.parentescoCompleto = data.parentesco;
        }

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
        
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/SEU_FORM_ID/formResponse';
        
        // Mapeamento dos campos do formulário para os IDs do Google Forms
        const formMapping = {
            'entry.123456789': data.nomeResponsavel,
            'entry.987654321': data.parentesco,
            'entry.456789123': data.telefoneResponsavel,
            'entry.789123456': data.emailResponsavel,
            'entry.321654987': data.nomePaciente,
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
            errorMessage.innerHTML = '<strong>❌ Erro!</strong> Por favor, preencha todos os campos obrigatórios corretamente.';
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
    const emailField = document.getElementById('emailResponsavel');
    emailField.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            this.style.borderColor = '#e74c3c';
        } else if (this.value) {
            this.style.borderColor = '#27ae60';
        }
    });

    // Validação específica para telefone
    const phoneField = document.getElementById('telefoneResponsavel');
    phoneField.addEventListener('blur', function() {
        if (this.value && !isValidPhone(this.value)) {
            this.style.borderColor = '#e74c3c';
        } else if (this.value) {
            this.style.borderColor = '#27ae60';
        }
    });

    // Mostrar/esconder campo "outro parentesco"
    const parentescoSelect = document.getElementById('parentesco');
    const outroParentescoGroup = document.getElementById('outroParentesco').closest('.form-group');
    
    parentescoSelect.addEventListener('change', function() {
        if (this.value === 'outro') {
            outroParentescoGroup.style.display = 'block';
            document.getElementById('outroParentesco').required = true;
        } else {
            outroParentescoGroup.style.display = 'none';
            document.getElementById('outroParentesco').required = false;
            document.getElementById('outroParentesco').value = '';
        }
    });

    // Inicializar estado do campo "outro parentesco"
    if (parentescoSelect.value !== 'outro') {
        outroParentescoGroup.style.display = 'none';
    }

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

    console.log('Script do formulário das famílias carregado com sucesso!');
});

// Função para debug - remover em produção
function debugFormData() {
    const form = document.getElementById('familiaForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    console.log('Dados do formulário:', data);
    return data;
}
