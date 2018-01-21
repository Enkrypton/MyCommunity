const lib = require('lib')({token: ""});
const GeoHash = require('geohasher');
/**
*@param {string} id
*@returns {string}
**/
module.exports = (id,context, callback) => {
	main(id,context, callback)
};

async function main(id, context,callback){
	var users = JSON.parse(await lib.utils.storage.get('user'));
    var user = users[id]
    var msg = JSON.parse(await lib.utils.storage.get('list')).filter(q => (q.hash == user.location)&&(q.unread[id]!=2));
    var allmsg = JSON.parse(await lib.utils.storage.get('list'))
    for(var i =0;i<msg.length;i++){
    allmsg[msg[i].id].unread[id] = true;}
    await lib.utils.storage.set('list', JSON.stringify(allmsg));
	callback(null,msg.map(q=>`${users[q.user].name} announced ${q.message}`).join("="))
}