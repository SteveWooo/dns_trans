module.exports = {
    startup : require(`${__dirname}/startup`),
    udpServer : undefined,

    entry : require(`${__dirname}/entry`),

    utils : {
        dnsParser : require(`${__dirname}/utils/dnsParser`)
    }
}