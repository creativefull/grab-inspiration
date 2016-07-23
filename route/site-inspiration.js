function Site(db) {
	var request = require('request');
	var cheerio = require('cheerio');
	var shortid = require('shortid');
	var character = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@';
	shortid.characters(character);
	var ModelItem = db.collection('item');	
	var duku = require('../plugin-duku/');

	this.grab = function(req,res,next) {
		var totalPage = req.query.total || 0;
		var eksekusi = function(number, callback) {
			var c = 0;
			(function lanjut() {
				c+=1;
				console.log("Hitungan Ke ", c);
				if (c==req.query.total) return callback(null, "selesai");
				request('https://www.siteinspire.com/websites?page=' + c, function(error, response, html) {
					if (error) return res.status(500).send("Error");
					if (response.statusCode == 200) {
						var $ = cheerio.load(html);
						var dataItem = [];
						var dataDepan = function(data, callback) {
							var cd = 0;
							var hasilnya = [];
							(function next1() {
								var list = data[cd++];
								if (!list) return callback(null, hasilnya);
								ModelItem.findOne({urlItem : list.urlItem}, function(err, perItem) {
									if (!perItem) {
										hasilnya.push(list);
									}
									next1();
								});
							})();
						}
						$("#grid").find(".thumbnail").each(function() {
							var urlItem = $(this).find(".image").find("a.main").attr("href");
							var urlSite = $(this).find(".visit").attr("href");
							if (urlItem && urlSite) {
								var objectSite = {
									_id : shortid.generate(),
									title : $(this).find(".title > a").text().replace(new RegExp("\n", "gi"), ""),
									image : $(this).find(".image").find("img").attr("src").replace(new RegExp("small","gi"), "medium"),
									urlItem : urlItem&&urlItem,
									website : urlSite&&urlSite,
									source : 'siteinspire.com',
									content : "",
									button : "<a href=\"" + urlItem&&urlItem + "\" rel=\"nofollow\" target=\"_blank\" class=\"btn btn-link\">Visit Site</a>",
									created_at : new Date()
								}
								dataItem.push(objectSite);
							}
						});

						var jupukTag = function(data, callback) {
							var counter = 0;
							var hasilnya = [];
							(function next() {
								var list = data[counter++];
								if (!list) return callback(null, hasilnya);
								console.log('https://www.siteinspire.com' + list.urlItem);
								request('https://www.siteinspire.com' + list.urlItem, function(err, response2, html2) {
									if (err) return res.status(500).send(err);
									if (response.statusCode == 200) {
										var $s = cheerio.load(html2);
										var label = [];
										$s("#website_categories").find(".context").each(function() {
											var object = {
												label : $s(this).find(".heading > a").text(),
												value : []
											}
											$s(this).find("ul > li").each(function() {
												object['value'].push($s(this).find("a").text());
											});
											label.push(object);
										})
										list['tag'] = label;
										hasilnya.push(list);
										next();
									}
									else {
										next();
									}
								})
							})();
						}
						dataDepan(dataItem, function(err, datameneh) {
							jupukTag(datameneh, function(err, content) {
								if (content.length != 0) {
									ModelItem.insert(content, function(err, result) {
										if (err) throw err;
										// ///// IMPORT DUKU
										var dataToImport = [];
										content.forEach(function(d) {
											var objectnya = {
												title : d.title,
												image : d.image,
												website : d.website,
												button : "<a href=\"" + d.website + "\" rel=\"nofollow\" target=\"_blank\" class=\"btn btn-link\">Visit Site</a>",
												content : ""
											};
											d.tag.forEach(function(t) {
												objectnya[t['label']] = t['value'];
											})
											dataToImport.push(objectnya);
										})
										duku.getToken(function(token) {
											duku.insertContent(dataToImport, token, function(hasil) {
												console.log(hasil);
											});
										})
										// IMPORT DUKU
										lanjut();
									});
								}
								else {
									lanjut();
								}
							})
						})
					}
					else {
						lanjut();
					}
				});
			})();
		}
		eksekusi(totalPage, function(err, data) {
			res.send("Selesai :)");
		});
	}
}
module.exports = Site;