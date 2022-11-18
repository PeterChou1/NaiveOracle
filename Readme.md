# Naive Oracle

Naive oracle is a student project which seeks to understand how oracles work. It does so by reimplementing the chainlink oracle v1 following the methodology of the orginal white paper

# Architecture

## On-chain Contracts

Currently the architecture is an extremely simplified version of chainlink. The client contract
hooks into the Oracle Network by using the IAggregator interface which contains the getAnswer method which
calls each of its oracle contract to aggregate the results


## Frontend

to be implemented

## Oracle-Client

to be implemented


## Next Steps

- commit/reveal scheme
- real aggregations
- basic offchain client
- front end
- reputation contracts
- validation contracts

## Possible Topics to Explore (if we have infinite time)
- verifiable random number
- chainlnk v2?