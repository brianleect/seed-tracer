const http = require('http');
const url = require('url');
const { PORT_NUMBER } = require('./config');
const { isAddressInit, fullAddressAnalyze } = require('./utils/web3_utils');

// Function to set CORS headers
const setCORSHeaders = (response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
};

http.createServer(async (request, response) => {
    // Set CORS headers for all responses
    setCORSHeaders(response);

    var startTime = process.hrtime()
    if (request.method === 'GET' && request.url.startsWith('/footprint')) {
        // Retrieve address and check if valid
        const queryObject = url.parse(request.url, true).query;
        console.log(queryObject)
        // Return error if address is not found
        if (!queryObject['address']) { response.statusCode = 404; response.end('Missing address parameter'); return; }
        const addr = queryObject.address.toLowerCase();
        var searchTillRoot = queryObject['searchTillRoot'] === 'true';

        // Check if address length is valid
        if (addr.length != 42) { response.statusCode = 404; response.end('Invalid address length. Expected 42.'); return; }

        // Check if address is even initialized by checking if bal>=0 || nonce>=0
        if (!(await isAddressInit(addr))) { response.statusCode = 404; response.end('Address has not been initialized'); return; }

        // Finally if all checks clear we proceed to get address stats and return
        response.statusCode = 200;
        var fullAddressInfo = await fullAddressAnalyze(addr, searchTillRoot)
        var endTime = process.hrtime(startTime)
        fullAddressInfo.time = `${parseFloat(endTime[0] + endTime[1] / 10 ** 9).toFixed(2)}s`
        response.end(JSON.stringify(fullAddressInfo))

    } else {
        response.statusCode = 404;
        response.end('Invalid endpoint');
    }
}).listen(PORT_NUMBER);
