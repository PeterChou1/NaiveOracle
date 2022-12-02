// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


import "./IERC677.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface INaiveToken is IERC677, IERC20 {
    function deposit(uint depositAmt) payable external;
    function mint(address receiver, uint mintAmt) external;

    function transferAndCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool success);

    function transferAndAcceptOrder(
        address to,
        uint256 value,
        bytes32 _requestId
    ) external returns (bool success);

    function transferStakeToOracle(
        address _to, 
        uint256 _value
    ) external returns (bool success);
}
