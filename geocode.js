
var request = require('request');
var Promise = require('promise');
var fs = require('fs');
var config = JSON.parse(
    fs.readFileSync('settings.json')
);

const APIKEY = config.keys.geocoding;

let endpoint = `https://maps.googleapis.com/maps/api/geocode/json?key=${APIKEY}&address=`;

var teamdata = JSON.parse(
    fs.readFileSync('data3.json')
);

function getData(team) {
	console.log('processing %d', team.teamNumber);
	let address = encodeURIComponent(`${team.city}, ${team.stateProv}, ${team.country}`);
	return new Promise(function resolver(resolve, reject){
		request({
			url: endpoint+address,
			strictSSL : false,
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
			}if (data.status !== "OK") {
				reject(data);
			}
			resolve(data);
		});
	});
}

function getDataRecursive(index=1000) {
	return getData(teamdata[index])
	.then(function onFulfilled(data) {
		teamdata[index].location = data.results[0].geometry.location;
		index++;
		if (index < 2000) { //teamdata.length
			return getDataRecursive(index);
		}
	}, function onRejected(error) {
		console.log("ERROR", teamdata[index].teamNumber, error);
	});
}


getDataRecursive().then(function onFulfilled(data) {
	console.log('write file');
	fs.writeFile('data3.json', JSON.stringify(teamdata, null, '\t'), function(err){
		if (err) console.log(err);
	})
}, function onRejected(error) {
	console.log("ERROR", error);
});


// let promises = [];
// for (var i = 0; i < 25; i++) {//teamdata.length
// 	let team = teamdata[i];

// 	let p = getData(team).then(function onFulfilled(data) {
// 		team.location = data.results[0].geometry.location;
// 		console.log("Processing %d", team.teamNumber);
// 	}, function onRejected(error) {
// 		console.log("ERROR", error);
// 	});
// 	promises.push(p);
// }

// Promise.all(promises).then(values => {
// 	console.log("Write file");
// 	fs.writeFile('data2.json', JSON.stringify(teamdata, null, '\t'), function(err){
// 		if (err) console.log(err);
// 	});
// });





