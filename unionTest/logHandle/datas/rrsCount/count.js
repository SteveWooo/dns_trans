const readline = require('readline');
const fs = require('fs');

function handleFile(options) {
    return new Promise(resolve=>{
        var rl = readline.createInterface({
            input : fs.createReadStream(options.filename)
        })
        var result = {
            count : 0,
            allDelay : 0,
            avgDelay : 0,
        };
        rl.on('close', function(){
            console.log(`finished ${options.filename}`);
            result.avgDelay = result.allDelay / result.count;
            console.log(result);
            resolve(result);
        })

        rl.on('line', function(data){
            result.count ++;
            data = data.split('\`');
            var delay = parseInt(data[0].split('=')[1]);
            result.allDelay += delay;
        })
    })
}

async function main(){
    var dirs = fs.readdirSync(`${__dirname}/sourceLogs`);
    for(var i=0;i<dirs.length;i++){
        var dirname = dirs[i];
        var subDir = fs.readdirSync(`${__dirname}/sourceLogs/${dirname}`);
        for(var k=0;k<subDir.length;k++){
            var filename = subDir[k];
            var result = await handleFile({
                filename : `${__dirname}/sourceLogs/${dirname}/${filename}`
            })
        }
    }
}
main();