const { fullAddressAnalyze } = require("../utils/web3_utils");

if (process.argv.length == 3)
    fullAddressAnalyze(process.argv[2]).then(res => console.log(res))
else {
    (async () => {
        console.log('\nNormal funding direct tx, Exchange funded')
        await fullAddressAnalyze('0x11c330099f50faf4bd9d31b92d236ba755288d77').then(res => console.log(res))

        console.log('\nUncle/Mining rewards')
        await fullAddressAnalyze('0xfa927f196a46067ca3aee3edcaaabce7ef77bb26').then(res => console.log(res))

        console.log('\nContract w tornado funding') // Expect to get deployer in this case
        await fullAddressAnalyze('0x68dd0dc53e391348ff0f31c4a621f7301fdbb1a2').then(res => console.log(res))

        console.log('\nContract w tornado funding w searchTillRoot disabled') // Expect to get deployer in this case
        await fullAddressAnalyze('0x68dd0dc53e391348ff0f31c4a621f7301fdbb1a2', false).then(res => console.log(res))

        console.log('\nVery deep search -> 197 hops funding') // Expect to get deployer in this case
        await fullAddressAnalyze('0x86ddca39f3483be35f2a0821feb0020663e3bb83').then(res => console.log(res))

    })();
}