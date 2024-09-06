// npm run compile



import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';

// Função personalizada para processar o texto original
function fun_process(input: string): string {
    return input.toUpperCase();  // Por exemplo, converter para maiúsculas
}

// Função personalizada para substituir o texto (nova função)
//function fun_replace(input: string): string {
//    return input.replace(/hello/gi, "world");  // Exemplo de substituição de "hello" por "world"
//}

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


// Função para gerar HTML colorido
function generateHTMLContent(originalFile: string, processedFile: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #333; }
                pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
                code { color: #c7254e; background-color: #f9f2f4; padding: 2px 4px; border-radius: 3px; }
                .command { background-color: #e7f3fe; padding: 10px; border-left: 5px solid #2196F3; }
            </style>
            <title>Instruções para o Meld</title>
        </head>
        <body>
            <h2>Diferenças encontradas</h2>
            <p>Para visualizar as diferenças, execute o comando abaixo no terminal:</p>
            <div class="command">
                <pre><code>meld ${originalFile} ${processedFile}</code></pre>
            </div>
            <p>Os arquivos temporários estão localizados em:</p>
            <ul>
                <li><b>Original:</b> ${originalFile}</li>
                <li><b>Processado:</b> ${processedFile}</li>
            </ul>
        </body>
        </html>
    `;
}

export function activate(context: vscode.ExtensionContext) {
    let processTextCommand = vscode.commands.registerCommand('TrucomanX.processText', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (text) {
                const processedText = fun_process(text);
                const originalFile = createTempFile(text, 'original');
                const processedFile = createTempFile(processedText, 'processed');

                /*
                // Abre nova janela
                const htmlContent = generateHTMLContent(originalFile, processedFile);

                const panel = vscode.window.createWebviewPanel(
                    'diffViewer',
                    'Diferenças de Arquivos',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                panel.webview.html = htmlContent;
                */

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
