# Seed-Tracer: Fund Tracing Tool

## Project Overview

Seed Tracer is an open-source project that aims to make fund tracing accessible on EVM (Ethereum Virtual Machine) chains. The tool leverages archive nodes their available RPC endpoints to determine the funding source of addresses efficiently. The project is currently deployed and accessible at https://seed-tracer.vercel.app/ with support for Ethereum only currently.

## Key Features

1. **Fund Tracing**: Utilizes archive nodes and RPC endpoints to trace funds back to the genesis block.
2. **Rapid Processing**: Employs binary search algorithm for quick fund tracing without need for extensive database storage.
3. **Real-time Analysis**: Provides fast, on-demand fund tracing of addresses.
4. **Label Integration**: Incorporates scraped labels from Etherscan to identify key entities such as mixers (tornado), bridges or centralized exchanges (CEX).

## Technical Approach

### Traditional Methods vs. Seed Tracer Approach

Traditional fund tracing methods often involve:
- Ingestion of data from the genesis block (block 0)
- Searching for initialization of addresses across the entire blockchain history
- Significant database space requirements for storing processed data
- Considerable time for data retrieval and processing
- Challenges in scaling for chains that are significantly larger in size. 

These methods can be very costly in terms of both processing power and data storage requirements, especially for high-activity blockchains.

Seed Tracer's solution:
- Uses only RPC endpoints available on archive nodes
- Implements binary search algorithms to efficiently locate funding blocks
- Eliminates the need for additional database storage beyond the archive node
- Enables fast, on-demand fund tracing
- Calculates tracing information on-the-go using existing archive node infrastructure
- Scales more easily to chains with high activity and short block times often significantly larger in size. (BSC archive nodes are 3x the size of ETH)

Trade-offs of the Seed Tracer approach:
- Relies on the availability and reliability of archive nodes
- May have slightly longer response times compared to pre-processed data, but offers more up-to-date information

## Use Cases

1. **Avoiding Scam Projects for Traders and Investors**:
   - Assess the risk of new projects by tracing the funding sources of contract deployers
   - Identify potentially malicious actors behind new token launches or NFT projects
   - Provide an additional layer of due diligence for traders speculating on newly launched crypto assets reducing the risk of falling victim to rug pulls or other scams

2. **Early Warning and Detection System**:
   - Flag potential attacks by identifying new addresses funded by known suspicious sources
   - Trace funds originating from high-risk sources like mixing services (e.g., Tornado Cash) or vulnerable bridges
   - Support ongoing monitoring of high-risk addresses to detect potential threats before they materialize

## Core Components

### Frontend (React)

The frontend is built using React and Next.js, providing a user-friendly interface for interacting with the Seed Tracer tool. Key features include:

- Address input for tracing
- Chain selection (currently supporting Ethereum)
- Display of tracing results, including:
  - Address age
  - Transaction count (nonce)
  - Number of funding hops
  - Identified funding source (if available)
- Detailed breakdown of the funding path

### Backend (Node.js)

The backend server, built with Node.js, handles the core functionality of the tool:

- Processes requests for address tracing
- Interacts with the Ethereum network using ethers.js
- Implements the binary search algorithm for efficient fund tracing
- Integrates with a database of labels for identifying key entities
- Returns comprehensive tracing results to the frontend

#### Configuration and Deployment

#### Backend

The backend uses a configuration file to set up key parameters:

```javascript
module.exports = {
    HTTP_PROVIDER: 'REPLACE_WITH_ARCHIVE_NODE_OR_ALCHEMY_RPC',
    PORT_NUMBER: 8080, // Port used for server
    DEBUG_ENABLED: true,
}
```

Key configuration options:

1. `HTTP_PROVIDER`: Specifies the URL of the Ethereum node to connect to. This can be:
   - A local Erigon archive node (as in the example)
   - A remote node provider service like Alchemy

2. `PORT_NUMBER`: Defines the port on which the server will run.

3. `DEBUG_ENABLED`: Toggles additional logging for debugging purposes.

Deployment Options:

1. Local Erigon Node: 
   - Ideal for maximum performance and control
   - Requires significant storage and computational resources
   - Typically run on the same server as Seed Tracer for optimal speed

2. Remote Node Provider (e.g., Alchemy):
   - Easier to set up and maintain
   - Requires less local resources
   - May have slower response times compared to a local node
   - Still achieves the same results, albeit potentially with higher latency

Users can choose the deployment option that best fits their resources and performance requirements. While a local Erigon archive node provides the fastest performance, using a remote node provider like Alchemy offers a more accessible alternative for users who cannot maintain their own archive node.

#### Frontend

Reference .env.example, set a .env.local and set `NEXT_PUBLIC_SERVER_URL=http://your-server-address:port`

## Technical Deep Dive

### Binary Search Implementation

The tool employs a binary search algorithm to efficiently locate the block where an address was first funded. This approach significantly reduces the time and resources required compared to linear searching methods, while still tracing all the way back to the genesis block.

The binary search process works as follows:

1. Initialize the search range from block 0 to the latest block.
2. For each iteration:
   a. Check the middle block (mid) of the current range.
   b. Examine the state of the address at block mid-1 and mid.
   c. If at block mid-1 the balance is 0 and nonce is 0, but at block mid either balance > 0 or nonce > 0, we've found the initialization block.
   d. If the address is not yet initialized at block mid, search the upper half of the range.
   e. Otherwise, search the lower half of the range.
3. Repeat until the initialization block is found where we then identify the funding transaction info.

This method allows us to efficiently pinpoint the exact block where an address transitions from uninitialized (balance = 0, nonce = 0) to initialized (balance > 0 or nonce > 0).

### RPC Endpoint Utilization

Seed Tracer leverages specific RPC endpoints available on archive nodes. Each endpoint serves a crucial purpose in the tracing process:

1. `getTransactionCount`: 
   - Purpose: To check the nonce of an address at a specific block.
   - Usage: Verifies if the address has been initialized. A nonce of 0 at block n-1 and > 0 at block n indicates the address was first used at block n.

2. `getBalance`: 
   - Purpose: To check the balance of an address at a specific block.
   - Usage: Confirms if the address has received funds. A balance of 0 at block n-1 and > 0 at block n (with nonce still 0) indicates the address received its first funds at block n without initiating a transaction.

3. `trace_replayBlockTransactions`: 
   - Purpose: To retrieve detailed state changes for all transactions in a block.
   - Usage: Once the initialization block is found, this call provides comprehensive data about the transactions in that block. It allows us to identify the specific transaction that funded or initialized the address, including details such as the sender, the amount transferred, and any contract interactions.

By combining these RPC calls within our binary search algorithm, Seed Tracer can efficiently trace the funding source of any address back to its origin, providing valuable insights into the flow of funds on the blockchain.

### Label Integration

The tool incorporates a [database of labels scraped from Etherscan](https://github.com/brianleect/etherscan-labels), allowing it to identify and highlight key entities involved in the fund trail, such as:

- Centralized exchanges (e.g., Binance, OKX)
- Decentralized exchanges
- Bridge services
- Mixing services (e.g., Tornado Cash)

## Conclusion

Seed Tracer offers an efficient approach to blockchain fund tracing by leveraging existing archive node infrastructure and smart search algorithms. It provides a balance between processing speed and comprehensive analysis, tracing funds all the way back to the genesis block without the need for extensive pre-processing or storage. While it comes with its own set of trade-offs, the tool offers valuable capabilities for various use cases in the blockchain ecosystem, from risk assessment in NFT trading to early detection of potential security threats.