const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const parameter = require('./src/function-c');

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

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.AddVariableHeader', (uri) => {
		try 
		{
			var uriPath = uri.path
			console.log(`当前文件(夹)路径是：${uri ? uriPath : '空'}`);

			if(path.extname(uriPath) == ".c")
			{
				var data = fs.readFileSync(rootPath + '/.vscode/ModuleTemplate.json');
				var jsonParsed = JSON.parse(data.toString()); 
				console.log(jsonParsed);

				var componentName = path.basename(uriPath, path.extname(uriPath))
				var body = jsonParsed.module[0].variable.body;
				var include = jsonParsed.module[0].variable.include;
				var start_macro = componentName.toUpperCase() + "_START" + body
				var stop_macro = componentName.toUpperCase() + "_STOP" + body


				console.log(start_macro);

				var items = [];
				for(let value of jsonParsed.module[0].variable.type) {
					items.push({ label: start_macro + value, str: value});
				}

				vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
					console.log(selectedItem.str);
					start_macro += selectedItem.str;
					stop_macro += selectedItem.str;

					include = getData(include, "%ComponentName%", componentName);

					var fileData = ""
					fileData += "\n"
					fileData += "#define " + start_macro + "\n"
					fileData += "#include \"" + include + "\"\n"
					fileData += "\n"
					fileData += "\n"
					fileData += "#define " + stop_macro + "\n"
					fileData += "#include \"" + include + "\"\n"
					fileData += "\n"

					const editor = vscode.window.activeTextEditor;
					const selection = editor.selection;
					const text = editor.document.getText()
					if(getLine(text, start_macro) == -1)
					{
						var  posCurrent = selection.active.line;
						console.log(posCurrent);
						var posVariable = getLine(text, " * Variables");
						var posConstant = getLine(text, " * Constant");
						
						console.log(posVariable, posConstant);

						if((parseInt(posCurrent.toString()) > parseInt(posVariable.toString())) && 
						(parseInt(posCurrent.toString()) < parseInt(posConstant.toString())))
						{
							const currentLineRange = editor.document.lineAt(selection.active.line).range;
							editor.edit(edit => edit.replace(currentLineRange, fileData));
						}
						else
						{
							vscode.window.showInformationMessage('This line is not in Variables area!!!');
						}
					}
					else
					{
						vscode.window.showInformationMessage('This macro is already in this file!!!');
					}
				});
			}
			else
			{
				vscode.window.showInformationMessage('This is not a c file, pelease select a c file!!!');
			}
		} catch (err) {
			console.log(err);
			vscode.window.showInformationMessage('Pelease put ModuleTemplate.json in .vscode!!!');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.AddConstantHeader', (uri) => {
		try 
		{
			var uriPath = uri.path
			console.log(`当前文件(夹)路径是：${uri ? uriPath : '空'}`);

			if(path.extname(uriPath) == ".c")
			{
				var data = fs.readFileSync(rootPath + '/.vscode/ModuleTemplate.json');
				var jsonParsed = JSON.parse(data.toString()); 
				console.log(jsonParsed);

				var componentName = path.basename(uriPath, path.extname(uriPath))
				var body = jsonParsed.module[0].constant.body;
				var include = jsonParsed.module[0].constant.include;
				var start_macro = componentName.toUpperCase() + "_START" + body
				var stop_macro = componentName.toUpperCase() + "_STOP" + body


				console.log(start_macro);

				var items = [];
				for(let value of jsonParsed.module[0].constant.type) {
					items.push({ label: start_macro + value, str: value});
				}

				vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
					console.log(selectedItem.str);
					start_macro += selectedItem.str;
					stop_macro += selectedItem.str;

					include = getData(include, "%ComponentName%", componentName);

					var fileData = ""
					fileData += "\n"
					fileData += "#define " + start_macro + "\n"
					fileData += "#include \"" + include + "\"\n"
					fileData += "\n"
					fileData += "\n"
					fileData += "#define " + stop_macro + "\n"
					fileData += "#include \"" + include + "\"\n"
					fileData += "\n"

					const editor = vscode.window.activeTextEditor;
					const selection = editor.selection;
					const text = editor.document.getText();

					if(getLine(text, start_macro) == -1)
					{
						var posCurrent = selection.active.line;
						var posConstant = getLine(text, " * Constant");
						var posDeclarations = getLine(text, " * Declarations");
						console.log(posConstant, posDeclarations);
						console.log(selection.active.line);
	
						if((parseInt(posCurrent.toString()) > parseInt(posConstant.toString())) && 
						   (parseInt(posCurrent.toString()) < parseInt(posDeclarations.toString())))
						{
							const currentLineRange = editor.document.lineAt(selection.active.line).range;
							editor.edit(edit => edit.replace(currentLineRange, fileData));
						}
						else
						{
							vscode.window.showInformationMessage('This line is not in Constant area!!!');
						}
					}
					else
					{
						vscode.window.showInformationMessage('This macro is already in this file!!!');
					}
				});
			}
			else
			{
				vscode.window.showInformationMessage('This is not a c file, pelease select a c file!!!');
			}
		} catch (err) {
			console.log(err);
			vscode.window.showInformationMessage('Pelease put ModuleTemplate.json in .vscode!!!');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.AddFunctionHeader', (uri) => {
		try 
		{
			var uriPath = uri.path
			console.log(`当前文件(夹)路径是：${uri ? uriPath : '空'}`);
	
			var data = fs.readFileSync(rootPath + '/.vscode/ModuleTemplate.json');
			var jsonParsed = JSON.parse(data.toString()); 

			var body = jsonParsed.module[0].function.header;
			var returnT = jsonParsed.module[0].function.return;
			var paramT = jsonParsed.module[0].function.param;
			var funcnameT = jsonParsed.module[0].function.funcname;

			const editor = vscode.window.activeTextEditor;
			const selectionsArr = editor.selections;

			var lineFirst = selectionsArr[0]._start._line;
			var lineLast = selectionsArr[0]._end._line;
			var len = lineLast - lineFirst + 1;

			var moreLines = "";
			for(var i = 0; i < len; i++)
			{
				moreLines += editor.document.lineAt(i + lineFirst).text;
			}
			try
			{
				parameter.init(moreLines)
				if(parameter.match)
				{
					var param = ""
					parameter.ret = parameter.ret.replace(/\r\n/g,'').replace(/\n/g,'').replace(/\s+/g,'');
					returnT += (parameter.ret === "void") ? "None" : parameter.ret;

					if(parameter.res.length > 0)
					{
						for(let value of parameter.res)
						{
							param += paramT + value.param + "\n";
						}
						param = param.substring(0, param.length - 1);
					}
					funcnameT += parameter.func
				}

				var fileData = ""
				for (let value of body){fileData += value + "\n";} 
				fileData = fileData.substring(0, fileData.length - 1);

				fileData = fileData.replace("%funcname%", funcnameT)
				fileData = fileData.replace("%param%", param)
				fileData = fileData.replace("%return%", returnT)

				const currentLineRange = editor.document.lineAt(selectionsArr[0].active.line - 1).range;
				editor.edit(edit => edit.replace(currentLineRange, fileData));
			}
			catch (err) {
				console.warn(err)
				vscode.window.showInformationMessage('It is not a function!!!');
			}
	
		} catch (err) {
			vscode.window.showInformationMessage('Pelease put ModuleTemplate.json in .vscode!!!');
		}

	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.CreateModuleByTemplete', async (uri) => {
		try 
		{
			var uriPath = uri.path
			console.log(`当前文件(夹)路径是：${uri ? uriPath : '空'}`);
	
			var data = fs.readFileSync(rootPath + '/.vscode/ModuleTemplate.json');
			var jsonParsed = JSON.parse(data.toString()); 
			
			if(uriPath) 
			{
				try 
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
								try
								{
									fs.mkdirSync(path.join(uriPath, componentName),{recursive:true});
									console.log('Create Module folder ok!');

									/* create folders, if folder is not exist, create it */
									for(let folder of jsonParsed.module[0].folder) 
									{
										var folderPath = path.join(uriPath, componentName, folder.name);
										if(!fs.existsSync(folderPath)) 
										{
											try
											{
												fs.mkdirSync((folderPath),{recursive:true});
												console.log('Create', folderPath, 'folder ok!');
											}
											catch(error)
											{
												console.warn("Can not create", folder, "folder!");
												console.log(error);
												
												return false;
											}
										}
										else
										{
											console.log('Folder exists!');
										}
									}
								
									/* create files, if folder is not exist, create it */
									for(let fileInfo of jsonParsed.module[0].file)
									{
										var fileName = fileInfo.name.replace("%ComponentName%", componentName);
										var filePath = path.join(uriPath, componentName, fileName);
										console.log("filePath:", filePath);
										var folders = fileName.split("/").slice(0, -1);
										console.log(folders)

										var folderTmp = ""
										for(var folder of folders)
										{
											try
											{
												folderTmp += folder;
												var folderPath = path.join(uriPath, componentName, folderTmp)
												
												if(!fs.existsSync(folderPath)) 
												{
													try
													{
														fs.mkdirSync((folderPath),{recursive:true});
														console.log('Create', folderTmp, 'folder ok!');
													}
													catch(error)
													{
														console.warn("Can not create", folderTmp, "folder!");
														console.log(error);
													}
												}
												else
												{
													console.log('Folder exists!');
												}
											}
											catch(error)
											{
												console.log(error);
											}
										}

										/* get file template, replace ComponentName by flag */
										var fileData = "";
										for (let value of fileInfo.data[0].body)
										{
											fileData += getData(value, "%ComponentName%", componentName ) + "\n";
										} 

										try
										{
											fs.writeFileSync(filePath, fileData,'utf8');
											console.log('Create and write file ok!');
										}
										catch(error)
										{
											console.warn("Failed to write", filePath, "file !");
											console.log(error);
											return false;
										}
										
										/* update memmap file */
										if(fileInfo.name.indexOf("MemMap.h") != -1)
										{
											var fileName = fileInfo.name.replace("%ComponentName%", componentName);
											var filePath = path.join(uriPath, componentName, fileName)
											console.log(filePath);

											try 
											{
												let writeStart = false
												let result = "";
												let data = fs.readFileSync(filePath, 'utf8');
												let lines = data.split(/\r?\n/);
												lines.forEach((line) => {
													result += line + "\n";
													if(line.indexOf("* Includes") != -1)
													{
														writeStart = true;
													}
													if(writeStart)
													{
														/* white lines */
														if(line.replace(/\r\n/g,'').replace(/\n/g,'').replace(/\s+/g,'') == "")
														{
															let tmpResult = ""
															writeStart = false;
															tmpResult += getBody(componentName, 
																				"/* VAR (RAM) */\n",
																				jsonParsed.module[0].variable.type, 
																				jsonParsed.module[0].memmap.body, 
																				jsonParsed.module[0].variable.body);

															tmpResult += getBody(componentName,  
																				"/* Const (ROM) */\n",
																				jsonParsed.module[0].constant.type, 
																				jsonParsed.module[0].memmap.body, 
																				jsonParsed.module[0].constant.body);

															tmpResult += getBody(componentName,  
																				"/* Code (ROM) */\n",
																				jsonParsed.module[0].function.type, 
																				jsonParsed.module[0].memmap.body, 
																				jsonParsed.module[0].function.body);
															
															for(let framework of jsonParsed.module[0].memmap.framework)
															{
																result += framework + "\n"
															}
															result = result.replace("%body%",tmpResult)
														}
													}
												});

												try 
												{
													fs.writeFileSync(filePath, result, 'utf8');
												}
												catch(err)
												{
													console.warn("Failed to write", filePath, "file !");
													console.log(err)
													return false;
												}
											}
											catch(err)
											{
												console.warn("Failed to read", filePath, "file !");
												console.log(err);
												return false;
											}
										}
									}
								}
								catch(error)
								{
									console.log(error);
								}
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
				catch(err)
				{
					console.warn("Can not create Module folder!");
					console.log(err);
				}
			}
		} catch (err) {
			vscode.window.showInformationMessage('Pelease put ModuleTemplate.json in .vscode!!!');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeformatter.RenameModuleByTemplete', async (uri) => {
		var uriPath = uri.path
		if(uriPath) {
			if(fs.lstatSync(uriPath).isDirectory()) {
				var folderName = uriPath.substring(uriPath.lastIndexOf("/") + 1, uriPath.length);
				console.log(folderName);
				if(fs.existsSync(path.join(uriPath, "Doc")))
				{
					var options = {
						value: folderName,
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
							fileDisplay(uriPath, folderName, componentName);
							var uriPathNew = getData(uriPath, folderName, componentName);
							uriPathNew = uriPathNew.replace(/\r\n/g,'').replace(/\n/g,'').replace(/\s+/g,'');
							console.log(uriPathNew);
							try {
								fs.renameSync(uriPath, uriPathNew);
							}
							catch (e) {
								console.warn(e);
							}
							console.log("Rename Okay!!!");
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

function getBody(component, header, types, body_memap, body_option)
{
	var tmpResult = header
	for(let type of types)
	{
		for(let body of body_memap)
		{
			tmpResult += body + "\n"
		}
		tmpResult += "\n"
		tmpResult = getData(tmpResult, "%Section%", body_option + type);
		tmpResult = getData(tmpResult, "%ComponentName%", component);															
	}
	return tmpResult;
}


function getLine(text, str)
{
	let lines = text.split(/\r?\n/);
	for(let i in lines) {
		if(lines[i].indexOf(str) != -1) 
		return i;
	}
	return -1;
}

function getData(str, oldName, newName)
{
	var upperCon = false;
	var re =new RegExp(oldName,"gim");

	if((str.indexOf("#define") != -1) 
	    || (str.indexOf("#ifndef") != -1) 
		|| (str.indexOf("#endif") != -1)
		|| (str.indexOf("#elif defined") != -1)
		|| (str.indexOf("#undef") != -1))
	{
		upperCon = true;
	}

	return ((upperCon) ? (str.replace(re, newName.toUpperCase())) : 
						 (str.replace(re, newName)));
}

function fileDisplay(filePath, oldName, newName) 
{
	try 
	{
		let files = fs.readdirSync(filePath); 
		files.forEach(function(filename) 
		{
			try 
			{
				var filedir = path.join(filePath, filename);
				filedir = filedir.replace(/\r\n/g,'').replace(/\n/g,'').replace(/\s+/g,'');
				console.log(filedir);

				let stats = fs.statSync(filedir) 
				var isFile = stats.isFile(); 
				var isDir = stats.isDirectory();
				if (isFile) 
				{
					var filenameNew = filename.replace(oldName, newName);
					var filedirNew = path.join(filePath, filenameNew);
					filedirNew = filedirNew.replace(/\r\n/g,'').replace(/\n/g,'').replace(/\s+/g,'');
					console.log(filedirNew);
					try 
					{
						fs.renameSync(filedir, filedirNew);

						let result = "";
						let data = fs.readFileSync(filedirNew, 'utf8');
						// split the contents by new line
						let lines = data.split(/\r?\n/);
						// print all lines
						lines.forEach((line) => {result += getData(line, oldName, newName) + "\n";});
						try 
						{
							fs.writeFileSync(filedirNew, result, 'utf8');
						}
						catch(err)
						{
							return console.log(err);
						}
					}
					catch(err)
					{
						return console.log(err);
					}
				}
				if (isDir) 
				{
					fileDisplay(filedir, oldName, newName); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
				}
			}
			catch(err)
			{
				console.warn(err);
				console.warn('获取文件stats失败');
			}
		});
	}
	catch(err)
	{
		console.warn(err, "读取文件夹错误！");	
	}
}




// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
