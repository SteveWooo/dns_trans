const dns = require('dns');
const fs = require('fs');

function dnsReq(swc, options) {
    return new Promise(resolve=>{
        var result = dns.resolve(options.domain, function(err, res){
            resolve(res);
        });
    })
}

async function startJob(swc, options) {
    var domainList = swc.config.client.domainList;
    var domainCount = swc.config.client.domainCount;
    var logFileName = `${swc.argv.s}-${+new Date()}.log`;

    if(swc.argv['logdir'] != undefined) {
        fs.mkdirSync(`${__dirname}/../../logs/${swc.argv['logdir']}`);
        logFileName = swc.argv['logdir'] + '/' + logFileName;
    }

    if (swc.argv['log'] == 1) {
        fs.writeFileSync(`${__dirname}/../../logs/${logFileName}`, '');
    }

    for(var i=0;i<domainCount;i++) {
        var domain = `${i}.a.cn`;
        var begin = +new Date();
        var result = await dnsReq(swc, {
            domain: domain
        })
        var end = +new Date();
        var log = `delay=${end - begin}\`domain=${domain}\``;

        if (swc.argv['debug'] == 1) {
            console.log(log);
        }
        if (swc.argv['log'] == 1) {
            fs.appendFileSync(`${__dirname}/../../logs/${logFileName}`, log + '\n');
        }
    }

}

module.exports = async function(swc, options) {
    if(swc.argv.s == 'localroot') {
        dns.setServers([swc.config.server.localRootEntryPoint]);
    } 
    else if (swc.argv.s == 'recursive') {
        dns.setServers([swc.config.server.recursiveServer]);
    } else {
        console.log('错误：未指定dns服务器');
        return ;
    }
    
    await startJob(swc, options);
}