// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


import "./interfaces/INaiveToken.sol";
import "./interfaces/IERC677Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IServerLevelAggrement.sol";


contract NaiveToken is INaiveToken, ERC20 {

  constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

  /**
  * @dev transfer token to a contract address with additional data if the recipient is a contact.
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  * @param _data The extra data to be passed to the receiving contract.
  */
  function transferAndCall(address _to, uint _value, bytes calldata _data)
    public
    returns (bool success)
  {
    super.transfer(_to, _value);
    emit Transfer(msg.sender, _to, _value, _data);
    if (isContract(_to)) {
      contractFallback(_to, _value, _data);
    }
    return true;
  }
      
  function transferAndAcceptOrder(address _to, uint _value, bytes32 _requestId)
    public
    returns (bool success)
  {
    IServerLevelAggrement sla = IServerLevelAggrement(_to);
    uint256 stakeAmt = sla.getStakeAmt(_requestId);
    require(stakeAmt == _value , "stake amount does not match order");

    super.transfer(_to, _value);

    emit Transfer(msg.sender, _to, _value, abi.encodeWithSignature("", _value));
    sla.matchCallback(msg.sender, _requestId);
  
    return true;
  }

  function transferStakeToOracle(address _to, uint256 _value)
    public
    returns (bool success)
  {
    super.transfer(_to, _value);

    emit Transfer(msg.sender, _to, _value, abi.encodeWithSignature("", _value));
    return true;
  }

  function deposit(uint depositAmt) payable external {
    require(msg.value == depositAmt, "invalid amount deposited");
    // 1 wei == 1000 NaiveToken 
    _mint(msg.sender, msg.value * 1000);
  } 

  // for testing
  function mint(address receiver, uint mintAmt) external {
    _mint(receiver, mintAmt);
    emit Transfer(address(0), receiver, mintAmt, abi.encodeWithSignature("", mintAmt));
  } 


  // PRIVATE
  // TODO: might be a security issue see this thread for more research
  // https://ethereum.stackexchange.com/questions/15641/how-does-a-contract-find-out-if-another-address-is-a-contract
  function isContract(address _addr) private view returns (bool isAddrContract) {
    isAddrContract = _addr.code.length > 0;
  }

  function contractFallback(address _to, uint _value, bytes calldata _data) private
  {
    IERC677Receiver receiver = IERC677Receiver(_to);
    receiver.onTokenTransfer(msg.sender, _value, _data);
  }
}
