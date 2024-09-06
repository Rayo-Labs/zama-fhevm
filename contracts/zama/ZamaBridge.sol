// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";
import "../utils/ABIUtils.sol";
import "../utils/oracle/IXOracle.sol";

contract ZamaBridge is Ownable2Step {
    IXOracle public oracle;

    mapping(address => bool) public relayers;

    event Packet(bytes packet, address relayerAddress);

    error InvalidChainId();
    error OnlyRelayer();

    modifier onlyRelayer() {
        if (!relayers[msg.sender]) {
            revert OnlyRelayer();
        }
        _;
    }

    constructor(address _oracle) Ownable(msg.sender) {
        oracle = IXOracle(_oracle);
    }

    function setOracle(address _oracle) public onlyOwner {
        oracle = IXOracle(_oracle);
    }

    function bridgeNativeToNative(
        einput _encryptedInput,
        einput _encryptedRelayerInput,
        uint256 _slippage,
        address _relayerAddress
    ) public payable {
        // bridgeNativeToNative implementation
        uint256 amountIn = msg.value;
        uint256 amountOut = _calculateAmountOut(9000, 1, amountIn);

        bytes memory data = ABIUtils.encodePacketData(
            _encryptedInput,
            _encryptedRelayerInput,
            amountIn,
            amountOut,
            _slippage
        );
        bytes memory packet = ABIUtils.encodePacket(BridgeType.NativeToNative, data);

        emit Packet(packet, _relayerAddress);
    }

    /**
     * @dev _encryptedInput have to be (address to,). This input is just readable by the destination chain contract.
     */
    function bridgeNativeToWEETH(
        einput _encryptedInput,
        einput _encryptedRelayerInput,
        uint256 _slippage,
        address _relayerAddress
    ) public payable {
        // bridgeNativeToWEETH implementation
        uint256 amountIn = msg.value;
        uint256 amountOut = _calculateAmountOut(9000, 1, amountIn);

        bytes memory data = ABIUtils.encodePacketData(
            _encryptedInput,
            _encryptedRelayerInput,
            amountIn,
            amountOut,
            _slippage
        );
        bytes memory packet = ABIUtils.encodePacket(BridgeType.NativeToWEETH, data);

        emit Packet(packet, _relayerAddress);
    }

    function _calculateAmountOut(
        uint256 _sourceChainId,
        uint256 _destinationChainId,
        uint256 _amount
    ) internal view returns (uint256) {
        // _calculateAmountOut implementation
        uint256 sourceChainPrice = oracle.getPrice(_sourceChainId);
        uint256 destinationChainPrice = oracle.getPrice(_destinationChainId);

        if (sourceChainPrice == 0 || destinationChainPrice == 0) {
            revert InvalidChainId();
        }

        return (_amount * sourceChainPrice) / destinationChainPrice;
    }
}
