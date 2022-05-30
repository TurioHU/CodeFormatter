const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0)) ? 
						vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	console.log('Congratulations, your extension "codeformatter" is now active!');
	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from CodeFormatter!');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.AddCFileHeader', function () {
		const editor = vscode.window.activeTextEditor;
		console.log(editor.document.fileName);
		console.log(rootPath);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.GetCurrentFilePath', (uri) => {
		console.log(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
		// const editor = vscode.window.activeTextEditor;
		// const selection = editor.selection;
		// const currentLineRange = editor.document.lineAt(selection.active.line).range;
		// editor.edit(edit => edit.replace(currentLineRange, "my new text"));

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
		
		var jsonParsed =getJson(rootPath)
		if(uriPath) 
		{
			if(fs.lstatSync(uriPath).isDirectory()) 
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
					if(fs.existsSync(path.join(uriPath, componentName))) 
					{
						vscode.window.showInformationMessage('Directory exists!');
					}
					else if(fs.existsSync(path.join(uriPath, "Doc")))
					{
						vscode.window.showInformationMessage('Directory is module, it can not be created again!');
					}
					else
					{
						fs.mkdir(path.join(uriPath, componentName),{recursive:true},(err)=>{
							if(err)
							{
								throw err;
							}
							else
							{
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
											for (let value of fileInfo.data[0].body){fileData += getData(value, "$ComponentName$", componentName );} 
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
							if(err)
							{
								throw err;
							}
							else
							{
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
							var uriPathNew = getData(uriPath, folderName, componentName);
							try {
								fs.renameSync(uriPath, uriPathNew);
							}
							catch (e) {
								fs.renameSync(uriPath, uriPathNew);
							}
							fileDisplay(uriPathNew, folderName, componentName);
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
}

function getData(str, oldName, newName)
{
	var upperCon = false;
	var re =new RegExp(oldName,"gim");

	if((str.indexOf("#define") != -1) 
	    || (str.indexOf("#ifndef") != -1) 
		|| (str.indexOf("#endif") != -1))
	{
		upperCon = true;
	}

	return ((upperCon) ? (str.replace(re, newName.toUpperCase())) : 
						 (str.replace(re, newName))) + "\n";
}

function getJson(rootPath)
{
	var jsonParsed = null;
	fs.readFile(rootPath + '/sample.json', function(err, data) {  
		if(err)
		{
			console.log('error!');
		}
		else
		{
			jsonParsed = JSON.parse(data.toString()); 
			console.log(jsonParsed);
			console.log(jsonParsed.module[0].name) ;
		}
	});
	return jsonParsed;
}

function fileDisplay(filePath, oldName, newName) 
{
    fs.readdir(filePath, function(err, files) 
	{
        if (err) 
		{
            console.warn(err, "读取文件夹错误！")
        } 
		else 
		{
            files.forEach(function(filename) 
			{
                var filedir = path.join(filePath, filename);
				console.log(filedir);
                fs.stat(filedir, function(eror, stats) 
				{
                    if (eror) 
					{
                        console.warn('获取文件stats失败');
                    } 
					else 
					{
                        var isFile = stats.isFile(); //是文件
                        var isDir = stats.isDirectory(); //是文件夹
                        if (isFile) 
						{
							var filenameNew = filename.replace(oldName, newName);
							var filedirNew = path.join(filePath, filenameNew);
							// var filedirNew = filedir.replace(oldName, newName);
							fs.rename(filedir, filedirNew, (err)=>{ throw  err; });
							fs.readFile(filedirNew, 'utf8', function (err, data) 
							{
								if (err) 
								{
									return console.log(err);
								}
								var result = "";
								 // split the contents by new line
    							const lines = data.split(/\r?\n/);
								 // print all lines
								lines.forEach((line) => {
									result += getData(line, oldName, newName);
								});

								fs.writeFile(filedirNew, result, 'utf8', function (err) {
									if (err) return console.log(err);
								});
							});

                            console.log(filedirNew);
                        }
                        if (isDir) 
						{
                            fileDisplay(filedir, oldName, newName); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}




// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
