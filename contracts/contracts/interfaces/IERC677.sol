// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IERC677 {
  event Transfer(address indexed from, address indexed to, uint value, bytes data);
  function transferAndCall(
    address to,
    uint256 value,
    bytes calldata data
  ) external returns (bool success);
}
