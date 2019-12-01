
async function main() {
    var swc;
    try {
        swc = await require("./keke_stage/server/models/swc/init")();
        swc = await require('./controllers/accessClient')(swc, {});
        //swc.startup(swc);
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

main();
