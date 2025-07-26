# Formulários de Ecoterapia - T4B Medicina Fimca

Sistema de formulários web para coleta de dados de ecoterapia, desenvolvido para a turma T4B do curso de Medicina da Faculdade Fimca, Jaru - Rondônia.

## 📋 Sobre o Projeto

Este projeto consiste em dois formulários distintos:
- **Formulário para Famílias**: Destinado aos familiares e responsáveis pelos pacientes
- **Formulário para Pacientes**: Destinado aos pacientes que participarão da ecoterapia

Os dados coletados são enviados diretamente para o Google Sheets, permitindo análise e acompanhamento em tempo real.

## 🚀 Funcionalidades

### Formulário das Famílias
- Dados do responsável e parentesco
- Informações do paciente
- Histórico de relação com a natureza
- Expectativas e disponibilidade para acompanhamento
- Validação em tempo real dos campos

### Formulário dos Pacientes
- Dados pessoais completos
- Avaliação de bem-estar mental e emocional
- Experiência e preferências com atividades na natureza
- Limitações físicas e medos
- Disponibilidade de horários (dias da semana)
- Sistema de salvamento automático de rascunho

### Recursos Técnicos
- Design responsivo (mobile e desktop)
- Validação de formulários em tempo real
- Integração com Google Sheets
- Formatação automática de telefone
- Contador de caracteres em campos importantes
- Sistema de loading e feedback visual
- Salvamento automático de rascunho (formulário do paciente)

## 🛠️ Configuração do Google Sheets

### Opção 1: Google Apps Script (Recomendado)

#### Passo 1: Criar a Planilha
1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha chamada "Ecoterapia T4B - Respostas"
3. Crie duas abas:
   - "Famílias"
   - "Pacientes"

#### Passo 2: Configurar Headers das Colunas

**Aba "Famílias":**
```
A1: Timestamp
B1: Nome do Responsável
C1: Parentesco
D1: Telefone
E1: Email
F1: Nome do Paciente
G1: Idade do Paciente
H1: Condições Médicas
I1: Experiência com Natureza
J1: Atividades Preferidas
K1: Comportamento do Paciente
L1: Expectativas
M1: Preocupações
N1: Disponibilidade Acompanhar
O1: Melhor Horário
P1: Informações Adicionais
Q1: Contato Preferido
```

**Aba "Pacientes":**
```
A1: Timestamp
B1: Nome Completo
C1: Idade
D1: Gênero
E1: Telefone
F1: Email
G1: Profissão
H1: Motivação
I1: Nível de Estresse
J1: Nível de Ansiedade
K1: Humor Geral
L1: Tratamento Atual
M1: Frequência Natureza
N1: Atividades Natureza
O1: Sentimentos Natureza
P1: Ambiente Preferido
Q1: Limitações Físicas
R1: Medos
S1: Preferências Atividade
T1: Grupo/Individual
U1: Dias Disponíveis
V1: Horário Preferido
W1: Objetivos
X1: Informações Adicionais
```

