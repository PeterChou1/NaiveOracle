// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


import "./IERC677.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface INaiveToken is IERC677, IERC20 {
    function deposit(uint depositAmt) payable external;
}
