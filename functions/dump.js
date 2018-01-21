const lib = require('lib')({token: ""});
module.exports = (context, callback) => {
	main(context, callback)
};

async function main(context,callback){
	callback(null,`user: ${(await lib.utils.storage.get('user'))}\nmsg: ${(await lib.utils.storage.get('list'))}`)
}