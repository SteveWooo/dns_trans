const dns = require('dns');
const domainList = {
    'www.a.cn' : {},
    'blog.a.cn' : {}
}

function dnsReq(swc, options) {
    return new Promise(resolve=>{
        var result = dns.resolve(options.domain, function(err, res){
            resolve(res);
        });
    })
    
}

async function startJob(swc, options) {
    for(var domain in domainList) {
        var begin = +new Date();
        var result = await dnsReq(swc, {
            domain : domain,
            config : domainList[domain]
        })
        var end = +new Date();
        console.log(`done : ${domain} by : ${end - begin}ms`);
    }
}

module.exports = async function(swc, options) {
    dns.setServers([swc.config.server.localRootEntryPoint]);
    await startJob(swc, options);
}