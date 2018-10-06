const electron = require('electron');
const app = electron.app;
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendArgument('enable-transparent-visuals');
app.commandLine.appendArgument('disable-gpu');
app.commandLine.appendArgument("disable-renderer-backgrounding");
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendArgument('enable-transparent-visuals');
app.commandLine.appendArgument('disable-gpu');
app.commandLine.appendArgument("disable-renderer-backgrounding");
const fetch = require('electron-fetch');



const Menu = electron.Menu;
const menuTemplate = require('./menutemplate');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const instagram = require('./instagram');

//const autoUpdater = require('./autoupdater');

// fixes electron's timeout inconsistency
// not doing this on windows because the fix doesn't work for windows.
if (process.platform != 'win32') {
  require('./timeout-shim').fix();
}


var APIDEF = "https://new.replybot.online/api/api.php?";
var APIURL = APIDEF+"token=";


const RATE_LIMIT_DELAY = 60000;
let pollingInterval = 10000;

var LastMSG = [];

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let session
var GlobalToken = "";

function createWindow () {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      icon: `${__dirname}/../browser/img/icon.png`,
      minWidth: 500,
      minHeight: 400,
		frame: false
    })
  }
  mainWindow.setTitle('ReplyBOT Instagram Manager(IG:DM Base)')
  
  if(GlobalToken === ""){
	let view = '../browser/login.html'

	mainWindow.loadURL(url.format({
	  pathname: path.join(__dirname, view),
	  protocol: 'file:',
	  slashes: true
	}))
  }else{
	  CheckAuth();
  }
  mainWindow.on('closed', () => mainWindow = null)
  mainWindow.setMenu(null);
  //mainWindow.openDevTools();
}
function CheckAuth(){
	
  instagram.checkAuth(session).then((result) => {
	let view = result.isLoggedIn ? '../browser/index.html' : '../browser/login.html'
	session = result.session || session

	mainWindow.loadURL(url.format({
	  pathname: path.join(__dirname, view),
	  protocol: 'file:',
	  slashes: true
	}))
  })
}

function createCheckpointWindow() {
  const checkpointWindow = new BrowserWindow({
    width: 300,
    height: 398,
    resizable: false,
    icon: `${__dirname}/../browser/img/icon.png`,
	frame: false,
	alwaysOnTop:true,
  })
  checkpointWindow.setTitle('ReplyBOT Instagram Manager(IG:DM Base) - Onaylama kodu')
  checkpointWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../browser/checkpoint.html'),
    protocol: 'file:',
    slashes: true
  }))
  checkpointWindow.setMenu(null);
 // checkpointWindow.openDevTools();
  return checkpointWindow
}
var FirstTime = true;
var LastChats = [];
var OkunmamisChatler = [];
function getChatList () {
  console.log("getChatList");
  if (!session) {
    return
  }
  instagram.AcceptPendingChatList(session);
  instagram.getChatList(session).then((chats) => {
	//chat_.items[0]._params.text
	//console.log(chats);
	//console.log("chats._params.lastActivityAt : "+chats[0]+"\n----------------------------\n");
	//chats.forEach((chatx) => console.log(chatx._params.lastActivityAt+"\n----------------------------\n"));
	
	chats.forEach(function(chat_) {
		if(chat_._params.itemsSeenAt[chat_._params.viewerId]){
			LastMSG[chat_.id] = chat_._params.itemsSeenAt[chat_._params.viewerId].timestamp;
			//LastChats[chat_.id] = chat_;
		}else
			LastMSG[chat_.id] = -1;
	});
	
	 //console.log(LastMSG);
    mainWindow.webContents.send('chatList', chats);
	
	AutomateChats(chats);
	
    //setTimeout(getChatList, pollingInterval);
  }).catch(() => setTimeout(getChatList, RATE_LIMIT_DELAY))
}
function AutomateChats(chats){
	console.log("AutomateChats");
	/*if(FirstTime){
		chats.forEach(function(chat_) {
			LastChats[chat_.id] = chat_;
		});
	}*/
	//console.log(chats);
	chats.forEach(function(chat_) {
		var isNew;
		var FirstMSG = false;
		//if(chat_._params.title.equal("akdenizrifki")){
			//continue;
		//}
		//console.log(LastChats[chat_.id]);
		/*console.log(LastMSG[chat_.id]);
		if (chat_.id in LastChats){
			console.log("if("+chat_._params.title+")");
			//console.log("if("+chat_.id+")");
			isNew = (LastChats && LastChats[chat_.id] &&
				LastChats[chat_.id].items[0].id !== chat_.items[0].id
			);
		}else{
			//console.log("else("+chat_.id+")("+LastMSG[chat_.id]+")");
			isNew = true;
			
			if (!(chat_.id in LastMSG)){
				console.log("first msg2("+chat_._params.title+")");
				FirstMSG = true;
			}else{
				if(LastMSG[chat_.id] <= 100000){
					console.log("first msg("+chat_._params.title+")");
					FirstMSG = true;
				}else{
					console.log("first run("+chat_._params.title+")");
					//console.log("first run");
				}
			}
		}*/
		if(LastMSG[chat_.id] >= 0){
			// Daha önce konuşulmuş
			//console.log("Daha once konusulmus("+chat_._params.title+")("+LastMSG[chat_.id]+")");
			
			isNew = (LastChats && LastChats[chat_.id] &&
				LastChats[chat_.id].items[0].id !== chat_.items[0].id
			);
			FirstMSG = false;
			
		}else{
			// Daha Önce konuşulmamış
			//console.log("Daha once konusulmamis("+chat_._params.title+")");
			isNew = true;
			FirstMSG = true;
		}
		
		
		
		if (isNew){
			//OkunmamisChatler[chat_.id] = chat_;
			//console.log("Yeni Mesaj");
			GetNewMSGAndAnswer(chat_,FirstMSG);
		}
	});
	//console.log(OkunmamisChatler);
	/*chats.forEach(function(chat_) {
		ifchatsHash[chat_.id].items[0].id !== chat_.items[0].id
		//console.log(chat_);
		//console.log(chat_._params);
		//console.log("chat_._params.hasNewer : "+chat_._params.hasNewer);
		if(chat_._params.hasNewer){
			console.log("Yeni mesaj var("+chat_. id+")");
		}
	});*/
	chats.forEach(function(chat_) {
		LastChats[chat_.id] = chat_;
	});
	
	
	setTimeout(function(){ getChatList() }, 5000);
}

