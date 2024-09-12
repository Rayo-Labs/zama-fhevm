// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

contract ZamaTest is GatewayCaller {
    struct Test {
        euint64 encryptedNumber;
    }

    uint64 public nextId = 0;
    euint64 public lastEncryptedNumber;

    constructor() {
        lastEncryptedNumber = TFHE.asEuint64(0);
    }

    mapping(uint64 id => Test test) public getTest;

    event EncryptedNumber(euint64 encryptedNumber);

    function createTest(einput encryptedNumber, bytes calldata inputProof) public {
        euint64 encNumber = TFHE.asEuint64(encryptedNumber, inputProof);
        Test memory newTest = Test(encNumber);
        getTest[nextId] = newTest;
        nextId++;
    }

    function decryptTest() public {
        euint64 encryptedId = TFHE.asEuint64(nextId);
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encryptedId);
        Gateway.requestDecryption(cts, this.callbackDecryptTest.selector, 0, block.timestamp + 10000, false);
    }

    function callbackDecryptTest(uint256, uint64 decryptedId) public onlyGateway returns (bool) {
        Test memory test = getTest[decryptedId];
        lastEncryptedNumber = test.encryptedNumber;
        emit EncryptedNumber(test.encryptedNumber);
        return true;
    }
}
