// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IAggregator.sol";

contract TestContract {

    IAggregator agg;

    int256 public response;

    constructor(address aggregatorContract) {
        agg = IAggregator(aggregatorContract);
        response = 0;
    }


    function callOracle() external {
        agg.getAnswer(2, 0, address(this), this.oracleCallback.selector);
    }


    function oracleCallback(bytes32 _requestId, int256 _response) public {
        response = _response;
    }

    function getResponse() external view returns(int256) {
        return response;
    }

}