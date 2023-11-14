const asar = require('@electron/asar');
const fs = require('fs');
const path = require('path');

const src = './app';
const dest = './app.asar';
const bak = './app.before.lang.bak.asar';


async function main() {
	// var s = await asar.extractFile(dest, `${sFilePath}`);
	
	console.log('Parse startUML resource ...');
	if (!fs.existsSync(bak)) {
		try {
			fs.copyFileSync(dest, bak);
		} catch (error) {
			console.error('确保是从程序路径　～startUML\＼resources　目录中执行');
			throw error;
		}
		
	}
	await asar.extractAll(dest, src);

	console.log('Insert language package ...');
	fs.copyFileSync('./langPackage.json', `${src}/langPackage.json`);


	warpFileContent(`${src}/src/app-context.js`, [

		['super()', `super();\n${sConstructor}\n`],
		['start() {', `${sMethod}\nstart() {`],
		['this.menu.add(menus["menu"]);', `${sLoadDefaultMenusJsonFiles}\nthis.menu.add(menus["menu"]);`],
		['this.preferences.register(prefs);', `${sLoadDefaultPreferencesJsonFiles}\nthis.preferences.register(prefs);`],

	]);
	warpFileContent(`${src}/src/extensibility/extension-loader.js`, [

		['fun(obj)', `${sLoadJsonFiles}\nfun(obj)`],

	]);


	await asar.createPackage(src, dest.replace('app.', 'app.'));
	console.log(`安装中文包完成。Install language package done. \n\n直接运行starUML使用。（如果汉化后程序报错，可将 ${bak} 重命名为 app.asar ，以恢复原版运行）`);

};


function warpFileContent(filePath, replaceArr) {
	var sign = '/*language-had-insert*/';
	var sFilePath = filePath.replaceAll('/', path.sep);
	var sFile = fs.readFileSync(filePath).toString();
	if (~sFile.indexOf(sign)) {
		return;
	}
	
	console.log('Insert language warp ...');

	replaceArr.forEach(arrDo => {
		sFile = sFile.replace(arrDo[0], arrDo[1]);
	});

	sFile = sign+'\n' + sFile;
	
	fs.writeFileSync(filePath, sFile);
	
}


var sConstructor = `

	this._langPackage = JSON.parse(fs.readFileSync(path.join((process.type === 'browser' ? require('electron').app.getAppPath() : ipcRenderer.sendSync('get-app-path')), 'langPackage.json')).toString());
	this.langPackageWarp = this._langPackageWarp();
`;

var sLoadDefaultMenusJsonFiles = `
	this.langPackageWarp([\`/menus/${process.platform}\`, menus], (type, sub, o, path) => {
		this._langItemCope(o, type+'|'+path);
	});
`;

var sLoadDefaultPreferencesJsonFiles = `
	this.langPackageWarp(['/preferences/default', prefs], (type, sub, o, path) => {
		this._langItemCope(o, type+'|'+path);
	});
`;

var sLoadJsonFiles = `
	app.langPackageWarp([file, obj], (type, sub, o, path) => {
		app._langItemCope(o, type+'|'+path);
	});
`;

var sMethod = `
_langPackageWarp () {
	var _fun = function ([path,v], cb) {console.log([path,v]);
		let [sub, type] = path.replaceAll('\\\\', '/').split('/').slice(-2);
		type = type.split('.').shift();
		
		if (sub == 'menus') {
			_fun.traverseSubmenu(v.menu, _fun.joinGap(sub, 'menu')).forEach(res => {
				cb(type, sub, res.item, res.path);
			});
			
			for (const [subMenu, o] of Object.entries((v?.['context-menu'] || {}))) {
				_fun.traverseSubmenu(o, _fun.joinGap(sub, 'context-menu', subMenu)).forEach(res => {
					cb(type, sub, res.item, res.path);
				});
			}
		}
		if (sub == 'preferences') {
			for (const [id, oV] of Object.entries(v.schema)) {
				oV.id = id;
				cb(type, sub, oV, [sub, 'schema'].join('|'));
				(oV?.options||[]).forEach(o => {
					o.id = id+'.'+o.value;
					cb(type, sub, o, [sub, 'schema', 'options'].join('|'));
				});
			};
		}
		if (sub == 'quickedits') {
			for (const [id, oV] of Object.entries(v.components)) {
				cb(type, sub, oV, [sub, 'components'].join('|'));
				(oV?.items||[]).forEach(o => {
					o.id = id+'.'+o.value;
					cb(type, sub, o, [sub, 'components', o.id, 'items'].join('|'));
				});
			};
		}
		if (sub == 'toolbox') {
			v.forEach(o => {
				cb(type, sub, o, [sub, o.id].join('|'));
				(o?.items||[]).forEach(o => {
					cb(type, sub, o, [sub, o.id, 'items'].join('|'));
				});
			});
		}

		
	};

	
	_fun.traverseSubmenu = function (json, parentPath = '') {
		let result = [];
	
		json.forEach(item => {
			let currentPath = parentPath + '|' + item.id;
		
			item.id && result.push({
				id: item.id,
				path: parentPath,
				item
			});
		
			if (item.submenu) {
			result = result.concat(_fun.traverseSubmenu(item.submenu, currentPath));
			}
		});

		return result;
	};

	_fun.joinGap = function(...arr) {
		return arr.join('|');
	};

	return _fun;
	}

_langItemCope (o, path) {
	var oLang = this._langPackage[o.id];
	var bImmerse = this._langPackage['language-immerse'];
	if (oLang) {
		var oTarget = oLang;
		if ((oLang.list||[oLang]).some(o=>{
		if (o.path == path) {
			oTarget = o;
			return true;
		}
		})) {
			let lang = oTarget.lang || oLang.lang;
			let text = oTarget.text || oLang.text;
			if (lang && lang != text) {
				o[oTarget.labelType] = bImmerse ? lang : (text + '(' +lang +')');
			}
			if (oLang.descriptionLang && (oLang.description != oLang.descriptionLang)) {
				o.description = bImmerse ? oLang.descriptionLang : (o.description + '\\n(' +oLang.descriptionLang +')');
			}
		}
	}
}
`;


main();