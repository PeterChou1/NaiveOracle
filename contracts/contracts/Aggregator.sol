// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IAggregator.sol";
import "./interfaces/INaiveToken.sol";
import "./interfaces/IRequestInterface.sol";

/**
 * @title A naive chain aggregator
 */ 
contract Aggregator is IAggregator {

    struct Answer {
      uint256 responseAmt;
      int256[] responses;
      address callbackAddress;
      bytes4 callbackFunctionId;
      bytes32 requestId;
    }

    INaiveToken private token;
    
    mapping(bytes32 => Answer) private answers;

    event ResponseReceived(bytes32 requestId, int256 response);

    address[] private oracles;
  
    constructor(address[] memory _oracles, address _NaiveChainToken) {
        oracles = _oracles;
        token = INaiveToken(_NaiveChainToken);
    }
    
    /**
    * @dev get the generic API response from oracle 
    */
    function getAnswer(uint256 _responseAmt, uint256 _paymentAmt, address _callbackAddress, bytes4 _callbackFunctionSignature) external returns (bytes32 requestId) {
        require(_responseAmt <= oracles.length, "cannot request for more oracle than held by the contract");
        requestId = keccak256(abi.encodePacked(_responseAmt, _paymentAmt, _callbackAddress, _callbackFunctionSignature));
        Answer memory ans;
        ans.responseAmt = _responseAmt;
        ans.requestId = requestId;
        ans.callbackFunctionId = _callbackFunctionSignature;
        ans.callbackAddress = _callbackAddress;
        answers[requestId] = ans;

        // call responseAmt amount of the oracles to find the answers
        for (uint i=0; i < _responseAmt; i++) {
            IRequestInterface oracle = IRequestInterface(oracles[i]);
            require(
                token.transferAndCall(
                    oracles[i], 
                    _paymentAmt / _responseAmt, 
                    abi.encodeWithSelector(
                        oracle.oracleRequest.selector,
                        msg.sender,
                        _paymentAmt / _responseAmt,
                        requestId,
                        address(this),
                        this.requestCallback.selector
                    )
                ), "unable to transferAndCall to oracle"
            );
        }
    }

    /**
    * @dev the oracle contract will use submit the respxonse through this request callback
    */
    function requestCallback(bytes32 _requestId, int256 _response) external 
    {
        Answer storage currentAns = answers[_requestId];
        require(currentAns.responses.length <= currentAns.responseAmt, "response has concluded");
        currentAns.responses.push(_response);
        
        emit ResponseReceived(_requestId, _response);

        if (currentAns.responses.length == currentAns.responseAmt) {
            //TODO: aggregate the response currently we just return the latest answer
            (bool success,) = currentAns.callbackAddress.call(
                abi.encodeWithSelector(
                    currentAns.callbackFunctionId, 
                    _requestId,
                    _response
                )
            );
            require(success, "request callback failed");
            emit Answered(_response);
        }
    }
}