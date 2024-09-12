// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/lib/TFHE.sol";

interface IZamaWEERC20 {
    function transferEncrypted(address recipient, einput encryptedAmount, bytes calldata inputProof) external;

    function transferFromEncrypted(
        address sender,
        address recipient,
        einput encryptedAmount,
        bytes calldata inputProof
    ) external;
}

contract ZamaBridge is Ownable2Step {
    IZamaWEERC20 public weerc20;
    mapping(address => bool) public relayers;

    event Packet(eaddress to, euint64 amount, address relayer);
    event TestPacket(uint256 num);

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
        weerc20.transferFromEncrypted(msg.sender, address(this), _encryptedAmount, _inputProof);

        eaddress to = TFHE.asEaddress(_encryptedTo, _inputProof);
        euint64 amount = TFHE.asEuint64(_encryptedAmount, _inputProof);

        TFHE.allow(to, _relayerAddress);
        TFHE.allow(amount, _relayerAddress);

        emit Packet(to, amount, _relayerAddress);
    }

    function testEmit() public {
        emit TestPacket(123);
    }

    function onRecvIntent(
        address _to,
        einput _encryptedAmount,
        bytes calldata inputProof // onlyRelayer
    ) external {
        weerc20.transferEncrypted(_to, _encryptedAmount, inputProof);
    }

    function withdraw(einput _encryptedAmount, bytes calldata _inputProof) public onlyOwner {
        weerc20.transferEncrypted(msg.sender, _encryptedAmount, _inputProof);
    }
}
