// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IXOracle {
    function getPrice(uint256 chainId) external view returns (uint256);
}
