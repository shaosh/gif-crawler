var http = require('http'),
	request = require('request'),
	cacher = require('./cacher.js');

var Crawler = function(){};

Crawler.prototype.get = function(url, callback){
	cacher.get(url, function(err, content){
		if(err) return callback(err);
		if(content) return callback(null, content, 200);
		request({url:url, headers:{'User-Agent':'request'}}, function(error, response, body){
			if(err) return callback(err);
			if(!!response && response.statusCode === 200){
				cacher.put(url, body, function(err){
					if(err) return callback(err);
					callback(null, body, response.statusCode);
				});
			}
			else{
				return callback(new Error('Invalid status code for "' + url + '":' + response.statusCode));
			}
		});
	});
}

module.exports = new Crawler();