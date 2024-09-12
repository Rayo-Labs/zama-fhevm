// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

interface IZamaWEERC20 {
    function transferEncrypted(address recipient, einput encryptedAmount, bytes calldata inputProof) external;

    function transferFromEncrypted(
        address sender,
        address recipient,
        einput encryptedAmount,
        bytes calldata inputProof
    ) external;

    function transferFromEncrypted(address sender, address recipient, euint64 encryptedAmount) external;
}

contract ZamaBridge is Ownable2Step, GatewayCaller {
    IZamaWEERC20 public weerc20;

    struct Intent {
        address from;
        eaddress to;
        euint64 encryptedAmount;
    }

    address public constant gateway = 0xc8c9303Cd7F337fab769686B593B87DC3403E0ce;
    uint64 public nextIntentId = 0;

    mapping(uint64 intentId => Intent intent) public intents;

    event Packet(eaddress to, euint64 amount, address relayer);
    event TestPacket(uint256 num);
    event IntentProcessed(address indexed from, address indexed to, euint64 encryptedAmount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        weerc20 = IZamaWEERC20(_tokenAddress);
    }

    function bridgeWEERC20(
        einput _encryptedTo,
        einput _encryptedAmount,
        bytes calldata _inputProof,
        address _relayerAddress
    ) public {
        weerc20.transferFromEncrypted(msg.sender, address(this), _encryptedAmount, _inputProof);

        eaddress to = TFHE.asEaddress(_encryptedTo, _inputProof);
        euint64 amount = TFHE.asEuint64(_encryptedAmount, _inputProof);

        TFHE.allow(to, _relayerAddress);
        TFHE.allow(amount, _relayerAddress);

        emit Packet(to, amount, _relayerAddress);
    }

    function onRecvIntent(einput _encryptedTo, einput _encryptedAmount, bytes calldata inputProof) external {
        eaddress eto = TFHE.asEaddress(_encryptedTo, inputProof);
        euint64 eamount = TFHE.asEuint64(_encryptedAmount, inputProof);
        euint64 encryptedIntentId = TFHE.asEuint64(nextIntentId);

        nextIntentId++;

        TFHE.allow(eto, gateway);
        TFHE.allow(eamount, gateway);
        TFHE.allow(eamount, address(this));
        TFHE.allow(eamount, address(weerc20));
        TFHE.allow(encryptedIntentId, gateway);

        Intent memory intent = Intent({ from: msg.sender, to: eto, encryptedAmount: eamount });
        intents[nextIntentId] = intent;

        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(eto);
        cts[1] = Gateway.toUint256(encryptedIntentId);
        Gateway.requestDecryption(cts, this.callbackRecvIntent.selector, 0, block.timestamp + 10000, false);
    }

    function callbackRecvIntent(uint256, address to, uint64 intentId) public onlyGateway returns (bool) {
        Intent memory intent = intents[intentId];
        address from = intent.from;
        euint64 amount = intent.encryptedAmount;

        TFHE.allow(amount, gateway);
        TFHE.allow(amount, address(this));
        TFHE.allow(amount, address(weerc20));

        weerc20.transferFromEncrypted(from, to, amount);

        emit IntentProcessed(from, to, amount);

        return true;
    }

    function testEmit() public {
        emit TestPacket(123);
    }
}
