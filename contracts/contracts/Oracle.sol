// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IERC677Receiver.sol";
import "./interfaces/INaiveToken.sol";
import "./interfaces/IRequestInterface.sol";

contract Oracle is IERC677Receiver, IRequestInterface {


    event RequestRecieved(
        address indexed requester, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    );

    event RequestReveal(
        address indexed requester, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    );
    
    INaiveToken private token;
    address public owner;
    mapping(bytes32 => address) oracleRequestTracker;

    constructor(address _NaiveToken) {
        token = INaiveToken(_NaiveToken);
        owner = msg.sender;
    }

    function onTokenTransfer(
        address _sender,
        uint256 _amount,
        bytes calldata _data
    )
    public onlyUseToken() {
        (bool success, ) = address(this).delegatecall(_data);
        require(success, "failed to oracle execute request");
    }

    // order-matching
    function acceptOrder(
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId // calling SLA.matchCallback
    )  external returns (bool) {
        (bool success, ) = _callbackAddress.call(abi.encodeWithSelector(_callbackFunctionId, _requestId));
        require(success, "failed to executed provided match callback function");
    }

    // aggregator
    function oracleRequest(
        address _sender, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    ) external {
        require(oracleRequestTracker[_requestId] == address(0), "request already assigned to an sender");
        emit RequestRecieved(_sender, _payment, _requestId, _callbackAddress, _callbackFunctionId);
        oracleRequestTracker[_requestId] = _sender;
    }

    function oracleReveal(
        address _sender, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    ) external {
        //TODO: this is somehow bugged
        //require(oracleRequestTracker[_requestId] == msg.sender, "request cannot be reveal to a non sender");
        emit RequestReveal(_sender, _payment, _requestId, _callbackAddress, _callbackFunctionId);
    }

    function commitOracleRequest( //fulfillOracleRequest
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId,
        bytes32 _data
    )  external returns (bool) {
        //TODO: make it only the oracle owner can commit orcale request
        //TODO: you can call this multiple times make it so that you can only fulfill a request once per ID?
        (bool success, ) = _callbackAddress.call(abi.encodeWithSelector(_callbackFunctionId, _requestId, _data));
        require(success, "failed to executed provided commit callback function");
        return success;
    }

    function revealOracleRequest( //fulfillOracleRequest
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId,
        int256 _data,
        bytes32 _salt
    )  external returns (bool) {
        //TODO: you can call this multiple times make it so that you can only fulfill a request once per ID?
        (bool success, bytes memory returnData) = _callbackAddress.call(abi.encodeWithSelector(_callbackFunctionId, _requestId, _data, _salt));
        require(success, "failed to executed provided reveal callback function");
        // console.log(returnData);
        // require(success, string(returnData));
        // if (returnData.length > 0) {
        //     require(abi.decode(returnData, (bool)), "BRUH");
        // }
        return success;
    }


    /**
    * @dev Reverts if not using Naive Token
    */
    modifier onlyUseToken() {
        require(msg.sender == address(token), "Must use Naive token");
        _;
    }
}