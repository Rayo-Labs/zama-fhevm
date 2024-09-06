// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

contract TestC {
    euint64 public count;

    constructor() {
        //count = TFHE.asEuint64(0);
    }

    function setZero() public {
        count = TFHE.asEuint64(0);
    }

    function increment(einput _encryptedValue, bytes calldata _encryptedProof) public {
        euint64 value = TFHE.asEuint64(_encryptedValue, _encryptedProof);
        count = TFHE.add(count, value);
    }

    function decrement(einput _encryptedValue, bytes calldata _encryptedProof) public {
        euint64 value = TFHE.asEuint64(_encryptedValue, _encryptedProof);
        count = TFHE.sub(count, value);
    }
}
