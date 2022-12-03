// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IServerLevelAggrement.sol";

contract UserContract {

    IServerLevelAggrement sla;

    int256 public response;
    bytes32 requestId;

    constructor(address slaContract) {
        sla = IServerLevelAggrement(slaContract);
        response = 0;
    }

    function callOracle(uint256 _responseAmt, uint256 _paymentAmt) external {
        requestId = sla.broadcastOrder(_responseAmt, _paymentAmt, address(this), this.oracleCallback.selector);
    }

    function oracleCallback(bytes32 _requestId, int256 _response) public {
        response = _response;
    }

    function getResponse() external view returns(int256) {
        return response;
    }

}