var request = require('superagent')
	, path = require('path')
	, defer = require('defer')
exports = module.exports = Note

function Note($scope, $location){
	var file = $location.path()
	$scope.name = path.basename(file, path.extname(file)).replace(/-/g, ' ')
	request
		.get('/api/get/' + file)
		.set('Accept', 'application/json')
		.end(function(error, res){
			console.log('hello', res, error)
			$scope.content = res.text
			$scope.$apply()
		})
}

function list(path){
	var d = defer()
	request
	.get('/api/list/' + path)
	.set('Accept', 'application/json')
	.end(function(error, res){
		if(error || error = res.body && res.body.error) return d.reject(error)
		d.resolve(res.body.data)
	})
	return d.promise
}