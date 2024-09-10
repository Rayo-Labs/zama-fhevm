// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";

interface IZamaWEERC20 {
    function transferFrom(address recipient, einput encryptedAmount, bytes calldata inputProof) external returns (bool);

    function transferFromEncrypted(
        address sender,
        address recipient,
        einput encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool);
}

contract ZamaBridge is Ownable2Step {
    IZamaWEERC20 public weerc20;
    mapping(address => bool) public relayers;

    event Packet(bytes packet, address relayerAddress);

    error OnlyRelayer();

    modifier onlyRelayer() {
        if (!relayers[msg.sender]) {
            revert OnlyRelayer();
        }
        _;
    }

    constructor(address _tokenAddress) Ownable(msg.sender) {
        weerc20 = IZamaWEERC20(_tokenAddress);
    }

    function setRelayer(address _relayer, bool _status) public onlyOwner {
        relayers[_relayer] = _status;
    }

    function bridgeWEERC20(
        einput _encryptedTo,
        einput _encryptedAmount,
        bytes calldata _inputProof,
        address _relayerAddress
    ) public {
        // bridgeNativeToNative implementation
        weerc20.transferFrom(address(this), _encryptedAmount, _inputProof);

        bytes memory packet = _encodePacketData(_encryptedTo, _encryptedAmount, _inputProof, _relayerAddress);

        emit Packet(packet, _relayerAddress);
    }

    function _encodePacketData(
        einput _encryptedTo,
        einput _encryptedAmount,
        bytes memory _inputProof,
        address _relayerAddress
    ) internal pure returns (bytes memory) {
        return abi.encode(_encryptedTo, _encryptedAmount, _inputProof, _relayerAddress);
    }

    function _decodePacketData(bytes memory _data) internal pure returns (einput, einput, bytes memory, address) {
        return abi.decode(_data, (einput, einput, bytes, address));
    }
}