function GetNewMSGAndAnswer(chat_,first){
	//console.log("GetNewMSGAndAnswer");
	chat_.items.forEach(function(message){
		if(message._params.created > LastMSG[chat_.id]){
			if(message._params.text){
				var NewMSG = message._params.text;
				if(NewMSG && NewMSG.length > 1){
					const data = {
						message : NewMSG
					}
					
					
					//console.log("message._params.text : "+message._params.text);
					/*
					token yok session geri yüklendiği için, session a tokeni de kayıt et
					
					*/
					//console.log("Fetch url : "+APIURL+"&service=GetAnswer&first="+(first ? "1" : "0"));
					fetch(APIURL+"&service=GetAnswer&chatid="+chat_.id+"&first="+(first ? "1" : "0"),
						{
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(data)
					  })
					.then(res => res.json())
					.then(json => SendAnswer(chat_.id,json));
					//console.log("Yeni mesaj : "+message._params.text);
				}
			}
			LastMSG[chat_.id] = message._params.created;
		}
	});
}
function SendAnswer(chatid,json){
	if(json.success){
		if(json.data.length > 1){
			instagram.sendMessage(session, json.data, chatid)
		}else{
			//console.log("json.data : "+json.data);
			//console.log("Length : "+json.data.length);
		}
	}else{
		console.log("API failed");
	}
}
let timeoutObj;
let messagesThread;
function getChat (evt, id) {
  if (!session) {
    return
  }
  // used to get older messages, see #getOlderMessages
  if (messagesThread && messagesThread.threadId != id) {
    messagesThread = null
  }

  instagram.getChat(session, id).then((chat) => {
    mainWindow.webContents.send('chat', chat);
    if (timeoutObj) {
      clearTimeout(timeoutObj)
    }
    timeoutObj = setTimeout(getChat, pollingInterval, {}, id);
  }).catch(() => setTimeout(getChat, RATE_LIMIT_DELAY, evt, id))
}

function handleCheckpoint (checkpointError) {
  return new Promise((resolve, reject) => {
    instagram.startCheckpoint(checkpointError)
      .then((challenge) => {
        const cpWindow = createCheckpointWindow()
        electron.ipcMain.on('checkpointCode', (evt, data) => {
          electron.ipcMain.removeAllListeners('checkpointCode')
          cpWindow.close()
          challenge.code(data.code).then(resolve).catch(reject)
        })
      }).catch(reject)
  })
}

app.on('ready', () => {
  createWindow();
  // only set the menu template when in production mode/
  // this also leaves the dev console enabled when in dev mode.
  if (!process.defaultApp) {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu); 
  }
//  autoUpdater.init();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // only call createWindow afeter mainWindow is set to null at
  // mainWindow.on('closed')
  if (mainWindow === null) createWindow()
})

