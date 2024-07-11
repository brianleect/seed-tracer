const { getFundingSource } = require("../utils/web3_utils");

if (process.argv.length == 3)
    getFundingSource(process.argv[2]).then(res => console.log(res))
else {
    (async () => {
        console.log('\nNormal funding direct tx')
        await getFundingSource('0xd8da6bf26964af9d7eed9e03e53415d37aa96045').then(res => console.log(res))

        console.log('\nNormal funding internal tx')
        await getFundingSource('0xd8da6bf26964af9d7eed9e03e53415d37aa96045').then(res => console.log(res))

        console.log('\nGenesis block funding')
        await getFundingSource('0x756f45e3fa69347a9a973a725e3c98bc4db0b5a0').then(res => console.log(res))

        console.log('\nUncle/Mining Rewards Funding')
        await getFundingSource('0xfa927f196a46067ca3aee3edcaaabce7ef77bb26').then(res => console.log(res))

        console.log('\nContract') // Expect to get deployer in this case
        await getFundingSource('0x463a5a627137eA7De2930F3d88706347B5Ae7cD5').then(res => console.log(res))
    })();
}