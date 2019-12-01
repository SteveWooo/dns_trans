module.exports = async (swc, options) => {
    global.swc = {};
    swc = await swc.registerService(swc, {
        serviceName: 'client',
        path: `${__dirname}/../services/client/service`
    })

    await swc.services.client.startup(swc, {});

    return swc;
}
