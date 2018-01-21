const lib = require('lib')({token: ""});
const GeoHash = require('geohasher');
/**
*@param {string} task
*@param {string} id
*@returns {string}
**/
module.exports = (task,id, context, callback) => {
	main(task,id ,context, callback)
};

async function main(task,id , context,callback){
	var msg = JSON.parse(await lib.utils.storage.get('user'));
    var user = msg[id]
    var msg = JSON.parse(await lib.utils.storage.get('list'));
    var obj = {
        'hash': user.location,
        user: id,
        message: task,
        unread: {},
        id: msg.length
    }
    //obj.unread[app.getUser().userId] = true;
    msg.push(obj);
    await lib.utils.storage.set('list', JSON.stringify(msg));
	callback(null,`Added message ${task}`)
}