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



app.controller('TopBar', TopBar)
app.controller('Home', require('home'))
app.controller('Note', require('note'))