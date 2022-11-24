// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IERC677Receiver.sol";
import "./interfaces/INaiveToken.sol";
import "./interfaces/IRequestInterface.sol";
import "hardhat/console.sol";

contract Oracle is IERC677Receiver, IRequestInterface {


    event RequestRecieved(
        address indexed requester, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    );

    INaiveToken private token;

    constructor(address _NaiveToken) {
        token = INaiveToken(_NaiveToken);
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

    function oracleRequest(
        address _sender, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    ) external {
        emit RequestRecieved(_sender, _payment, _requestId, _callbackAddress, _callbackFunctionId);
    }

    function commitOracleRequest( //fulfillOracleRequest
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId,
        bytes32 _data
    )  external returns (bool) {
        //TODO: you can call this multiple times make it so that you can only fulfill a request once per ID?
        (bool success, ) = _callbackAddress.call(abi.encodeWithSelector(_callbackFunctionId, _requestId, _data));
        require(success, "failed to executed provided commit callback function");
    }

    function revealOracleRequest( //fulfillOracleRequest
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId,
        int256 _data,
        bytes32 _salt
    )  external returns (bool) {
        //TODO: you can call this multiple times make it so that you can only fulfill a request once per ID?
        (bool success, ) = _callbackAddress.call(abi.encodeWithSelector(_callbackFunctionId, _requestId, _data, _salt));
        require(success, "failed to executed provided reveal callback function");
    }


    /**
    * @dev Reverts if not using Naive Token
    */
    modifier onlyUseToken() {
        require(msg.sender == address(token), "Must use Naive token");
        _;
    }
}