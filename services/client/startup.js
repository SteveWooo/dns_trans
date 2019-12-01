const dns = require('dns');

function dnsReq(swc, options) {
    return new Promise(resolve=>{
        var result = dns.resolve(options.domain, function(err, res){
            resolve(res);
        });
    })
}

async function startJob(swc, options) {
    var domainList = swc.config.client.domainList;
    for(var domain in domainList) {
        var begin = +new Date();
        var result = await dnsReq(swc, {
            domain : domain,
            config : domainList[domain]
        })
        var end = +new Date();
        console.log(`${swc.argv.s} done : ${domain} by : ${end - begin}ms`);
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