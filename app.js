

var request = require('request');
var Promise = require('promise');
var fs = require('fs');
var config = JSON.parse(
    fs.readFileSync('settings.json')
);

let endpoint = "frc-api.firstinspires.org/v2.0/2016/teams";


const user = "techplexengineerT5122";
const pass = config.keys.FRCAPI;

// let resp = request.get(endpoint);//.auth(user, pass);
// resp.on('response', function(response) {
// 	console.log(err, response, body)
// 	// console.log(response.headers['content-type'])
// });

var username = 'username',
	password = 'password',
	url = `https://${user}:${pass}@${endpoint}`;

function getData(page=1) {
	return new Promise(function resolver(resolve, reject){
		request({
			url: url,
			strictSSL : false,
			qs: {
				page:page
			}
		}, function (error, response, body) {
			// Do more stuff with 'body' here
			if (error) {
				reject(error);
				return;
			}
			let data;
			try {
				data = JSON.parse(body);
			} catch(e) {
				reject(e);
				return;
			}
			resolve(data);
			console.log('pageCurrent', data.pageCurrent);
			console.log('pageTotal', data.pageTotal);
		});
	});
}

function getTeamsRecursive(page=1, records=[]) {
	return getData(page)
	.then(function onFulfilled(data) {
		page++;
		records.push(data.teams);
		if (page <= data.pageTotal) {
			return getTeamsRecursive(page, records)
		}
		return records;

		console.log(data);
	}, function onRejected(error) {
		console.log("ERROR", error);
	});
}


getTeamsRecursive().then(function onFulfilled(data) {
	console.log(data);
}, function onRejected(error) {
	console.log("ERROR", error);
});