// reduce polling frequency when app is not active.
app.on('browser-window-blur', () => {
  pollingInterval = 30000;
})

app.on('browser-window-focus', () => {
  pollingInterval = 10000;
  app.setBadgeCount(0);
})

electron.ipcMain.on('login', (evt, data) => {
	//console.log("login accur");
  /*if(data.username === "" || data.password === "") {
    return mainWindow.webContents.send('loginError', "Please enter all required fields");
  }*/
  if(data.token === "") {
    return mainWindow.webContents.send('loginError', "Lütfen tokeni giriniz.");
  }
  SetLoginToken(data.token);
  GetLoginInfo();
})

//SetLoginToken("b405dcd9f42af8b7a819963f39d62ca366da0edb65a7776a62a241009b6727c6a4ab2160400dcd425790ae1417c871a8");
function SetLoginToken(token){
	APIURL = APIDEF+"token="+token;
	GlobalToken = token;
}
function GetLoginInfo(){
	//createWindow();
	const data = {
	}
	console.log("Fetch url : "+APIURL+"&service=GetLoginInfo");
	fetch(APIURL+"&service=GetLoginInfo",
		{
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
	  })
	.then(res => res.json())
	.then(json => BilgileriGetir(json));
}
/*function ApiResponse(txt){
	CloseLoader();
	if(txt.success){
		
	}else{
		//console.log("Failed");
		if(txt.error != "No method allowed before sign in")
			alert(txt.error,"Hata");
		return false;
	}
}*/
function BilgileriGetir(txt){
	if(txt.success){
		CheckAuth();
		console.log(txt.data);
		ProceedLogin(txt.data);
	}else{
		return mainWindow.webContents.send('loginError', "Hatalı token girdiniz!");
	}
}

function ProceedLogin(data){
  const login = (keepLastSession) => {
    instagram.login(data.username, data.password, keepLastSession).then((session_) => {
      session = session_
      createWindow()
    }).catch((error) => {
      if (instagram.isCheckpointError(error)) {
        handleCheckpoint(error)
          .then(() => login(true))
          .catch(() => mainWindow.webContents.send('loginError', getErrorMsg(error)))
      } else {
        mainWindow.webContents.send('loginError', getErrorMsg(error));
      }
    })
  }

  const getErrorMsg = (error) => {
    let message = 'An unknown error occurred.';
    if (error.message) {
      message = error.message;
    } else if (error.hasOwnProperty('json') && !!error.json.two_factor_required) {
      message = 'Lütfen two-factor ü kapatınız';
    }
    return message
  }

  login()
}

electron.ipcMain.on('logout', () => {
  instagram.logout()
  session = null
  createWindow()
})

electron.ipcMain.on('getLoggedInUser', () => {
  instagram.getLoggedInUser(session).then((user) => {
    mainWindow.webContents.send('loggedInUser', user);
  })
})

electron.ipcMain.on('getChatList', getChatList)

electron.ipcMain.on('getChat', getChat)

electron.ipcMain.on('getOlderMessages', (_, id) => {
	//console.log("getOlderMessages");
  instagram.getOlderMessages(session, messagesThread, id)
    .then((data) => {
      messagesThread = data.thread
      mainWindow.webContents.send('olderMessages', data.messages)
    })
})
electron.ipcMain.on('message', (_, data) => {
  if (data.isNewChat) {
    instagram.sendNewChatMessage(session, data.message, data.users).then((chat) => getChat(null, chat[0].id))
  } else {
    instagram.sendMessage(session, data.message, data.chatId)
  }
})

electron.ipcMain.on('upload', (_, data) => {
  instagram.uploadFile(session, data.filePath, data.recipients)
    .then((chat) => {
      if (data.isNewChat) getChat(null, chat[0].id)
    })
})

electron.ipcMain.on('searchUsers', (_, search) => {
  instagram.searchUsers(session, search).then((users) => {
    mainWindow.webContents.send('searchResult', users);
  })
})

electron.ipcMain.on('markAsRead', (_, thread) => {
  instagram.seen(session, thread)
})

electron.ipcMain.on('increase-badge-count', (_) => {
  app.setBadgeCount(app.getBadgeCount() + 1);
})

electron.ipcMain.on('getUnfollowers', (_) => {
  instagram.getUnfollowers(session).then((users) => {
    mainWindow.webContents.send('unfollowers', users)
  })
})

electron.ipcMain.on('unfollow', (_, userId) => {
  instagram.unfollow(session, userId)
})
