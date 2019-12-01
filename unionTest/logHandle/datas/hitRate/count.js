const fs = require('fs');

async function countAvg(options) {
    var originLogs = options.originLogs;
    for (var type in originLogs) {
        for (var domain in originLogs[type]) {
            var allDelay = 0;
            for (var i = 0; i < originLogs[type][domain].delays.length; i++) {
                allDelay += parseInt(originLogs[type][domain].delays[i]);
            }
            originLogs[type][domain].avgDelay = allDelay / originLogs[type][domain].delays.length;
        }
    }

    return originLogs;
}

async function getOriginData(options) {
    var originLogs = {
        localroot: {}, // 域名作为key的hashmap 
        recursive: {}
    }

    var dirs = fs.readdirSync(options.dirname);
    for (var i = 0; i < dirs.length; i++) {
        var type = dirs[i].substring(0, dirs[i].indexOf('-'));
        var file = fs.readFileSync(`${options.dirname}/${dirs[i]}`).toString().split('\n');
        for (var k = 0; k < file.length; k++) {
            file[k] = file[k].split('`');
            var domain = file[k][1].split('=')[1];
            var delay = file[k][0].split('=')[1];

            if (originLogs[type][domain] == undefined) {
                originLogs[type][domain] = {
                    delays: []
                }
            }

            // 太大的排除
            // if (delay > 20) {
            //     continue;
            // }

            originLogs[type][domain].delays.push(delay);
        }
    }

    return originLogs;
}

async function countResultAvg(options) {
    for (var type in options.originLogs) {
        var allDelay = 0;
        var domainCount = 0;
        for (var domain in options.originLogs[type]) {
            domainCount++;
            allDelay += options.originLogs[type][domain].avgDelay;
        }
        options.originLogs[type].avgDelay = allDelay / domainCount;
    }
    return options.originLogs;
}

async function main() {
    var originLogs = await getOriginData({
        dirname : `${__dirname}/sourceLogs/0`
    });
    originLogs = await countAvg({
        originLogs: originLogs
    })
    // console.log(originLogs)
    originLogs = await countResultAvg({
        originLogs: originLogs
    })
    console.log(originLogs);
}
main();
