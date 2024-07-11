# Backend

Server which responds to requests for address analysis. For fastest analysis having a local archive erigon node setup would be ideal. Else an alternative would be external node providers such as QuikNode/Alchemy.

Currently logic for implementing fraud check will be contained in this repo. However, shifting this to a npm package later on possibly allowing it to function as a cli tool as well would be a nice touch.