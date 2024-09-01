// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

contract TContract {
    uint64 private _totalSupply;

    mapping(address => euint64) internal balances;
}
