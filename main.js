const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const ipcMain = electron.ipcMain
const Menu = electron.Menu
const fs = require('fs')

let mainWindow

ipcMain.on('show-window', function () {

})

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
	  title: '远洋星拨号系统',
	  show: false,
	  icon: 'icon.png',
	  resizable: true,
	  webPreferences: {
		  nodeIntegration: false,
		  webSecurity: false,
		  allowRunningInsecureContent: true
	  }
  })

  mainWindow.loadURL('http://oa.ffzxnet.com/bh-oa-web/index.do')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })  
  
  mainWindow.once('ready-to-show', () => {	  
	  mainWindow.show()	  
  })
  
  mainWindow.maximize()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

/* 定义菜单 ================================================================================== */

let template = [{
  label: '编辑',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: '查看',
  submenu: [{
    label: '刷新',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        // 重载之后, 刷新并关闭所有的次要窗体
        if (focusedWindow.id === 1) {
          BrowserWindow.getAllWindows().forEach(function (win) {
            if (win.id > 1) {
              win.close()
            }
          })
        }
        focusedWindow.reload()
      }
    }
  }, {
    label: '切换全屏',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    label: '切换开发者工具',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }]
}, {
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '抓屏',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+C'
      } else {
        return 'Ctrl+Shift+C'
      }
    })(),
	click: function (item, focusedWindow) {
		if (focusedWindow) {
			mainWindow.capturePage( (image) => {
				const _date = new Date()
				let fileName = __dirname + '/远洋星拨号系统抓屏-'+ (new Date()).format('yyyy-MM-dd_HHmmss') +'.png'
				fs.writeFile(fileName, image.toPNG(), (err) => {
					electron.shell.openExternal(fileName)					
				})
		  })
		}
	}
  },
  {
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  },

	{
    label: '退出系统',
	accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Q'
      } else {
        return 'Ctrl+Q'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        const options = {
          type: 'info',
          title: '退出拨号系统',
          buttons: ['取消', '退出'],
          message: '注意：未保存的数据将丢失！确定退出正在使用的拨号系统？'
        }
        electron.dialog.showMessageBox(focusedWindow, options, function (response, checkboxChecked) {
			if (response == 1) {
				mainWindow.loadURL('http://oa.ffzxnet.com/bh-oa-web/logout.do')
			}
		})
      }
    }
  }, {
    label: '关闭窗口',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }/*, {
    type: 'separator'
  } , {
    label: '重新打开窗口',
    accelerator: 'CmdOrCtrl+Shift+T',
    enabled: false,
    key: 'reopenMenuItem',
    click: function () {
      app.emit('activate')
    }
  } */]
}, {
  label: '帮助',
  role: 'help',
  submenu: [{
    label: '技术支持',
    click: function () {
      electron.shell.openExternal('http://www.ffzxnet.com')
    }
  }]
}
]

function addUpdateMenuItems (items, position) {
  if (process.mas) return

  const version = electron.app.getVersion()
  let updateItems = [{
    label: `Version ${version}`,
    enabled: false
  }, {
    label: '正在检查更新',
    enabled: false,
    key: 'checkingForUpdate'
  }, {
    label: '检查更新',
    visible: false,
    key: 'checkForUpdate',
    click: function () {
      require('electron').autoUpdater.checkForUpdates()
    }
  }, {
    label: '重启并安装更新',
    enabled: true,
    visible: false,
    key: 'restartToUpdate',
    click: function () {
      require('electron').autoUpdater.quitAndInstall()
    }
  }]

  items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem () {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  })
  return reopenMenuItem
}

if (process.platform === 'darwin') {
  const name = electron.app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: `关于 ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: '服务',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `隐藏 ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: '隐藏其它',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: '显示全部',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: '退出',
      accelerator: 'Command+Q',
      click: function () {
        app.quit()
      }
    }]
  })

  // 窗口菜单.
  template[3].submenu.push({
    type: 'separator'
  }, {
    label: '前置所有',
    role: 'front'
  })

  addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', function () {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', function () {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})
/* （结束）定义菜单 ========================================================================== */


Date.prototype.format=function(fmt) {           
		var o = {           
		"M+" : this.getMonth()+1, //月份           
		"d+" : this.getDate(), //日           
		"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时           
		"H+" : this.getHours(), //小时           
		"m+" : this.getMinutes(), //分           
		"s+" : this.getSeconds(), //秒           
		"q+" : Math.floor((this.getMonth()+3)/3), //季度           
		"S" : this.getMilliseconds() //毫秒           
		};           
		var week = {           
		"0" : "日",           
		"1" : "一",           
		"2" : "二",           
		"3" : "三",           
		"4" : "四",           
		"5" : "五",           
		"6" : "六"          
		};           
		if(/(y+)/.test(fmt)){           
			fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));           
		}           
		if(/(E+)/.test(fmt)){           
			fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "星期" : "周") : "")+week[this.getDay()+""]);           
		}           
		for(var k in o){           
			if(new RegExp("("+ k +")").test(fmt)){           
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));           
			}           
		}           
		return fmt;           
	}