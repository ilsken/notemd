var Promise = require('promise')

function defer(){
	var d = {}
	d.promise = new Promise(function(resolve, reject){
		d.resolve = resolve
		d.reject = reject
	})
	return d
}

module.exports = defer