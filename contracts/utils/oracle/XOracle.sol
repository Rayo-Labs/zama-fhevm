// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract XOracle is Ownable2Step {
    mapping(uint256 => uint256) private prices; // chainId => price

    constructor() Ownable(msg.sender) {
        prices[1] = 3000 * 10 ** 18;
        prices[9000] = 20 * 10 ** 18;
    }

    function setPrice(uint256 _chainId, uint256 _price) public onlyOwner {
        prices[_chainId] = _price;
    }

    function getPrice(uint256 _chainId) public view returns (uint256) {
        return prices[_chainId];
    }
}
