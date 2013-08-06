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
			$scope.content = res.text
			$scope.$apply()
			MathJax.Hub.Reprocess('container')
		})
}
