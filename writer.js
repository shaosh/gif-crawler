var fs = require('fs'),
	request = require('request');

var Writer = function(){};

Writer.prototype.downloadFile = function(url, path, callback){
	console.log('\t\t\t -> Downloading file from %s', url);

	fs.exists(path, function(exists){
		if(exists){
			console.log('\t\t\t\t -> Download file %s already exists on disk', path);
			return callback(null);
		}
		else{
			request(url, callback).pipe(fs.createWriteStream(path));
		}
	});
};

module.exports = new Writer();