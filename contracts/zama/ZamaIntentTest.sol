// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

contract ZamaIntentTest is GatewayCaller {
    struct Intent {
        address from;
        address to;
        euint64 encryptedAmount;
    }

    struct EncryptedIntent {
        address from;
        address to;
        euint64 encryptedAmount;
    }

    Intent public lastIntent;
    EncryptedIntent public lastEncryptedIntent;

    event IntentDecrypted(address from, address to, euint64 encryptedAmount);

    function createIntent(address from, address to, einput encryptedAmount, bytes calldata inputProof) public {
        euint64 encryptedAmountCT = TFHE.asEuint64(encryptedAmount, inputProof);
        EncryptedIntent memory intent = EncryptedIntent(from, to, encryptedAmountCT);
        lastEncryptedIntent = intent;
    }

    function decryptIntent(
        einput encryptedIntent,
        bytes calldata inputProof // onlyRelayer
    ) public {
        ebytes256 encryptedIntentCT = TFHE.asEbytes256(encryptedIntent, inputProof);
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encryptedIntentCT);
        Gateway.requestDecryption(cts, this.callbackRecvIntent.selector, 0, block.timestamp + 10000, false);
    }

    function callbackRecvIntent(uint256, bytes calldata decryptedIntent) public onlyGateway returns (bool) {
        (address from, address to, euint64 encryptedAmount) = abi.decode(decryptedIntent, (address, address, euint64));

        lastIntent = Intent(from, to, encryptedAmount);
        emit IntentDecrypted(from, to, encryptedAmount);

        return true;
    }
}
