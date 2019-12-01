const dns = require('dns');

async function resolveLocalRoot(swc, options) {
    swc.services.trans.udpServer.send(options.msg, 
        swc.config.server.localRootRecursiveServerPort,
        swc.config.server.localRootRecursiveServer, function(){});
}

async function resolveRecursive(swc, options) {
    swc.services.trans.udpServer.send(options.msg,
        swc.config.server.recursiveServerPort,
        swc.config.server.recursiveServer, function () { });
}

async function sendResultToClient(swc, options) {
    swc.services.trans.udpServer.send(options.msg,
        options.info.port,
        options.info.address, function(){});
}

module.exports = async function(swc, options) {
    var req = await swc.services.trans.utils.dnsParser(swc, {
        msg: options.msg
    })
    /**
     * 如果缓存中没有这个ID，说明需要发动第一次解析
     * info: {address, port}
     */
    if (!(req.header.id in global.swc.trans.requestCache)) {
        global.swc.trans.requestCache[req.header.id] = {
            info : options.info,
            status : 0
        }
        console.log(`to localroot : ${req.question.domain}`);
        var result = await resolveLocalRoot(swc, {
            msg: options.msg
        })
        return ;
    }
    /**
     * 如果缓存中有这个ID，那就说明是第一次解析返回的结果，看看错误码是否nxdomain
     */
    if (req.header.rcode == '0000' && global.swc.trans.requestCache[req.header.id].status == 0) {
        var info = global.swc.trans.requestCache[req.header.id].info;
        await sendResultToClient(swc, {
            info : info,
            msg : options.msg
        })
        delete global.swc.trans.requestCache[req.header.id];
        return;
    }
    if (req.header.rcode == '0011' && global.swc.trans.requestCache[req.header.id].status == 0) { // 代表NXDOMAIN
        global.swc.trans.requestCache[req.header.id].status = 1;
        console.log(`to recursive : ${req.question.domain}`);
        var result = await resolveRecursive(swc, {
            msg: options.msg
        })
        return ;
    }

    if (global.swc.trans.requestCache[req.header.id].status == 1) {
        var info = global.swc.trans.requestCache[req.header.id].info;
        await sendResultToClient(swc, {
            info: info,
            msg: options.msg
        })
        delete global.swc.trans.requestCache[req.header.id];
        return;
    }
    console.log(req);
}