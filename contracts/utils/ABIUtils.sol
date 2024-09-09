// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import { einput } from "fhevm/lib/TFHE.sol";

library ABIUtils {
    function encodePacketData(
        einput _encryptedTo,
        einput _encryptedAmount,
        bytes memory _inputProof,
        address _relayerAddress
    ) public pure returns (bytes memory) {
        return abi.encode(_encryptedTo, _encryptedAmount, _inputProof, _relayerAddress);
    }

    function decodePacketData(bytes memory _data) public pure returns (einput, einput, bytes memory, address) {
        return abi.decode(_data, (einput, einput, bytes, address));
    }
}
