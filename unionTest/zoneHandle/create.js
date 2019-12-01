const fs = require('fs');

async function createConfigDomain(options) {
    var configFile = require(`${__dirname}/../../conf/config.json`);
    // 清空
    configFile.client.domainList = {};

    // 先把不命中的都设置下去
    for (var i = 0; i < options.domainList.recursive.length; i++) {
        configFile.client.domainList[options.domainList.recursive[i]] = {
            inLocalRoot: 0
        }
    }
    
    // 再把命中的也设置下去
    for(var i=0;i<options.domainList.localroot.length;i++){
        configFile.client.domainList[options.domainList.localroot[i]] = {
            inLocalRoot : 1
        }
    }

    return configFile;
}

async function createLocalZone(options) {
    var file = `cn. 86400 IN SOA ns.cn. mail 2019061702 1800 900 604800 86400
cn. 86400 IN NS ns.cn.
ns.cn. 172800 IN A 1.1.0.22

`;
    var subDomain = [];
    for (var i = 0; i < options.domainList.localroot.length; i++) {
        subDomain.push(`${options.domainList.localroot[i]}.  300 IN  A   1.1.0.100`);
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
        subDomain.push(`${options.domainList.recursive[i]}.  300 IN  A   1.1.0.100`);
    }
    file += subDomain.join('\n')
    file += '\n';
    return file;
}

/**
 * @param hitCount 代表命中个数是多少。默认给100个域名里面，命中hitCount个。把hitCount配置给localroot里面即可
 */
async function createDomain(options) {
    var domainList = {
        localroot : [],
        recursive : []
    };
    for(var i=0;i<options.hitCount;i++) {
        domainList.localroot.push(`${i}.a.cn`);
    }
    for(var i=0;i<100;i++) {
        domainList.recursive.push(`${i}.a.cn`);
    }

    return domainList;
}

// hitRateZoneFiles
async function buildHitRateFile(){
    var allDomains = {};
    for(var i=0;i<=100;i+=10) {
        allDomains[i] = await createDomain({
            hitCount : i
        })
    }

    for(var i in allDomains) {
        var zoneFiles = {};
        zoneFiles.localroot = await createLocalZone({
            domainList: allDomains[i]
        })
        zoneFiles.recursive = await createNormalZone({
            domainList : allDomains[i]
        })
        fs.writeFileSync(`${__dirname}/hitRate/localroot/cn.${i}.rate.zone`, zoneFiles.localroot);
        fs.writeFileSync(`${__dirname}/hitRate/recursive/a.cn.${i}.rate.zone`, zoneFiles.recursive);
        var configFile = await createConfigDomain({
            domainList: allDomains[i]
        })
        fs.writeFileSync(`${__dirname}/hitRate/config.${i}.rate.json`, JSON.stringify(configFile));
    }
}

// 成吨数据去测试，先build一波recursive的玩玩
async function buildRRSCountFile(options){
    var domainList = {
        recursive : [],
        localroot : [],
    };
    for(var i=0;i<options.count;i++){
        domainList[options.type].push(`${i}.a.cn`);
    }

    var configFile = await createConfigDomain({
        domainList: domainList
    })
    fs.writeFileSync(`${__dirname}/rrsCount/recursive/config.${options.count}.json`, JSON.stringify(configFile));

    var zoneFiles = {};
    if(options.type == 'recursive') {
        zoneFiles.recursive = await createNormalZone({
            domainList: domainList
        })
        fs.writeFileSync(`${__dirname}/rrsCount/recursive/a.cn.${options.count}.zone`, zoneFiles.recursive);
    }
    
    if (options.type == 'localroot') {
        zoneFiles.localroot = await createLocalZone({
            domainList: domainList
        })
        fs.writeFileSync(`${__dirname}/rrsCount/localroot/cn.${options.count}.zone`, zoneFiles.localroot);
    }
}

buildRRSCountFile({
    count : 100000,
    type : 'recursive'
});

// async function main(){
//     var domainList = await createDomain();
//     var zoneFiles = {};
//     zoneFiles.localroot = await createLocalZone({
//         domainList: domainList
//     })
//     zoneFiles.recursive = await createNormalZone({
//         domainList: domainList
//     })
//     // await createConfigDomain({
//     //     domainList: domainList,
//     //     zoneFiles : zoneFiles
//     // })

//     // localroot
//     fs.writeFileSync(`${__dirname}/localrootZone/cn.zone`, zoneFiles.localroot);
    
//     // recursive
//     fs.writeFileSync(`${__dirname}/normalZone/a.cn.zone`, zoneFiles.recursive);

// }
