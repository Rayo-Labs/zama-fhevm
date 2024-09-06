// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import { einput } from "fhevm/lib/TFHE.sol";
import { BridgeType } from "./BridgeTypes.sol";

library ABIUtils {
    function encodePacket(BridgeType _bridgeType, bytes memory _data) public pure returns (bytes memory) {
        return abi.encode(_bridgeType, _data);
    }

    function decodePacket(bytes memory _data) public pure returns (BridgeType, bytes memory) {
        return abi.decode(_data, (BridgeType, bytes));
    }

    function encodePacketData(
        einput _encryptedInput,
        einput _encryptedRelayerInput,
        uint256 _amountIn,
        uint256 _amountOut,
        uint256 _slippage
    ) public pure returns (bytes memory) {
        return abi.encode(_encryptedInput, _encryptedRelayerInput, _amountIn, _amountOut, _slippage);
    }

    function decodePacketData(bytes memory _data) public pure returns (einput, einput, uint256, uint256, uint256) {
        return abi.decode(_data, (einput, einput, uint256, uint256, uint256));
    }
}
