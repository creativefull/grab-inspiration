function Web(db) {
	var request = require('request');
	var cheerio = require('cheerio');
	var shortid = require('shortid');
	var character = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@';
	shortid.characters(character);
	var ModelItem = db.collection('item');	
	var duku = require('../plugin-duku/');
	this.grab = function(req,res,next) {
		request('http://www.webdesign-inspiration.com/web-designs/page/1', function(error, response, html) {
			if (error) throw error;
			if (response.statusCode == 200) {
				var $ = cheerio.load(html);
				var dataItem = [];
				$("ul.items").find("li").each(function() {
					var objectData = {
						_id : shortid.generate(),
						title : $(this).find(".item-small-title").text(),
						urlItem : $(this).find("a.withicon").eq(0).attr("href"),
						website : $(this).find("a.withicon").eq(1).attr("href")
					}
					var jupukTag = function(data, callback) {
						var counter = 0;
						var hasilnya = [];
						(function next() {
							var list = data[counter++];
							if (!list) return callback(null, hasilnya);
							console.log('https://webdesign-inspiration.com' + list.urlItem);
							request('https://www.siteinspire.com' + list.urlItem, function(err, response2, html2) {
								if (err) return res.status(500).send(err);
								if (response.statusCode == 200) {
									var $s = cheerio.load(html2);
									var label = [];
									
								}
							});
						})();
					}
					dataItem.push(objectData);
				})
				res.json(dataItem);
			}
		});
	}
}
module.exports = Web;