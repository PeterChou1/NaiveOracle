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
      int256[] responses; // reveal
      address callbackAddress;
      bytes4 callbackFunctionId;
      bytes32 requestId;

      uint256 commitAmt;
      uint256 revealAmt;
      mapping(address => bool) commitAddress;
      mapping(address => bool) revealAddress;
      mapping(address => uint) startedAt;
      mapping(address => uint) endedAt;
      // oracle address => CommitReveal
      
    }

    struct Metrics {
        int256 assignedRequest;
        int256 completedRequest;
        int256 acceptedRequest;
        //TODO: investigate time in the blockchain more 
        //      current implementation of avg response time rely on block.timestamp
        //      which only updates every 15 sec? if that's true tracking is metric is useless 
        //      on the block chain
        uint averageResponseTime;
    }

    mapping(address => Metrics) public TrackedMetrics;

    struct CommitReveal{
        bytes32 commit; // could change this to address to reduce gas fees
        int256 reveal;
    }

    INaiveToken private token;
    
    // requestId(answer index) => commit => reveal
    // mapping(bytes32 => mapping(int256 => int256)) private commitReveal; // outside of Answer to pervent nested mapping in memory

    mapping(bytes32 => Answer) private answers;
    mapping(bytes32 => mapping(address => CommitReveal)) commitReveal;

    // uint128 minResponses;

    event CommitReceived(bytes32 requestId, bytes32 response);
    event ResponseReceived(bytes32 requestId, int256 response);

    address[] private oracles;
  
    constructor(address[] memory _oracles, address _NaiveChainToken) {
        oracles = _oracles;
        token = INaiveToken(_NaiveChainToken);
        // minResponses = _minResponses;
    }
    
    /**
    * @dev get the generic API response from oracle 
    */
    function getAnswer(uint256 _responseAmt, uint256 _paymentAmt, address _callbackAddress, bytes4 _callbackFunctionSignature) external returns (bytes32 requestId) {
        require(_responseAmt <= oracles.length, "cannot request for more oracle than held by the contract");
        requestId = keccak256(abi.encodePacked(_responseAmt, _paymentAmt, _callbackAddress, _callbackFunctionSignature));
        Answer storage ans = answers[requestId];
        ans.responseAmt = _responseAmt;
        ans.requestId = requestId;
        ans.callbackFunctionId = _callbackFunctionSignature;
        ans.callbackAddress = _callbackAddress;
        ans.commitAmt = 0;
        ans.revealAmt = 0;

        // call responseAmt amount of the oracles to find the answers
        for (uint i=0; i < _responseAmt; i++) {
            IRequestInterface oracle = IRequestInterface(oracles[i]);
            // updated reputation metrics
            TrackedMetrics[oracles[i]].assignedRequest += 1;
            TrackedMetrics[oracles[i]].acceptedRequest += 1;
            ans.startedAt[oracles[i]] = block.timestamp;
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
                        this.commitCallback.selector
                    )
                ), "unable to transferAndCall to oracle"
            );
        }
    }

    /**
    * @dev the oracle contract will use submit the respxonse through this request callback
    */
    function commitCallback(bytes32 _requestId, bytes32 _commitHash) external ensureOracleSender(msg.sender)
    {
        Answer storage currentAns = answers[_requestId];
        require(currentAns.commitAmt < currentAns.responseAmt, "cannot submit more responses since the commit process is finished");
        require(!currentAns.commitAddress[msg.sender], "Already commited");

        //// loop through the oracles to check if the commit hash is already exists
        //// to reduce gas fees, we can change the struct to commitReveal[_requestId][hash] = CommitReveal(address,reveal)
        for (uint i=0; i < oracles.length; i++) {
            require(commitReveal[_requestId][oracles[i]].commit != _commitHash, "cannot submit the same commit twice");
        }

        CommitReveal storage currentCR = commitReveal[_requestId][msg.sender];
        currentCR.commit = _commitHash;
        currentCR.reveal = 0;
        currentAns.endedAt[msg.sender] = block.timestamp;

        
        emit CommitReceived(_requestId, _commitHash); //should I emit commitHash? (its not useful info thogh....)
        currentAns.commitAddress[msg.sender] = true;
        currentAns.commitAmt++;
        if (currentAns.commitAmt == currentAns.responseAmt) {
            // initiate second round of oracle calls which reveal(data,salt)           
            requestReveal(_requestId);
        }
    }

    function requestReveal(bytes32 _requestId) public {
        // check caller is aggregator it self
        Answer storage currentAns = answers[_requestId];
        // call responseAmt amount of the oracles to find the answers
        for (uint i=0; i < currentAns.commitAmt; i++) {
            IRequestInterface oracle = IRequestInterface(oracles[i]);
            oracle.oracleReveal(
                msg.sender,
                0, //currentAns.commitAmt, // may need change price
                _requestId,
                address(this),
                this.revealCallback.selector
            );
        }
    }

    /**
    * @dev the oracle contract will use submit the respxonse through this request callback
    */
    function revealCallback(bytes32 _requestId, int256 _response, bytes32 _salt) external ensureOracleSender(msg.sender)
    {
        Answer storage currentAns = answers[_requestId];

        require(currentAns.revealAmt < currentAns.commitAmt, "cannot submit more responses since the reveal process is finished");
        require(!currentAns.revealAddress[msg.sender], "Already revealed request");

        CommitReveal storage currentCR = commitReveal[_requestId][msg.sender];

        require(currentCR.commit == keccak256(abi.encodePacked(_response, _salt)), "invalid reveal");
        currentCR.reveal = _response;
        currentAns.responses.push(_response);
        emit ResponseReceived(_requestId, _response);
        currentAns.revealAmt++;
        currentAns.revealAddress[msg.sender] = true;

        TrackedMetrics[msg.sender].assignedRequest -= 1;
        TrackedMetrics[msg.sender].acceptedRequest += 1;
        // updated average time
        uint avg = TrackedMetrics[msg.sender].averageResponseTime;
        uint comReq = uint(TrackedMetrics[msg.sender].completedRequest);
        uint start = currentAns.startedAt[msg.sender];
        uint end = currentAns.endedAt[msg.sender];
        TrackedMetrics[msg.sender].averageResponseTime = ((avg * comReq) + (end - start)) / (comReq + 1);
        TrackedMetrics[msg.sender].completedRequest += 1;

        if (currentAns.revealAmt == currentAns.commitAmt) {
            // all responses are received, call the callback function
            bytes memory payload = abi.encodeWithSelector(currentAns.callbackFunctionId, _requestId, _response);
            (bool success, ) = currentAns.callbackAddress.call(payload);
            require(success, "unable to call the callback function");
            emit Answered(_response);
        }
    }


    modifier ensureOracleSender(address _oracle){
        bool findOracle = false;
        for (uint i=0; i < oracles.length; i++) {
            if (oracles[i] == _oracle) {
                findOracle = true;
                break;
            }
        }
        if (findOracle) {
            _;
        }
    }
}