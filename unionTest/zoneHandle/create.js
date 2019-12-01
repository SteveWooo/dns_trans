const fs = require('fs');

async function createConfigDomain(options) {
    var configFile = require(`${__dirname}/../../conf/config.json`);
    for(var i=0;i<options.domainList.localroot.length;i++){
        configFile.client.domainList[options.domainList.localroot[i]] = {
            inLocalRoot : 1
        }
    }
    for (var i = 0; i < options.domainList.recursive.length; i++) {
        configFile.client.domainList[options.domainList.recursive[i]] = {
            inLocalRoot: 0
        }
    }

    fs.writeFileSync(`${__dirname}/../../conf/config.json`, JSON.stringify(configFile));
}

async function createLocalZone(options) {
    var file = `cn. 86400 IN SOA ns.cn. mail 2019061702 1800 900 604800 86400
cn. 86400 IN NS ns.cn.
ns.cn. 172800 IN A 1.1.0.22

`;
    var subDomain = [];
    for (var i = 0; i < options.domainList.localroot.length; i++) {
        subDomain.push(`${options.domainList.localroot[i]}  300 IN  A   1.1.0.100`);
    }
    file += subDomain.join('\n');
    file += '\n';
    return file;
}

async function createNormalZone(options) {
    var file = `a.cn. 86400 IN SOA ns.a.cn. mail 2019061702 1800 900 604800 86400
a.cn. 86400 IN NS ns.a.cn.
ns.a.cn. 172800 IN A 1.1.0.12

`;
    var subDomain = [];
    for(var i=0;i<options.domainList.recursive.length;i++) {
        subDomain.push(`${options.domainList.recursive[i]}  300 IN  A   1.1.0.100`);
    }
    file += subDomain.join('\n')
    file += '\n';
    return file;
}

/**
 * 入口 这里创建统一配置项 然后基于这个配置给上面玩去
 * 就搞一堆 *.a.cn吧
 */
async function createDomain() {
    var domainList = {
        localroot : [],
        recursive : []
    };
    for(var i=0;i<50;i++) {
        domainList.localroot.push(`${i}.a.cn`);
    }
    for(var i=50;i<100;i++) {
        domainList.recursive.push(`${i}.a.cn`);
    }

    return domainList;
}

async function main(){
    var domainList = await createDomain();
    var zoneFiles = {};
    zoneFiles.localroot = await createLocalZone({
        domainList: domainList
    })
    zoneFiles.recursive = await createNormalZone({
        domainList: domainList
    })
    // await createConfigDomain({
    //     domainList: domainList,
    //     zoneFiles : zoneFiles
    // })

    // localroot
    fs.writeFileSync(`${__dirname}/localrootZone/cn.zone`, zoneFiles.localroot);
    
    // recursive
    fs.writeFileSync(`${__dirname}/normalZone/a.cn.zone`, zoneFiles.recursive);

}
main();
