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

## Server Level Agreement (SLA)

When UserContract sends a request to SLA

- That means the user agrees to the rules we set up in our SLA**.**
- The SLA is designed as a TOOL that accepts customized requests.
- So SLA has minimum subjective operations, which means:
  - To maintain the scope of using this tool, the tool never blocks an oracle.

- i.e., for any oracle no meter hows their history (performance/reputation), there exist some customized requests allow this oracle to generate the answer for any user wants it to happen.
- Customization allows the user has complete control of defining the "accuracy" and balancing between accuracy and cost to meet their specific requirement.

When SLA communicates with an Oracle

- we are not limiting the on-chain part of the oracle (contract)
- we are not limiting the off-chain part of the oracle (node)
- therefore the oracle(on/off-chain) is allowed to be fully customizable
- as long as they compatible with our SLAgreement 

> Note: this possibly makes the difference from Chainlink


## Next Steps

- basic offchain client
- data signing (optional)
- Service level agreements
  - oracle bidding -> order matching
  - real aggregations
    - performace -> Slashing Naive coins for bad behaviour
    - aggergation (mode)

- Frontend
- Video

## Possible Topics to Explore (if we have infinite time)

- verifiable random number
- chainlnk v2?