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

fetch.fetch('http://github.com/')
    .then(res => res.text())
    .then(body => console.log(body))
