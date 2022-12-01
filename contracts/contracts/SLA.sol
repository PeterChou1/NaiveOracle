// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/INaiveToken.sol";
import "./interfaces/IServerLevelAggrement.sol";
import "./interfaces/IAggregator.sol";
import "./interfaces/IRequestInterface.sol";
// import "./utils/utils.sol";

/**
 * @title A naive chain aggregator
 */ 
contract SLA is IServerLevelAggrement {

    struct Answer {
        // basic request info
        bytes32 requestId;
        uint256 paymentAmt;
        uint256 responseAmt;
        address callbackAddress;
        bytes4 callbackFunctionId;
        
        // order-matching
        address[] oracles;

        // aggregation with commit/reveal
        uint256 commitAmt;
        uint256 revealAmt;
        mapping(address => bool) commitAddress;
        mapping(address => bool) revealAddress;
        int256[] responses;
        
        // reputation
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
        // int256 penaltyAmt; // last item 
    }

    mapping(address => Metrics) public TrackedMetrics;

    struct CommitReveal{
        bytes32 commit; // could change this to address to reduce gas fees
        int256 reveal;
    }

    INaiveToken private token;
    uint256 orderNumber;

    mapping(bytes32 => Answer) private answers;
    mapping(bytes32 => mapping(address => CommitReveal)) commitReveal;

    constructor(address _NaiveChainToken) {
        // oracles = _oracles;
        token = INaiveToken(_NaiveChainToken);
        orderNumber = 0;
        // minResponses = _minResponses;
    }
    
    // ORDER MATCHING ------------------------------------------------------------

    function broadcastOrder(uint256 _responseAmt, uint256 _paymentAmt, address _callbackAddress, bytes4 _callbackFunctionSignature) external returns (bytes32 requestId){
        requestId = keccak256(abi.encodePacked(_responseAmt, _paymentAmt, _callbackAddress, _callbackFunctionSignature, orderNumber));
        // initialize requestId with empty Answer 
        Answer storage ans = answers[requestId];
        ans.requestId = requestId;
        ans.paymentAmt = _paymentAmt;
        ans.responseAmt = _responseAmt;
        ans.callbackAddress = _callbackAddress;
        ans.callbackFunctionId = _callbackFunctionSignature; // user contract's callback info
        ans.commitAmt = 0;
        ans.revealAmt = 0;
        // broadcast basic order information with register handle to the public
        emit OrderBroadcasted(requestId, msg.sender, _paymentAmt, _responseAmt, address(this), this.matchCallback.selector);
        orderNumber++;
    }

    // this function is called by an oracle when they accepts the match
    function matchCallback(bytes32 _requestId) external {
        Answer storage ans = answers[_requestId];
        address[] storage oracles = ans.oracles;

        require(oracles.length < ans.responseAmt, "request already matched");
        for (uint i = 0; i < oracles.length; i++){
            require(oracles[i] != msg.sender, "oracle already matched");
        }
        oracles.push(msg.sender);

        // if the amount of oracles is equal to the amount of responses required
        // then the order is matched
        if(oracles.length == answers[_requestId].responseAmt){
            // emit event to notify the requester that the order is matched
            emit OrderMatched(_requestId, oracles);

            // other possible implementation: 
            // 1. start the commit here
            // 2. pay when reveal finished?

            // transfer payment to the oracles so user covers the cost of the gas fees
            this.getAnswer(_requestId);
        }
    }

    // ORDER MATCHING ------------------------------------------------------------

    /**
    * @dev get the generic API response from oracle 
    */
    function getAnswer(bytes32 _requestId) external {
        Answer storage ans = answers[_requestId];

        uint256 paymentAmt = ans.paymentAmt;
        uint256 responseAmt = ans.responseAmt;
        address[] memory oracles = ans.oracles;

        require(responseAmt <= oracles.length, "cannot request for more oracle than held by the contract");
        
        // call responseAmt amount of the oracles to find the answers
        for (uint i=0; i < responseAmt; i++) {
            IRequestInterface oracle = IRequestInterface(oracles[i]);
            // updated reputation metrics
            TrackedMetrics[oracles[i]].assignedRequest += 1;
            TrackedMetrics[oracles[i]].acceptedRequest += 1;
            ans.startedAt[oracles[i]] = block.timestamp;
            require(
                token.transferAndCall(
                    oracles[i], 
                    paymentAmt / responseAmt, 
                    abi.encodeWithSelector(
                        oracle.oracleRequest.selector,
                        msg.sender,
                        paymentAmt / responseAmt,
                        _requestId,
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
    function commitCallback(bytes32 _requestId, bytes32 _commitHash) external ensureMatchedOracleSender(_requestId, msg.sender)
    {
        Answer storage currentAns = answers[_requestId];
        address[] memory oracles = currentAns.oracles;

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
            IRequestInterface oracle = IRequestInterface(currentAns.oracles[i]);
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
    function revealCallback(bytes32 _requestId, int256 _response, bytes32 _salt) external ensureMatchedOracleSender(_requestId, msg.sender)
    {
        Answer storage currentAns = answers[_requestId];
        require(currentAns.revealAmt < currentAns.responseAmt, "cannot submit more responses since the reveal process is finished");
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

        uint avg = TrackedMetrics[msg.sender].averageResponseTime;
        uint comReq = uint(TrackedMetrics[msg.sender].completedRequest);
        uint start = currentAns.startedAt[msg.sender];
        uint end = currentAns.endedAt[msg.sender];
        TrackedMetrics[msg.sender].averageResponseTime = ((avg * comReq) + (end - start)) / (comReq + 1);
        TrackedMetrics[msg.sender].completedRequest += 1;

        if (currentAns.revealAmt == currentAns.responseAmt) {
        // all responses are received, call the callback function
            int256 result = aggregator(_requestId);
            bytes memory payload = abi.encodeWithSelector(currentAns.callbackFunctionId, _requestId, result);
            (bool success, ) = currentAns.callbackAddress.call(payload);
                //require(success, "unable to call the callback function");
            emit Answered(_response);
        }
    }

    function aggregator(bytes32 _requestId) public returns (int256) {
        Answer storage currentAns = answers[_requestId];
        require(currentAns.revealAmt == currentAns.responseAmt, "cannot get the answer since the reveal process is not finished");
        // should follow the implementation of ./utils/utils.ts
        // 1. update the reputation metrics
        // 2. slashing Naive coin for bad behaviour
        return currentAns.responses[0];
    }

    modifier ensureMatchedOracleSender(bytes32 _requestId, address _oracle){
        address[] memory oracles = answers[_requestId].oracles;

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