const dgram = require('dgram');

async function initServer(swc, options) {
    var server = dgram.createSocket('udp4');

    server.on('message', async(msg, info)=>{
        await swc.services.trans.entry(swc, {
            msg : msg,
            info : info
        })
    })

    server.on('listening', async ()=>{
        console.log(`listened at : ${swc.config.server.port}`);
    })
    server.bind(swc.config.server.port);

    swc.services.trans.udpServer = server;
}

async function initGlobalData(swc, options) {
    global.swc.trans = {
        requestCache : {}
    }
}

module.exports = async function(swc, options) {
    await initGlobalData(swc, options);
    await initServer(swc, options);
}