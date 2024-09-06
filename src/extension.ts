// npm run compile

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';


////////////////////////////////////////////////////////////////////////////////
import axios from 'axios'; // Usando axios para chamadas HTTP

// Função para obter a resposta da API
async function getLlamaResponse(apiKey: string, inputText: string): Promise<string> {
    try {
        const response = await axios.post('https://api.llama.ai/v1/complete', {
            prompt: inputText,
            max_tokens: 2000, // Ajuste conforme necessário
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].text; // Ajuste conforme a estrutura da resposta da API
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Se o erro for um erro do Axios, trate-o
            console.error(`Erro na API: ${error.response?.data?.message || error.message}`);
        } else if (error instanceof Error) {
            // Se o erro for uma instância de Error, trate-o
            console.error(`Ocorreu um erro: ${error.message}`);
        } else {
            // Caso o erro seja de um tipo desconhecido
            console.error(`Ocorreu um erro desconhecido`);
        }
        return "Erro";
    }
}

////////////////////////////////////////////////////////////////////////////////
// Função para obter a resposta da API Ollama
async function getOllamaResponse(inputText: string): Promise<string> {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            prompt: inputText,
            model: 'llama3.1:8b', // Usando o modelo correto
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'stream' // Estamos esperando a resposta como stream
        });

        let fullResponse = '';

        response.data.on('data', (chunk: any) => {
            const chunkStr = chunk.toString().trim();
            const parts = chunkStr.split('\n'); // A resposta pode conter várias partes separadas por quebras de linha

            parts.forEach((part: string) => {
                try {
                    const jsonPart = JSON.parse(part); // Parse cada parte individual como JSON
                    if (jsonPart.response) {
                        fullResponse += jsonPart.response; // Concatene o conteúdo de 'response'
                    }
                } catch (error) {
                    console.error("Erro ao fazer parse da parte do JSON:", part, error);
                }
            });
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                resolve(fullResponse);
            });

            response.data.on('error', (err: any) => {
                reject("Erro na leitura da stream: " + err);
            });
        });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Erro na API Ollama: ${error.response?.data?.message || error.message}`);
        } else if (error instanceof Error) {
            console.error(`Ocorreu um erro: ${error.message}`);
        } else {
            console.error(`Ocorreu um erro desconhecido`);
        }
        return "Erro";
    }
}


////////////////////////////////////////////////////////////////////////////////
import { OpenAI } from 'openai'; // Importa a classe OpenAI

// Função para obter a resposta da OpenAI
async function getOpenAIResponse(apiKey: string, inputText: string): Promise<string> {
    try {
        // Configuração da API OpenAI
        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // Enviar o texto para o modelo GPT-3.5
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Escolha o modelo apropriado
            messages: [{ role: "user", content: inputText }],
        });

        // Obter o texto da resposta
        const result = response.choices[0]?.message?.content ?? "Resposta não encontrada";

        return result;
    } catch (error: any) {
            vscode.window.showErrorMessage(`${error.message}`);

        return error.message;
    }
}

////////////////////////////////////////////////////////////////////////////////
import { Anthropic } from '@anthropic-ai/sdk';
// Função para enviar texto para a API do Claude e obter a resposta
async function getClaudeResponse(apiKey: string, inputText: string): Promise<string> {
    try {
        const anthropic = new Anthropic({ apiKey });

        // Enviar o texto para o Claude 3.5 Sonnet e obter a resposta
        const response = await anthropic.completions.create({
            prompt: inputText,
            model: "claude-3.5", // Substitua pelo modelo específico se necessário
            max_tokens_to_sample: 150 // Ajuste conforme necessário
        });

        console.log('API Response:', response); // Verificar a estrutura da resposta

        // Ajustar de acordo com a estrutura da resposta
        // Exemplo genérico:
        // Se a resposta for um objeto com uma propriedade `result`, ajuste conforme necessário
        return JSON.stringify(response, null, 2);
    } catch (error) {
        vscode.window.showErrorMessage(`An error occurred: ${error}`);
        return "Error";
    }
}

////////////////////////////////////////////////////////////////////////////////
// Função personalizada para processar o texto original
async function fun_process(input: string): Promise<string> {
    
    const inputText =   "Rescreve o texto escrito depois de [BEGIN]. "+
                        "Nao incluas [BEGIN]. "+
                    "Melhora a fluencia, concordancia e ortografia. "+
                    "Respeita o formato do codigo fonte. "+
                    "Respeita os saltos de linha. " + 
                    "Nao agregues comentarios na sua resposta, "
                    "so retorna o texto modificado.\n\n\n[BEGIN]";  
    //vscode.window.showErrorMessage(inputText+input);
    return getOllamaResponse(inputText+input); 

}

////////////////////////////////////////////////////////////////////////////////

// Função para criar um arquivo temporário
function createTempFile(content: string, prefix: string): string {
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `${prefix}-${Date.now()}.txt`);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
}

// Função para verificar se o comando de diff está disponível
function isCommandAvailable(command: string): Promise<boolean> {
    return new Promise((resolve) => {
        exec(`which ${command}`, (error) => {
            resolve(!error);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////

// Função personalizada para substituir o texto (nova função)
function fun_replace(input: string): string {
    // Regex para os sinais de pontuação seguidos por espaço(s) em branco
    const punctuationRegex = /([.,;:])(\s+)/g;

    // Substituir o último espaço contínuo em branco após os sinais de pontuação por um salto de linha, se não houver um
    return input.replace(punctuationRegex, (match, punctuation, spaces) => {
        // Se os espaços já contêm um salto de linha, retorna o mesmo
        if (spaces.includes("\n")) {
            return punctuation + spaces;
        }
        // Caso contrário, adiciona o salto de linha
        return punctuation + spaces + '\n';
    });
}


////////////////////////////////////////////////////////////////////////////////

export function activate(context: vscode.ExtensionContext) {
    let processTextCommand = vscode.commands.registerCommand('TrucomanX.processText', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (text) {
                // const apiKey = "";
                // const processedText = await getClaudeResponse(apiKey,text);

                // const processedText = fun_process(text);

                //const apiKey = "";
                //const processedText = await getOpenAIResponse(apiKey, text);

                //const apiKey = "";
                //const processedText = await getLlamaResponse(apiKey, text);
                
                //const processedText = await getOllamaResponse(text);

                const processedText = await fun_process(text);
                

                const originalFile = createTempFile(text, 'original');
                const processedFile = createTempFile(processedText, 'processed');

                // Obter a configuração de diff tool escolhida pelo usuário
                const config = vscode.workspace.getConfiguration('processThisText');
                const diffTool = config.get<string>('diffTool') || 'meld';  // Valor padrão é 'meld'

                // Verificar se o comando de diff está disponível
                if (await isCommandAvailable(diffTool)) {
                    // Abrir o terminal integrado e executar o comando de diff tool
                    const terminal = vscode.window.createTerminal({ name: "Diff Tool" });
                    terminal.show();
                    terminal.sendText(`${diffTool} ${originalFile} ${processedFile}`);
                } else {
                    vscode.window.showErrorMessage(`Ferramenta de diff não encontrada: ${diffTool}`);
                }
            } else {
                vscode.window.showInformationMessage("Selecione um texto para processar.");
            }
        }
    });

    // Novo comando: TrucomanX - substituir o texto selecionado
    let replaceTextCommand = vscode.commands.registerCommand('TrucomanX.replaceText', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (text) {
                // Substituir o texto selecionado usando a função fun_replace
                const replacedText = fun_replace(text);

                // Substituir o texto no editor
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, replacedText);
                });

                vscode.window.showInformationMessage("Texto substituído com sucesso!");
            } else {
                vscode.window.showInformationMessage("Selecione um texto para substituir.");
            }
        }
    });

    context.subscriptions.push(processTextCommand);
    context.subscriptions.push(replaceTextCommand);
}

export function deactivate() {}