#### Passo 3: Criar Google Apps Script
1. Na planilha, vá em **Extensões > Apps Script**
2. Substitua o código padrão pelo seguinte:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    let sheet;
    let values;
    
    if (data.tipoFormulario === 'familia') {
      sheet = spreadsheet.getSheetByName('Famílias');
      values = [
        data.timestamp,
        data.nomeResponsavel,
        data.parentescoCompleto || data.parentesco,
        data.telefoneResponsavel,
        data.emailResponsavel,
        data.nomePaciente,
        data.idadePaciente,
        data.condicoesMedicas,
        data.experienciaNatureza,
        data.atividadesPreferidas,
        data.comportamentoPaciente,
        data.expectativas,
        data.preocupacoes,
        data.disponibilidadeAcompanhar,
        data.melhorHorario,
        data.informacoesAdicionais,
        data.contatoPreferido
      ];
    } else if (data.tipoFormulario === 'paciente') {
      sheet = spreadsheet.getSheetByName('Pacientes');
      values = [
        data.timestamp,
        data.nomeCompleto,
        data.idade,
        data.genero,
        data.telefone,
        data.email,
        data.profissao,
        data.motivacao,
        data.nivelEstresse,
        data.nivelAnsiedade,
        data.humorGeral,
        data.tratamentoAtual,
        data.experienciaNatureza,
        data.atividadesNatureza,
        data.sentimentosNatureza,
        data.ambientePreferido,
        data.limitacoesFisicas,
        data.medos,
        data.preferenciasAtividade,
        data.grupoIndividual,
        data.diasDisponiveis,
        data.horarioPreferido,
        data.objetivos,
        data.informacoesAdicionais
      ];
    }
    
    if (sheet && values) {
      sheet.appendRow(values);
      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error('Tipo de formulário inválido');
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### Passo 4: Configurar Permissões
1. Clique em **Salvar** (ícone de disquete)
2. Vá em **Implantar > Nova implantação**
3. Escolha o tipo: **Aplicativo da Web**
4. Configurações:
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
5. Clique em **Implantar**
6. Copie a **URL do aplicativo da Web**

#### Passo 5: Atualizar os Scripts JavaScript
1. Abra `script-familia.js`
2. Substitua `SEU_SCRIPT_ID` pela URL copiada na linha:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec';
   ```
3. Faça o mesmo em `script-paciente.js`

### Opção 2: Google Forms (Mais Simples)

#### Para Famílias:
1. Crie um Google Form com os campos do formulário das famílias
2. Obtenha a URL de submissão do formulário
3. Mapeie os IDs dos campos no `script-familia.js`

#### Para Pacientes:
1. Crie um Google Form com os campos do formulário dos pacientes
2. Obtenha a URL de submissão do formulário
3. Mapeie os IDs dos campos no `script-paciente.js`

## 🌐 Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com) (opcional, mas recomendado)

### Método 1: Deploy via GitHub (Recomendado)
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos do projeto
3. Conecte sua conta Vercel ao GitHub
4. Importe o repositório no Vercel
5. Configure as variáveis de ambiente se necessário
6. Deploy automático!

### Método 2: Deploy Direto
1. Instale a CLI do Vercel: `npm i -g vercel`
2. Na pasta do projeto, execute: `vercel`
3. Siga as instruções na tela
4. Seu site estará online!

### Configurações Recomendadas para o Vercel
Crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "functions": {
    "*.html": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📱 Uso dos Formulários

### Acesso
- **URL Principal**: Sua URL do Vercel (ex: `https://seu-projeto.vercel.app`)
- **Formulário Famílias**: `/familia.html`
- **Formulário Pacientes**: `/paciente.html`

### Funcionalidades Especiais

#### Formulário dos Pacientes
- **Salvamento Automático**: O formulário salva automaticamente um rascunho a cada 30 segundos
- **Recuperação**: Se o usuário fechar o navegador, pode continuar de onde parou
- **Validação Inteligente**: Campos são validados em tempo real

#### Ambos os Formulários
- **Responsivo**: Funciona perfeitamente em celulares e tablets
- **Validação**: Campos obrigatórios são validados antes do envio
- **Feedback Visual**: Loading, sucesso e erro são mostrados claramente

## 🔧 Personalização

### Cores e Estilo
Edite o arquivo `style.css` para personalizar:
- Cores principais (variáveis CSS no topo do arquivo)
- Fontes e tamanhos
- Espaçamentos e layouts

### Campos dos Formulários
Para adicionar/remover campos:
1. Edite os arquivos HTML (`familia.html` e `paciente.html`)
2. Atualize os scripts JavaScript correspondentes
3. Ajuste as colunas no Google Sheets
4. Atualize o Google Apps Script se necessário

### Validações
Personalize as validações nos arquivos JavaScript:
- `script-familia.js` para o formulário das famílias
- `script-paciente.js` para o formulário dos pacientes

## 📊 Análise dos Dados

### No Google Sheets
- Use filtros para analisar respostas específicas
- Crie gráficos para visualizar tendências
- Exporte dados para análises mais avançadas

### Relatórios Sugeridos
- Distribuição de idades dos pacientes
- Níveis de estresse e ansiedade reportados
- Preferências de atividades na natureza
- Disponibilidade de horários mais comuns

## 🛡️ Segurança e Privacidade

### Dados Coletados
- Todos os dados são armazenados no Google Sheets da conta configurada
- Não há armazenamento local permanente (exceto rascunhos temporários)
- Conexão segura via HTTPS

### Recomendações
- Configure permissões adequadas no Google Sheets
- Faça backup regular dos dados
- Considere anonimizar dados sensíveis para análises

## 🐛 Solução de Problemas

### Formulário não envia
1. Verifique se a URL do Google Apps Script está correta
2. Confirme se o script está implantado e com permissões corretas
3. Verifique o console do navegador para erros JavaScript

### Dados não aparecem na planilha
1. Verifique se os nomes das abas estão corretos ("Famílias" e "Pacientes")
2. Confirme se as colunas estão na ordem correta
3. Teste o Google Apps Script diretamente

### Problemas de Layout
1. Limpe o cache do navegador
2. Verifique se todos os arquivos CSS estão carregando
3. Teste em diferentes dispositivos e navegadores

## 📞 Suporte

Para dúvidas técnicas ou sugestões de melhorias:
- Verifique a documentação do Google Apps Script
- Consulte a documentação do Vercel
- Teste as funcionalidades em ambiente local primeiro

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos para a turma T4B do curso de Medicina da Faculdade Fimca, Jaru - Rondônia.

---

**Desenvolvido com ❤️ para o projeto de Ecoterapia - T4B Medicina Fimca**
