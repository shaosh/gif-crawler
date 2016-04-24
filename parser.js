var cheerio = require('cheerio');

var Parser = function(){};

const PAGETYPE = {
	'INVALID': -1,
	'POST': 0,
	'PHOTO': 1
}

var gifSuffixRegex = /^.*(.gif)$/i;

Parser.prototype.getPageType = function(url){
	var postRegex = /(http(s?):\/\/)?bbs\.hupu\.com\/\d+(-([a-zA-Z\d]+))?\.html(#[\da-zA-Z]+)?/i,
		photoRegex = /(http(s?):\/\/)?my\.hupu\.com\/\d+\/photo\/[a-zA-Z](\d+)(-([a-zA-Z\d]+))?\.html/i;

	var pageType = PAGETYPE.INVALID;
	if(postRegex.test(url)){
		pageType = PAGETYPE.POST;
	}
	else if(photoRegex.test(url)){
		pageType = PAGETYPE.PHOTO;
	}
	else{
		console.log('Invalid hupu url');		
	}
	return pageType;

};


Parser.prototype.parse = function(content, url, nexturl){
	var $ = cheerio.load(content),
		obj = {},
		gifs = [];		
	var pagetype = this.getPageType(url);	
	switch(pagetype){
		case PAGETYPE.PHOTO:
			var imglist = $('.albumlist_list li img');			
			if(imglist.length < 1){
				return;
			}
			if($('.next').length > 0){
				nexturl = $($('.next')[0]).attr('href');
			}
			for(var i = 0; i < imglist.length; i++){
				var src = $(imglist[i]).attr('src');
				var title = $(imglist[i]).attr('title');
				var index = src.indexOf('small.gif');
				if( index > -1){
					var realsrc = src.substring(0, index) + '.gif';
					gifs.push(realsrc + '$$' + title);
				}
			}
			break;
		case PAGETYPE.POST:
			var floornumRegex = /(http(s?):\/\/)?bbs\.hupu\.com\/\d+(-([a-zA-Z\d]+))?\.html#[\da-zA-Z]+/i;
			var imglist = null;			
			if(floornumRegex.test(url)){
				var floornums = $('.floornum');				
				for(var i = 0; i < floornums.length; i++){
					var href = $(floornums[i]).attr('href');
					var floornum = href.substr(href.indexOf('#') + 1);
					var urlfloornum = url.substr(url.indexOf('#') + 1);					
					if(floornum === urlfloornum){
						var box = $(floornums[i]).closest( ".floor_box" );
						imglist = box.find('img');						
						break;
					}
				}
			}
			else{
				imglist = $('.floor_box img'); 
			}
			if(imglist !== null){				
				for(var i = 0; i < imglist.length; i++){
					var src = $(imglist[i]).attr('src');
					if(gifSuffixRegex.test(src)){						
						gifs.push(src);
					}
				}
			}
			break;		
	}
	return gifs;
};

module.exports = new Parser();
