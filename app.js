
/**
 * Module dependencies.
 */

var express = require('express')
  , routes  = require('./routes')
  , user    = require('./routes/user')
  , http    = require('http')
  , ejs     = require('ejs')
  , fs      = require('fs')
  , nfn     = require('when/node/function')
  , pipe    = require('when/pipeline')
  , when    = require('when')
  , marked  = require('marked') 
  , path    = require('path');
              require('sugar')

var app = express()
	, all = when.all
	, map = when.map
	, merge = Object.merge
	, defer = when.defer
	, _ = Object.extended

marked.setOptions({
	gfm: true,
	table: true,
	breaks: true,
	sanitize: false,
	smartLists: false
})

var rootDir = path.join(process.env.HOME, '/Google Drive/School Notes')
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(function(req, res, next){
	var file = req.path.replace(/\-/g, ' ')
	fs.exists(path.join(rootDir, file), function(exists){
		if(exists){
			routes.index(req, res, next)
		} else{
			next();
		}
	})
})
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/index.html', routes.index)
app.get('/', routes.index);
app.get('/api/list', function(req, res, next){
	dir(rootDir)
		.then(format(rootDir))
		.then(filter)
		.then(send(res), next)
})
app.get('/api/list/*', function(req, res, next){
	var file = path.join(rootDir, path.relative('/api/list/', unescape(req.path).replace(/\-/g, ' ')));
	stat(file).then(function(info){
		var folder = info.isDirectory() ? file : path.dirname(file)
		dir(folder)
		.then(format(folder))
		.then(filter)
		.then(send(res), next)
	}, next)
})

app.get('/api/get/*', function(req, res, next){
	console.log('in here')
	var file = path.join(rootDir, path.relative('/api/get/', unescape(req.path).replace(/\-/g, ' ')));
	fs.readFile(file, {encoding: 'utf8'}, function(err, content){
		if(err) next(err)
		else res.send(marked(content))
	})
})
app.get('/api/*', function(err, req, res, next){
	res.json({error:{message: err.message, name: err.name}})
})



function send(res){
	return function(files){
		res.send({data: files})
	}
}
function dir(path){
	return nfn.call(fs.readdir, path)
}

function filter(files){
	return files.filter(function(file){
		return file.name.substr(0, 1) != '.' && (file.isDirectory || ['.md', '.webloc'].indexOf(file.ext) > -1)
	})
}

function format(root){
	return function(files){
		return map(files, function(file){
			file = path.join(root, file)
			return stat(file).then(info.bind(null, file))
		})
	}
}

function info(file, stat){
	return {
		path: '/' + path.relative(rootDir, file).replace(/ /g , '-'),
		dir: path.dirname(file),
		ext: path.extname(file),
		name: path.basename(file, path.extname(file)),
		isFile: stat.isFile(),
		isDirectory: stat.isDirectory(),
		created: stat.ctime,
		updated: stat.mtime,
		accessed: stat.atime
	}
}

function stat(file){
	return nfn.call(fs.stat, file)
}
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
