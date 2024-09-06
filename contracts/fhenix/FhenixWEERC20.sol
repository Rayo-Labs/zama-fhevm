// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FhenixWEERC20 is ERC20 {
    mapping(eaddress => euint32) public _encBalances;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100 * 10 ** uint(decimals()));
    }

    function wrap(uint32 amount) public {
        // Make sure that the sender has enough of the public balance
        require(balanceOf(msg.sender) >= amount);

        eaddress sender = FHE.asEaddress(msg.sender);

        // Burn public balance
        _burn(msg.sender, amount);

        // convert public amount to shielded by encrypting it
        euint32 shieldedAmount = FHE.asEuint32(amount);
        // Add shielded balance to his current balance
        _encBalances[sender] = _encBalances[sender] + shieldedAmount;
    }

    function unwrap(inEuint32 memory amount) public {
        eaddress sender = FHE.asEaddress(msg.sender);
        euint32 _amount = FHE.asEuint32(amount);

        // verify that our shielded balance is greater or equal than the requested amount
        FHE.req(_encBalances[sender].gte(_amount));
        // subtract amount from shielded balance
        _encBalances[sender] = _encBalances[sender] - _amount;
        // add amount to caller's public balance by calling the `mint` function
        _mint(msg.sender, FHE.decrypt(_amount));
    }

    function transferEncrypted(inEaddress calldata encryptedTo, inEuint32 calldata encryptedAmount) public {
        eaddress sender = FHE.asEaddress(msg.sender);
        eaddress to = FHE.asEaddress(encryptedTo);
        euint32 amount = FHE.asEuint32(encryptedAmount);
        // Make sure the sender has enough tokens.
        FHE.req(amount.lte(_encBalances[sender]));

        // Add to the balance of `to` and subract from the balance of `from`.
        _encBalances[to] = _encBalances[to] + amount;
        _encBalances[sender] = _encBalances[sender] - amount;
    }
}
