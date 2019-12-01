module.exports = async (swc, options)=>{
	global.swc = {};
	swc = await swc.registerService(swc, {
		serviceName : 'trans',
		path : `${__dirname}/../services/trans/service`
	})

	await swc.services.trans.startup(swc, {});

	return swc;
}
	