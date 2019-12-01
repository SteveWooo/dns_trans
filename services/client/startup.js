const dns = require('dns').promises;
const domainList = {
    'www.a.cn' : {},
    'blog.a.cn' : {}
}

async function dnsReq(swc, options) {
    var result = await dns.resolve4(options.domain, 'A');
    console.log(result);
}

async function startJob(swc, options) {
    for(var domain in domainList) {
        var result = await dnsReq(swc, {
            domain : domain,
            config : domainList[domain]
        })
    }
}

module.exports = async function(swc, options) {
    dns.setServers([swc.config.server.localRootEntryPoint]);
    await startJob(swc, options);
}