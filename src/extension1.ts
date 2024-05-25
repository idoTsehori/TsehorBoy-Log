import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const packageJsonPath = path.join(context.extensionPath, 'package.json');
    let packageName = '';

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageName = packageJson.name;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error reading package.json: ' + error.message);
    }

    let disposable = vscode.commands.registerCommand('TsehorLog.insertLog', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);

            // Read the entire text of the document to analyze its contents
            const fullText = document.getText();

            let logMessage = '';
            let importStatement = '';

            if (packageName === 'service_wrapper') {
                if (fullText.includes('private LogMessage(') || fullText.includes('private static LogMessage(')) {
                    logMessage = `this.LogMessage("${text}: " + ${text});\n`;
                } else if (/import\s+\{\s*Sources\s*\}\s+from/.test(fullText)) {
                    logMessage = `ServiceWrapper.LogMessage("${text}: " + ${text}, Sources.ServiceWrapper);\n`;
                } else {
                    logMessage = `ServiceWrapper.LogMessage("${text}: " + ${text}, Sources.ServiceWrapper);\n`;

                    // Calculate the relative path to InnerClasses/LogWrapper (how many dots we need to get the LogWrapper)
                    const currentFileDir = path.dirname(document.uri.fsPath);
                    const logWrapperPath = path.resolve(currentFileDir, 'InnerClasses/LogWrapper');
                    const relativePath = path.relative(currentFileDir, logWrapperPath);
                    importStatement = `import { Sources } from "${relativePath}";\n`;

                    if (!fullText.includes(importStatement)) {
                        const topPosition = new vscode.Position(0, 0);
                        editor.edit(editBuilder => {
                            editBuilder.insert(topPosition, importStatement);
                        });
                    }
                }
            } else if (packageName === 'promo-tool-vue-3') {
                logMessage = `PromoToolLogger.LogMessage("${text}: " + ${text});\n`;
            } else {
                logMessage = `ServiceWrapper.LogMessage("${text}: " + ${text});\n`;
            }

            // Determine where to insert the log message
            const insertionPoint = selection.end.with(selection.end.line + 1, 0);

            editor.edit(editBuilder => {
                // Insert the log message at the calculated insertion point
                editBuilder.insert(insertionPoint, logMessage);
            });
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
