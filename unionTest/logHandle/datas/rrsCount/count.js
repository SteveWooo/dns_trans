const readline = require('readline');
const fs = require('fs');

function handleFile(options) {
    return new Promise(resolve=>{
        var rl = readline.createInterface({
            input : fs.createReadStream(options.filepath)
        })
        var result = {
            count : 0,
            allDelay : 0,
            avgDelay : 0,
        };
        rl.on('close', function(){
            // console.log(`finished ${options.dir} ${options.filename}`);
            result.avgDelay = result.allDelay / result.count;
            // console.log(result);
            resolve(result);
        })

        rl.on('line', function(data){
            result.count ++;
            data = data.split('\`');
            var delay = parseInt(data[0].split('=')[1]);
            // if(delay > 40) {
            //     return ;
            // }
            result.allDelay += delay;
        })
    })
}

async function main(options){
    var result = {};
    var dirs = fs.readdirSync(`${__dirname}/${options.type}Source`);
    for(var i=0;i<dirs.length;i++){
        var dirname = dirs[i];
        result[dirname] = {
            delays : [],
            avgDelay : 0,
        };
        var subDir = fs.readdirSync(`${__dirname}/${options.type}Source/${dirname}`);
        for(var k=0;k<subDir.length;k++){
            var filename = subDir[k];
            var temp = await handleFile({
                filepath : `${__dirname}/${options.type}Source/${dirname}/${filename}`,
                filename : filename,
                dir : dirname
            })
            result[dirname].delays.push(temp.avgDelay);
        }

        var tempAllDelay = 0;
        for(var d=0;d<result[dirname].delays.length;d++){
            tempAllDelay += result[dirname].delays[d];
        }
        result[dirname].avgDelay = tempAllDelay / result[dirname].delays.length;

    }

    var file = [];
    var fileObjects = [];
    for(var i in result) {
        var x = parseInt(i.replace('k', ''));
        fileObjects.push({
            x : x,
            avgDelay: result[i].avgDelay
        })
    }
    fileObjects = fileObjects.sort(function(a, b){
        return a.x > b.x
    })
    for(var i=0;i<fileObjects.length;i++){
        file.push(`${fileObjects[i].x} ${fileObjects[i].avgDelay}`);
    }

    fs.writeFileSync(`${__dirname}/resultForGlunt/${options.type}`, file.join('\n'));
}
main({
    type : 'recursive'
});