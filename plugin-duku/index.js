var request = require('request');
module.exports = {
	getToken : function(callback) {
		request.get("http://w3inspire.com/api/user/oauth/token?username=mshodiqul&password=muzaki", function(err, response, body) {
			if (err) throw err;
			if (response.statusCode == 200) {
				return callback(JSON.parse(body).token);
			}
			return callback(null);
		})
	},
	insertContent : function(data, token, callback) {
		request({url : "http://w3inspire.com/api/content/insert/Inspire",
			method : "POST",
			json : true,
			headers : {
				"content-type" : "application/json",
				"token" : token
			},
			body : data
	}, function(err, response, body) {
			if (err) throw err;
			if (response.statusCode == 200) {
				return callback(body);
			}
			return callback(null);
		})
	}
}