// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";

interface IZamaWEERC20 {
    function transferEncrypted(
        address recipient,
        einput encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool);

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

    event IntentProcessed(address indexed to, uint256 encryptedAmount);

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
        // weerc20.transferFromEncrypted(msg.sender, address(this), _encryptedAmount, _inputProof);
        // bytes memory packet = _encodePacketData(_encryptedTo, _encryptedAmount, _inputProof, _relayerAddress);
        // emit Packet(packet, _relayerAddress);
    }

    function onRecvIntent(
        address _to,
        einput _encryptedAmount,
        bytes calldata inputProof // onlyRelayer
    ) external {
        weerc20.transferEncrypted(_to, _encryptedAmount, inputProof);
    }
}
