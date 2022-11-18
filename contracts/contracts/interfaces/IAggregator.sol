// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IAggregator {
  
  function getAnswer(uint256 _responseAmt, uint256 _paymentAmt, address _callbackAddress, bytes4 _callbackFunctionSignature) external returns (bytes32);

  event Answered(int256 Answer);
}
