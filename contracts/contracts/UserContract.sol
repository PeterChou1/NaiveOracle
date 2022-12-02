// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IServerLevelAggrement.sol";
import "./interfaces/INaiveToken.sol";
// import "hardhat/console.sol";

contract UserContract {

    IServerLevelAggrement sla;

    address slaAddress;
    int256 public response;
    bytes32 requestId;

    constructor(address slaContract) {
        sla = IServerLevelAggrement(slaContract);
        slaAddress = slaContract;
        response = 0;
    }

    function callOracle(uint256 _responseAmt, uint256 _paymentAmt) external {
        // transfer toekn to sla
        INaiveToken token = INaiveToken(sla.getTokenAddress());
        // (bool sent,) = slaAddress.call{value: _paymentAmt}("");
        // require(sent, "Failed to send Order");
        // console.log(token.balanceOf(address(this)));
        // console.log(_paymentAmt);
        require(token.balanceOf(address(this)) >= _paymentAmt, "Not enough balance");
        (bool sent) = token.transfer(slaAddress, _paymentAmt);
        // console.log("");
        require(sent, "Failed to send Order");
        requestId = sla.broadcastOrder(_responseAmt, _paymentAmt, address(this), this.oracleCallback.selector);
    }

    function oracleCallback(bytes32 _requestId, int256 _response) public {
        response = _response;
    }

    function getResponse() external view returns(int256) {
        return response;
    }

}