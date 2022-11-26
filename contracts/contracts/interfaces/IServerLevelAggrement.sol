// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IServerLevelAggrement {

  // order-matching
  function broadcastOrder(
    uint256 _responseAmt, 
    uint256 _paymentAmt, 
    address _callbackAddress, 
    bytes4 _callbackFunctionSignature
  ) external returns (bytes32 requestId);
  
  function matchCallback(bytes32 _requestId) external;

  event OrderBroadcasted(
        bytes32 requestId,
        address indexed requester,
        uint256 payment, 
        uint256 responseAmt,
        address callbackAddress,
        bytes4 callbackFunctionId
  );
  event OrderMatched(bytes32 requestId, address[] oracles);


  // aggregator
  event CommitReceived(bytes32 requestId, bytes32 response);
  event ResponseReceived(bytes32 requestId, int256 response);
  event Answered(int256 Answer);
}