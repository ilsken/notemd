var emitter = require('emitter')
	, request = require('superagent')
	, path = require('path')
	, app = angular.module('Markbook', [])

app.config(function($locationProvider, $routeProvider){
	$locationProvider.html5Mode(true).hashPrefix('!')
	$routeProvider.when('/', {
		controller: 'Home',
		template: require('home/template')
	})
	$routeProvider.otherwise( {
		controller: 'Note',
		template: require('note/template')
	})
})

app.factory('$error', function(){
	return function(error){
		alert('error: ', error.message)
	}
})

function TopBar($scope,$location, $error){
	var base = window.location.protocol + "//" +window.location.host;
	$scope.isRoot = function(){
		return $location.path() == '/'
	}
	$scope.isActive = function(dir){
		return !$scope.isRoot() && path
			.relative($location.path(), dir).indexOf('../') == -1 
	}
	$scope.go = function(event){
		var target = event.target
		if(target.nodeName == 'A'){
			$location.path(target.href.replace(base, ''))
			//$location.url(target.href)
			event.preventDefault();	
		}
	}
	request
		.get('/api/list')
		.set('Accept', 'application/json')
		.end(function(res){
			if(res.serverError) return $error({message: res.serverError})
			if(res.body.data.error) return $error(res.body.data)
			$scope.categories = res.body.data.filter(function(file){
				return file.isDirectory
			})
			$scope.$apply()
		})
}

function SideBar($scope, $location, $error, $route){
	var lastDir = null;
	var lastFiles = [];
	var lastDirs = [];
	$scope.upDirectory = function(){
		if(lastFiles.indexOf($location.path()) > -1)
			$location.url(path.dirname(path.dirname($location.path())))
		else 	
			$location.url(path.dirname($location.path()))
	}
	$scope.$on('$routeChangeSuccess', function(next, current) { 

	   request.get('/api/list' + $location.path())
	   .set('Accept', 'application/json')
	   .end(function(err, res){
	   		if(err || res.body.error) return $error(err)
	   		var data = res.body.data;
	   		console.log('got list ', data)
	   		var newDirs = data.filter(function(file){
	   			return file.isDirectory
	   		})
	   		var newDirNames = newDirs.map('path').sort()
	   		if(!Object.equal(newDirNames, lastDirs)){
	   			lastDirs = newDirNames
	   			$scope.directories = newDirs;
	   		}
	   		var newFiles = data.filter(function(file){
	   			return file.isFile
	   		})
	   		var newFileNames = newFiles.map('path').sort()
	   		if(!Object.equal(newFileNames, lastFiles)){
	   			lastFiles = newFileNames;
	   			$scope.files = newFiles;
	   		}
	   		$scope.$apply();
	   })
	 });
}

function Breadcrumbs($scope, $location){
	$scope.breadcrumbs = [{
		name: 'Home',
		path: '/'
	}]
	$scope.$on('$routeChangeSuccess', function(){
		var breadcrumbs = []
			, parts = $location.path().split('/')

		parts.forEach(function(part, i){
			console.log('adding part yaa', part)
			var name = part && part.replace(/\-+/g, ' ') || 'Home';
			breadcrumbs.push({
				name: path.basename(name, path.extname(name)),
				path: parts.slice(0, i+1).join('/')
			})
		})
		$scope.breadcrumbs = breadcrumbs
	})
}

app.controller('TopBar', TopBar)
app.controller('SideBar', SideBar)
app.controller('Breadcrumbs', Breadcrumbs)
app.controller('Home', require('home'))
app.controller('Note', require('note'))