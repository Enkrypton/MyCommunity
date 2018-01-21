const lib = require('lib')({token: ""});
const GeoHash = require('geohasher');
/**
*@param {float} lat
*@param {float} log
*@param {string} name
*@param {string} id
*@returns {string}
**/
module.exports = (lat,log,name,id, context, callback) => {
	main(lat,log,name,id ,context, callback)
};

async function main(lat,log,name,id , context,callback){
	var msg = JSON.parse(await lib.utils.storage.get('user'));
	msg[id] = {
		'name':name,
		'location': GeoHash.encode(log, lat).substring(0, 5)
	}
	await lib.utils.storage.set('user', JSON.stringify(msg));
	callback(null,name + ' has sucessfully registered')
}