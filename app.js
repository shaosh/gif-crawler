var crawler = require('./crawler.js'),
	cacher = require('./cacher.js'),
	parser = require('./parser.js'),
	writer = require('./writer.js'),
	cheerio = require('cheerio'),
	mkdirp = require('mkdirp');

var urlList = [];
var bases = ['http://bbs.hupu.com/2266222.html#tpc'],//['http://my.hupu.com/202360/photo/a97431-1.html'],
	base = bases[0],
	url = base,
	count = 0;
var targetPath = 'D:\\Documents\\gifs';

const PAGETYPE = {
	'INVALID': -1,
	'POST': 0,
	'PHOTO': 1
};

var photoHtmlRegex = /[a-zA-Z]\d+(-([a-zA-Z\d]+)?)\.html/i;
var postHtmlRegex = /\d+(-([a-zA-Z\d]+))?\.html/i;
var gifNameRegex = /[\da-zA-Z]+(.gif)$/i;

var crawl = function(url){
	if(!url){return;}
	urlList.push(url);
	crawler.get(url, function(err, content, status){
		if(err){
			console.log('crawler.get ERROR: ', err);
			return;
		}
		if(status !== 200){
			console.log('crawler.get invalid status: ', status);
			return;
		}
		var $ = cheerio.load(content);
		if(parser.getPageType(url) === PAGETYPE.PHOTO && $('.next').length > 0){
			url = $($('.next')[0]).attr('href');
		}
		else if(count < bases.length - 1){
			count++;
			base = bases[count];
			url = base;
		}
		else{
			url = null;
		}

		if(url){
			crawl(url);
		}
		else{
			parse();
			return;
		}
	});
};

var parse = function(){
	urlList.forEach(function(value, index){
		var content = cacher.get(url, function(err, data){
			if(err){
				console.log('cacher.get ERROR: ', err);
				return;
			}
			var next = null;
			var gifs = parser.parse(data, url, next);
			if(gifs){
				gifs.forEach(function(gif, index){
					var pageType = parser.getPageType(url);
					var folderName = getFolderName(url, pageType);
					if(folderName){
						var finalPath = targetPath + '/' + folderName
						mkdirp.sync(finalPath);
						if(pageType === PAGETYPE.PHOTO){
							var $$index = gif.indexOf('$$');
							var title = gif.substr($$index + 2);
							gif = gif.substring(0, $$index);
							finalPath = finalPath + '/' + title;
						}
						else{
							var name = gif.match(gifNameRegex);
							finalPath = finalPath + '/' + name[0];
						}
						writer.downloadFile(gif, finalPath, function(){});
					}					
				});
			}
		});
	});
};

var getFolderName = function(url, pagetype){
	var name = null;
	switch(pagetype){
		case PAGETYPE.PHOTO:
			var match = url.match(photoHtmlRegex);
			if(match){
				var index = match[0].indexOf('-');
				if(index < 0){
					index = match[0].indexOf('.');
				}
				match = match[0].substring(0, index);
				name = 'photo-' + match;
			}
			break;
		case PAGETYPE.POST:
			var match = url.match(postHtmlRegex);
			if(match){
				var index = match[0].indexOf('-');
				if(index < 0){
					index = match[0].indexOf('.');
				}
				match = match[0].substring(0, index);
				name = 'post-' + match;
			}
			break;
	}
	return name;
}

crawl(url)