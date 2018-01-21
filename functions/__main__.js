const DialogflowApp = require('actions-on-google').DialogflowApp;
const lib = require('lib')({
    token: ""
});
const GeoHash = require('geohasher');
const actionMap = new Map();

lib.utils.storage.set('list', "[]")
lib.utils.storage.set('user', "{}")
async function getUser(app) {
    var msg = JSON.parse(await lib.utils.storage.get('user'));
    return msg[app.getUser().userId];
}
actionMap.set('todo.add', async function(app) {
    var msg = JSON.parse(await lib.utils.storage.get('user'));
    var user = msg[app.getUser().userId]
    if (!user) {
        app.ask('Please register first')
        return;
    }
    var msg = JSON.parse(await lib.utils.storage.get('list'));
    var obj = {
        'hash': user.location,
        user: app.getUser().userId,
        message: app.getArgument('task'),
        unread: {},
        id: msg.length
    }
    //obj.unread[app.getUser().userId] = true;
    msg.push(obj);
    await lib.utils.storage.set('list', JSON.stringify(msg));
    app.ask(`Added message ${app.getArgument('task')}`);
});
actionMap.set('input.welcome', async function(app) {

    var users = JSON.parse(await lib.utils.storage.get('user'));
    var user = await getUser(app)
    if (!user) {
        app.ask('Welcome to your community! Please register first')
        return;
    }
    var msg = JSON.parse(await lib.utils.storage.get('list')).filter(q => (q.hash == user.location)&&(!q.unread[app.getUser().userId]));
    if(msg.length==0){
		app.ask('Welcome to your community! There are no unread messages')
		return
	}
	if(msg.length==1){
		app.ask(`Welcome to your community! There is one unread message`)
		return
	}
	if(msg.length){
		app.ask(`Welcome to your community! There are ${msg.length} unread messages`)
		return
	}	
 
});
actionMap.set('todo.listAll', async function(app) {

    var users = JSON.parse(await lib.utils.storage.get('user'));
    var user = await getUser(app)
    if (!user) {
        app.ask('Please register first')
        return;
    }
    var msg = JSON.parse(await lib.utils.storage.get('list')).filter(q => (q.hash == user.location)&&(q.unread[app.getUser().userId]!=2));
    if(msg.length==0){
		app.ask('There are no messages')
		return
	}
    app.ask(`Playing all message: \n ${msg.map(q=>`${users[q.user].name} announced ${q.message}`).join(", \n")}`);
    var allmsg = JSON.parse(await lib.utils.storage.get('list'))
    console.log(allmsg)
    var id=app.getUser().userId;
    for(var i =0;i<msg.length;i++){
		console.log(i)
		allmsg[msg[i].id].unread[id] = true;
	}
    console.log('msg',msg)
    console.log('msglen',msg)
    await lib.utils.storage.set('list', JSON.stringify(allmsg));
    console.log(allmsg)
});
actionMap.set('todo.list', async function(app) {
    var users = JSON.parse(await lib.utils.storage.get('user'));
    var user = await getUser(app)
    if (!user) {
        app.ask('Please register first')
        return;
    }
    var id=app.getUser().userId;
    var msg = JSON.parse(await lib.utils.storage.get('list')).filter(q => (q.hash == user.location)&&(!q.unread[id]));    
    if(msg.length==0){
		app.ask('There are no unread messages')
		return
	}
    
    app.ask(`Playing message: \n${msg.map(q=>`${users[q.user].name} announced ${q.message}`).join(", \n")}`);
    var allmsg = JSON.parse(await lib.utils.storage.get('list'))
    console.log('msg',msg)
    for(var i =0;i<msg.length;i++){
    console.log(i)
    console.log( allmsg[msg[i].id])
    allmsg[msg[i].id].unread[id] = true;}
    console.log(allmsg)
    await lib.utils.storage.set('list', JSON.stringify(allmsg));
    console.log(allmsg)
});
actionMap.set('todo.register', async function(app) {
    if (app.isPermissionGranted()) {
        var msg = JSON.parse(await lib.utils.storage.get('user'));
        msg[app.getUser().userId] = {
            'name': app.getUserName().displayName,
            'location': GeoHash.encode(app.getDeviceLocation().coordinates.latitude, app.getDeviceLocation().coordinates.longitude).substring(0, 5)
        }
        await lib.utils.storage.set('user', JSON.stringify(msg));
        app.ask(app.getUserName().displayName + ' has sucessfully registered')
    } else {
        app.askForPermissions('To address you by name and know your location', [app.SupportedPermissions.NAME, app.SupportedPermissions.DEVICE_PRECISE_LOCATION]);
    }
})
actionMap.set('todo.hide', async function(app) {
    var users = JSON.parse(await lib.utils.storage.get('user'));
    var user = await getUser(app)
    if (!user) {
        app.ask('Please register first')
        return;
    }
    var id=app.getUser().userId;
    var msg = JSON.parse(await lib.utils.storage.get('list')).filter(q => (q.hash == user.location)&&(q.unread[id]==1));    
    if(msg.length==0){
		app.ask('There are no read messages to hide')
		return
	}
    app.ask(`Hiding ${msg.length} message`);
    var allmsg = JSON.parse(await lib.utils.storage.get('list'))
    console.log('msg',msg)
    for(var i =0;i<msg.length;i++){
    console.log(i)
    console.log( allmsg[msg[i].id])
    allmsg[msg[i].id].unread[id] = 2;}
    console.log(allmsg)
    await lib.utils.storage.set('list', JSON.stringify(allmsg));
    console.log(allmsg)
});
actionMap.set('todo.export', async function(app) {

    var users = JSON.parse(await lib.utils.storage.get('user'));
    var user = await getUser(app)
    if (!user) {
        app.ask('Please register first')
        return;
    }
    var msg = JSON.parse(await lib.utils.storage.get('list')).filter(q => (q.hash == user.location));
    var id=app.getUser().userId;
    let result = await lib.messagebird.tel.sms({
	  originator: "12048170607",
	  recipient: app.getArgument('num')+"",
	  body: msg.map(q=>`${["Unread","Read","Hidden"][q.unread[id]|0]}: ${users[q.user].name} announced ${q.message}`).join(", \n")
	});
	console.log({
	  originator: "12048170607",
	  recipient: app.getArgument('num')+"",
	  body: msg.map(q=>`${["Unread","Read","Hidden"][q.unread[id]|0]}: ${users[q.user].name} announced ${q.message}`).join(", \n")
	})
    app.ask(`Exporting to ${app.getArgument('num')}`);
});

/**
 * A basic Hello World function
 * @returns {object}
 */
async function main(context, callback) {
    const request = {
        'get': key => context.http.headers[key],
        'body': context.params
    };
    const response = {
        'headers': {},
        'append': function(key, val) {
            this.headers[key] = val
        },
        'status': function(code) {
            return this
        },
        'send': body => callback(null, body, this.headers)
    }
    const app = new DialogflowApp({
        request,
        response
    });
    app.handleRequest(actionMap);
}
module.exports = (context, callback) => {
    main(context, callback)
};