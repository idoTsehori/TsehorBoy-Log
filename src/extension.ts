import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('tsehorboy-log.insertLog', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			const text = document.getText(selection);

			// Create the log message
			const logMessage = `ServiceWrapper.LogMessage("${text}: " + ${text});\n`;

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
