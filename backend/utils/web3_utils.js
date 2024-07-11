const { HTTP_PROVIDER, DEBUG_ENABLED } = require('../config');
const { forHumans } = require('./helper');
const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER)
var labelsDB = require(`${__dirname}/../constants/labels.json`);

// Checks if address has been initialized. Note that contracts will have nonce=1.
async function isAddressInit(address) {
    const [nonce, balance] = await Promise.all([provider.getTransactionCount(address), provider.getBalance(address)]);
    return nonce != 0 || balance != 0
}

async function deepSearch(address, searchTillRoot = true) {
    var rootTypes = ['GENESIS', 'FALSEINIT', 'MINER/UNCLE']
    var searchHistory = []
    var i = 0
    while (true) {
        var fundingInfo = await getFundingSource(address)
        searchHistory.push(fundingInfo)
        console.log(i++, fundingInfo)
        // QOL option to end deep search as long its found
        if (fundingInfo.labelsFound.length > 0 && !searchTillRoot) return searchHistory
        if (rootTypes.includes(fundingInfo['type'])) return searchHistory
        address = fundingInfo['sender'] // Update address to sender
    }
}

async function fullAddressAnalyze(address, searchTillRoot = true) {
    var nonce = await provider.getTransactionCount(address)
    var fundingInfo = await deepSearch(address, searchTillRoot)
    var age = forHumans(((await provider.getBlockNumber()) - fundingInfo[0].block) * 15)
    var fundingHops = fundingInfo.length

    return { age, nonce, fundingHops, fundingInfo }
}

async function getFundingSource(address) {
    var address = address.toLowerCase()
    var { startBlock, amount } = await getFundingBlock(address)
    if (startBlock > 0) var { txHashDict } = await retrieveAllBlockInfo(startBlock)
    else var txHashDict = {} // For genesis block we initiate empty dict

    var fundingInfo = getFundingTx(txHashDict, address)
    fundingInfo.senderNonce = fundingInfo.sender.startsWith('0x') ? await provider.getTransactionCount(fundingInfo.sender) : 'NA' // TODO: Do we want to look at nonce at specific blk
    fundingInfo.block = startBlock
    fundingInfo.receiver = address
    fundingInfo.amount = amount

    return fundingInfo
}

function getFundingTx(blockInfo, target_address) {
    var labelsFound = []
    if (Object.keys(blockInfo).length == 0) return { sender: 'GENESIS', type: 'GENESIS', hash: '???', labelsFound }

    var sender, type;
    for (const [hash, info] of Object.entries(blockInfo)) {
        for (const [address, value] of Object.entries(info.state)) {
            if (target_address == address) {
                sender = info['tx']['from'].toLowerCase()

                if (!info['tx']['to']) type = 'deploy'
                else type = info['tx']['to'].toLowerCase() == address ? 'direct' : 'internal'

                // Add sender label if found
                if (labelsDB[sender]) labelsFound.push(`${labelsDB[sender]['name']} (${labelsDB[sender]['labels'].join()})`)

                if (type == 'internal')
                    // Check for contract code changes and add label if found for that contract address
                    for (const [address, value] of Object.entries(info.state)) {
                        if (Object.keys(value['storage']).length != 0) {
                            // Add relevant labels if found
                            if (labelsDB[address]) labelsFound.push(`${labelsDB[address]['name']} (${labelsDB[address]['labels'].join()})`)
                        }
                    }

                if (value['nonce']['+']) return { type, sender, hash, labelsFound }
                else {
                    console.log(`Unable to find funding tx, ${target_address}`)
                    return { type: 'FALSEINIT', sender, hash, labelsFound }
                }
            }
        }
    }
    console.log("No valid tx w target found, suspected miner/uncle funding")
    return { sender: 'MINER/UNCLE', type: 'MINER/UNCLE', hash: '???', labelsFound }
}


// Attempts to determine block where balance changes from 0 to non-0 while previous block nonce=0
async function getFundingBlock(address) {
    console.time(`(getFundingBlock) ${address}`)
    var l = 0; var r = await provider.getBlockNumber()
    var iterations = 0; var mid = 0
    var type = ''
    //var hasCode = await provider.getCode(address) != '0x'

    while (true) {
        mid = parseInt((l + r) / 2)

        if (mid <= 10) return { 'startBlock': 0, 'amount': balN } // Genesis block funding case

        var [nonce, prevNonce, balN, balPrev] = await Promise.all([
            await provider.getTransactionCount(address, mid),
            await provider.getTransactionCount(address, mid - 1),
            (await provider.getBalance(address, mid)) / 10 ** 18,
            (await provider.getBalance(address, mid - 1)) / 10 ** 18
        ])

        // Exit if block w bal change found, else adjust l,r for binary search accordingly
        if (balPrev == 0 && balN > 0 && prevNonce == 0) { type = 'EOA'; break }
        else if (prevNonce == 0 && nonce > 0 && balPrev == 0) { type = 'Contract'; break }
        else if (balN == 0 && nonce == 0) l = mid + 1
        else r = mid - 1

        iterations++
        if (DEBUG_ENABLED) console.log(`Mid ${mid} / (Nonce: ${prevNonce}->${nonce}) / (Bal:  ${balPrev}->${balN})`)
    }
    console.log(`(${type}) Target: ${mid} / Iterations: ${iterations} / (Nonce: ${prevNonce}->${nonce}) / (Bal:  ${balPrev}->${balN})`)
    console.timeEnd(`(getFundingBlock) ${address}`)
    return { 'startBlock': mid, 'amount': balN }
}

async function retrieveAllBlockInfo(block) {
    var txHashDict = {}
    console.time(`(TIME)(retrieveAllBlock)(${block})`)
    const [blockData, blockState] = await Promise.all([provider.getBlockWithTransactions(block), trace_block(block)])
    if (DEBUG_ENABLED) console.dir(blockState, { 'maxArrayLength': null, 'depth': null })

    for (let i = 0; i < blockData.transactions.length; i++)
        txHashDict[blockData.transactions[i].hash] = { 'state': blockState[i]['stateDiff'], 'tx': blockData.transactions[i] }

    console.timeEnd(`(TIME)(retrieveAllBlock)(${block})`)
    return { txHashDict }
}

async function trace_block(block) {
    return await provider.send("trace_replayBlockTransactions", [
        block,
        ["stateDiff"],
    ]);
}

module.exports = { isAddressInit, fullAddressAnalyze, getFundingBlock, getFundingSource, retrieveAllBlockInfo, deepSearch }
