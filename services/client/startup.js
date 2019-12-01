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
    var logFileName = `${swc.argv.s}-${+new Date()}.log`;
    var logs = [];
    for(var domain in domainList) {
        var begin = +new Date();
        var result = await dnsReq(swc, {
            domain : domain,
            config : domainList[domain]
        })
        var end = +new Date();
        // console.log(`${swc.argv.s} done : ${domain} by : ${end - begin}ms`);
        var log = `delay=${end - begin}\`domain=${domain}\``;
        logs.push(log);
    }

    if(swc.argv['log'] == 1) {
        fs.writeFileSync(`${__dirname}/../../logs/${logFileName}`, logs.join('\n'));
        return ;
    }

    if(swc.argv['debug'] == 1) {
        console.log(logs.join('\n'));
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