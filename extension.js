// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const util = require('util');
const { tokenToString } = require('typescript');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	var jsonParsed;
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	
	fs.readFile(rootPath + '/sample.json', 
		// 读取文件完成时调用的回调函数
		function(err, data) {  
			if(err)
			{
				console.log('error!');
			}
			else
			{
				jsonParsed = JSON.parse(data.toString()); 
				console.log(jsonParsed);
				console.log(jsonParsed.module[0].name) ;
				for (var value of jsonParsed.module[0].data[0].Header){ console.log(value);}
				// console.log(jsonParsed.module[0].name.replace("$ComponentName$", "Gpio"));
				// console.log(jsonParsed.persons[0].name + "'s office phone number is " + jsonParsed.persons[0].phone.office);
				// console.log(jsonParsed.persons[1].name + " is from " + jsonParsed.persons[0].city); 
			}
	 });


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeformatter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('codeformatter.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from CodeFormatter!');
	});

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.AddCFileHeader', function () {
		const editor = vscode.window.activeTextEditor;
		console.log(editor.document.fileName);
		console.log(rootPath);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.GetCurrentFilePath', (uri) => {
		console.log(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		
		// get the range of the current line, I don't think there is an easier way in the api
		const currentLineRange = editor.document.lineAt(selection.active.line).range;
		
		editor.edit(edit => edit.replace(currentLineRange, "my new text"));

		// const folder = vscode.window.showInputBox.showOpenDialog({
		// 	canSelectFiles: false,
		// 	canSelectFolders: true,
		// 	canSelectMany: false,
		//   });

		// 设置输入框提示
		// const options = {
		// 	prompt: '请输入接口Id',
		// 	placeHolder: '接口Id'
		//   }
		//   // 输入路径名称
		// const apiTag =  vscode.window.showWorkspaceFolderPick.showInputBox(options);
		// vscode.window.showInformationMessage('输入正确的接口Id');
		var items = [];
		items.push({ label: 'Add File Header'});
		items.push({ label: 'Add Function Header'});
		items.push({ label: 'Update Function Header'});
	
		vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
			console.log(selectedItem.label);
		});

	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.CreateModuleByTemplete', async (uri) => {
		var uriPath = uri.path
		console.log(`当前文件(夹)路径是：${uri ? uriPath : '空'}`);
		//写入文件（会覆盖之前的内容）（文件不存在就创建）  utf8参数可以省略 
		if(uriPath) {
			if(fs.lstatSync(uriPath).isDirectory()) {
				var options = {
					value: "Component",
					ignoreFocusOut: true,
					prompt: 'Enter new component name',
					placeHolder: ""
				}
				var componentName = await vscode.window.showInputBox(options);
				if(typeof componentName != "undefined" 
					&& componentName 
					&& typeof componentName.valueOf() === "string")
				{
					if(fs.existsSync(path.join(uriPath, componentName))) {
						vscode.window.showInformationMessage('Directory exists!');
					}
					else if(fs.existsSync(path.join(uriPath, "Doc")))
					{
						vscode.window.showInformationMessage('Directory is module, it can not be created again!');
					}
					else
					{
						fs.mkdir(path.join(uriPath, componentName),{recursive:true},(err)=>{
							if(err){
								throw err;
							}else{
								console.log('Create Module folder ok!');
								fs.mkdir(path.join(uriPath, componentName, "Src"),{recursive:true},(err)=>{
									if(err){
										throw err;
									}else{
										console.log('Create Src folder ok!');
										for(let fileInfo of jsonParsed.module)
										{
											var fileName = fileInfo.name.replace("$ComponentName$", componentName);
											var filePath = path.join(uriPath, componentName, fileName)
											console.log(filePath);
	
											var fileData = "";
											for (let value of fileInfo.data[0].body){fileData += getData(value, componentName );} 
											fs.writeFile(filePath, fileData,'utf8',function(error){
												if(error){
													console.log(error);
													return false;
												}
												console.log('Create and write file ok!');
											});
										}
									}
								});
							}
						});
						fs.mkdir(path.join(uriPath, componentName, "Doc"),{recursive:true},(err)=>{
							if(err){
								throw err;
							}else{
								console.log('Create Doc folder ok!');
							}
						});
					}
				}
				else
				{
					console.log("component name is null");
				}
			}
			else
			{
				vscode.window.showInformationMessage('This is a file, Pelease select a directory!!!');
			}	
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.UpdateModuleByTemplete', async (uri) => {
		var uriPath = uri.path
		if(uriPath) {
			if(fs.lstatSync(uriPath).isDirectory()) {
				var folderName = uriPath.substring(uriPath.lastIndexOf("/") + 1, uriPath.length);
				console.log(folderName);
				if(fs.existsSync(path.join(uriPath, "Doc")))
				{
					var options = {
						value: "Component",
						ignoreFocusOut: true,
						prompt: 'Enter new component name',
						placeHolder: ""
					}
					var componentName = await vscode.window.showInputBox(options);
					if(typeof componentName != "undefined" 
						&& componentName 
						&& typeof componentName.valueOf() === "string")
					{
						if(folderName === componentName)
						{
							vscode.window.showInformationMessage('Same as the previous component name, please enter a new name!!!');
						}
						else
						{
							console.log(componentName);
						}
					}
					else
					{
						console.log("component name is null");
					}
				}
				else
				{
					vscode.window.showInformationMessage('The directory is not a module!');
				}
			}
			else
			{
				vscode.window.showInformationMessage('This is a file, Pelease select a directory!!!');
			}	
		}

	}));

	context.subscriptions.push(disposable);
}

function getData(str, name)
{
	var upperCon = false;
	if((str.indexOf("#define") != -1) 
	    || (str.indexOf("#ifndef") != -1) 
		|| (str.indexOf("#endif") != -1))
	{
		upperCon = true;
	}


	return ((upperCon) ? (str.replace("$ComponentName$", name.toUpperCase())) : 
						 (str.replace("$ComponentName$", name))) + "\n";
}




var ExampleTreeProvider = /** @class */ (function () {
    function ExampleTreeProvider() {
    }
    ExampleTreeProvider.prototype.getTreeItem = function (element) {
        return element;
    };
    ExampleTreeProvider.prototype.getChildren = function (element) {
        if (element == null) {
            var item = new vscode.TreeItem("Foo");
            item.command = {
                command: "exampleTreeView.selectNode",
                title: "Select Node",
                arguments: [item]
            };
            return [item];
        }
        return null;
    };
    return ExampleTreeProvider;
}());

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
