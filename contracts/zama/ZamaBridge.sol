// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

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

    function transferFromEncrypted(address sender, address recipient, euint64 encryptedAmount) external returns (bool);
}

contract ZamaBridge is Ownable2Step, GatewayCaller {
    IZamaWEERC20 public weerc20;
    mapping(address => bool) public relayers;
    address public constant gateway = 0xc8c9303Cd7F337fab769686B593B87DC3403E0ce;
    uint64 public nextIntentId = 0;

    event Packet(bytes packet, address relayerAddress);

    struct Intent {
        address from;
        eaddress to;
        euint64 encryptedAmount;
    }

    mapping(uint256 intentId => Intent intent) public intents;

    event IntentProcessed(address indexed from, address indexed to, euint64 encryptedAmount);

    error OnlyRelayer();
    error DecryptionFailed();

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
        // weerc20.transferFromEncrypted(msg.sender, address(this), _encryptedAmount, _inputProof);
        // bytes memory packet = _encodePacketData(_encryptedTo, _encryptedAmount, _inputProof, _relayerAddress);
        // emit Packet(packet, _relayerAddress);
    }

    function onRecvIntent(
        einput _encryptedTo,
        einput _encryptedAmount,
        bytes calldata inputProof // onlyRelayer
    ) external {
        eaddress eto = TFHE.asEaddress(_encryptedTo, inputProof);
        euint64 eamount = TFHE.asEuint64(_encryptedAmount, inputProof);

        nextIntentId++;
        intents[nextIntentId] = Intent({ from: msg.sender, to: eto, encryptedAmount: eamount });

        euint64 encryptedIntentId = TFHE.asEuint64(nextIntentId);

        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(eto);
        cts[1] = Gateway.toUint256(encryptedIntentId);
        Gateway.requestDecryption(cts, this.callbackRecvIntent.selector, 0, block.timestamp + 10000, false);
    }

    function callbackRecvIntent(uint256, address to, uint64 intentId) public onlyGateway returns (bool) {
        Intent memory intent = intents[intentId];
        weerc20.transferFromEncrypted(intent.from, to, intent.encryptedAmount);
        emit IntentProcessed(intent.from, to, intent.encryptedAmount);

        return true;
    }
}
