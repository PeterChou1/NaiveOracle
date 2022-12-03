// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IRequestInterface {

    function oracleRequest(
        address sender, 
        uint256 payment, 
        bytes32 requestId,
        address callbackAddress,
        bytes4 callbackFunctionId
    ) external;

    function oracleReveal(
        address _sender, 
        uint256 _payment, 
        bytes32 _requestId,
        address _callbackAddress,
        bytes4 _callbackFunctionId
    ) external;

    
}