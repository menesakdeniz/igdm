var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;


document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').onsubmit = (e) => {
    e.preventDefault()
    let button = document.querySelector('button[type=submit]');
    button.innerText = 'Giriş yapılıyor...'
    button.classList.add('loggingIn', 'disabled');
/*
    var username = document.querySelector('input[name=username]').value;
    var password = document.querySelector('input[name=password]').value;*/
    var token = document.querySelector('input[name=token]').value;
	//console.log("token");
    //ipcRenderer.send('login', { username, password })
    ipcRenderer.send('login', { token })
  }

  ipcRenderer.on('loginError', (evt, errorMessage) => {
    let button = document.querySelector('button[type=submit]');
    button.classList.remove('loggingIn', 'disabled');
    button.innerText = 'Giriş yap'
    const errorElement = document.getElementById('error');
    errorElement.innerHTML = errorMessage;
  });

  //document.querySelector('a').onclick = () => electron.shell.openExternal("https://github.com/ifedapoolarewaju/igdm")
})