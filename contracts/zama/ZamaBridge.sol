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
}

contract ZamaBridge is Ownable2Step, GatewayCaller {
    IZamaWEERC20 public weerc20;
    mapping(address => bool) public relayers;
    address public constant gateway = 0xc8c9303Cd7F337fab769686B593B87DC3403E0ce;

    event Packet(bytes packet, address relayerAddress);

    event IntentProcessed(
        address indexed from,
        address indexed to,
        address indexed tokenAddress,
        einput encryptedAmount
    );

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
        einput encryptedIntent,
        bytes calldata inputProof // onlyRelayer
    ) external {
        ebytes256 encryptedIntentCT = TFHE.asEbytes256(encryptedIntent, inputProof);
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encryptedIntentCT);
        Gateway.requestDecryption(cts, this.callbackRecvIntent.selector, 0, block.timestamp + 10000, false);
    }

    function callbackRecvIntent(uint256, bytes calldata decryptedIntent) public onlyGateway returns (bool) {
        (address from, address to, address tokenAddress, einput encryptedAmount) = abi.decode(
            decryptedIntent,
            (address, address, address, einput)
        );

        weerc20.transferFromEncrypted(from, to, encryptedAmount, decryptedIntent);
        emit IntentProcessed(from, to, tokenAddress, encryptedAmount);

        return true;
    }
}
