import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('TsehorLog.insertLog', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			const text = document.getText(selection);

			// Read the entire text of the document to analyze its contents
			const fullText = document.getText();

			let logMessage = '';

			// Check for private LogMessage method
			if (fullText.includes('private LogMessage(') || fullText.includes('private static LogMessage(')) {
				logMessage = `this.LogMessage("${text}: " + ${text});\n`;
			}
			// Check for specific for when we have import { Sources } ion the file 
			else if (/import\s+\{\s*Sources\s*\}\s+from/.test(fullText)) {
				logMessage = `ServiceWrapper.LogMessage("${text}: " + ${text}, Sources.ServiceWrapper);\n`;
			}
			// Default log message
			else {
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
