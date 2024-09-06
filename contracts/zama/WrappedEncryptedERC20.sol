// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract WrappedEncryptedERC20 is Ownable2Step, GatewayCaller {
    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);
    event Mint(address indexed to, uint64 amount);

    error FailedTransfer();

    uint64 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 public constant decimals = 6;

    // A mapping from address to an encrypted balance.
    mapping(address => euint64) internal balances;

    // A mapping of the form mapping(owner => mapping(spender => allowance)).
    mapping(address => mapping(address => euint64)) internal allowances;

    constructor(string memory name_, string memory symbol_) Ownable(msg.sender) {
        _name = name_;
        _symbol = symbol_;
    }

    // Returns the name of the token.
    function name() public view virtual returns (string memory) {
        return _name;
    }

    // Returns the symbol of the token, usually a shorter version of the name.
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    // Returns the total supply of the token
    function totalSupply() public view virtual returns (uint64) {
        return _totalSupply;
    }

    // Mints an encrypted amount of tokens to the `to` address.
    function deposit() public payable virtual {
        uint256 amount = msg.value;
        uint64 convertedAmount = _convertDecimalForDeposit(amount);
        balances[msg.sender] = TFHE.add(balances[msg.sender], TFHE.asEuint64(convertedAmount));
        TFHE.allow(balances[msg.sender], address(this));
        TFHE.allow(balances[msg.sender], msg.sender);
        _totalSupply = _totalSupply + convertedAmount;
    }

    // Withdraws an encrypted amount of tokens to the `to` address.
    function withdrawal(
        einput encryptedAmount,
        bytes calldata encryptedAmountProof,
        einput encryptedTo,
        bytes calldata encryptedToProof
    ) public virtual {
        euint64 amount = TFHE.asEuint64(encryptedAmount, encryptedAmountProof);
        eaddress to = TFHE.asEaddress(encryptedTo, encryptedToProof);
        ebool canWithdraw = TFHE.le(amount, balances[msg.sender]);
        euint64 canWithdrawAmount = TFHE.select(canWithdraw, amount, TFHE.asEuint64(0));

        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(canWithdrawAmount);
        cts[1] = Gateway.toUint256(to);
        Gateway.requestDecryption(cts, this.callbackWithdrawal.selector, 0, block.timestamp + 100, false);
    }

    // Callback function for withdrawal.
    function callbackWithdrawal(uint256, uint64 amount, address to) public onlyGateway returns (bool) {
        _totalSupply = _totalSupply - amount;
        euint64 eAmount = TFHE.asEuint64(amount);
        balances[msg.sender] = TFHE.sub(balances[msg.sender], eAmount);
        TFHE.allow(balances[msg.sender], address(this));
        TFHE.allow(balances[msg.sender], msg.sender);

        (bool success, ) = to.call{ value: _convertDecimalForWithdraw(amount) }("");
        if (!success) {
            revert FailedTransfer();
        }

        return true;
    }

    // Transfers an encrypted amount from the message sender address to the `to` address.
    function transfer(address to, einput encryptedAmount, bytes calldata inputProof) public virtual returns (bool) {
        transfer(to, TFHE.asEuint64(encryptedAmount, inputProof));
        return true;
    }

    // Transfers an amount from the message sender address to the `to` address.
    function transfer(address to, euint64 amount) public virtual returns (bool) {
        require(TFHE.isSenderAllowed(amount));
        // makes sure the owner has enough tokens
        ebool canTransfer = TFHE.le(amount, balances[msg.sender]);
        _transfer(msg.sender, to, amount, canTransfer);
        return true;
    }

    // Returns the balance handle of the caller.
    function balanceOf(address wallet) public view virtual returns (euint64) {
        return balances[wallet];
    }

    // Sets the `encryptedAmount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, einput encryptedAmount, bytes calldata inputProof) public virtual returns (bool) {
        approve(spender, TFHE.asEuint64(encryptedAmount, inputProof));
        return true;
    }

    // Sets the `amount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, euint64 amount) public virtual returns (bool) {
        require(TFHE.isSenderAllowed(amount));
        address owner = msg.sender;
        _approve(owner, spender, amount);
        emit Approval(owner, spender);
        return true;
    }

    // Returns the remaining number of tokens that `spender` is allowed to spend
    // on behalf of the caller.
    function allowance(address owner, address spender) public view virtual returns (euint64) {
        return _allowance(owner, spender);
    }

    // Transfers `encryptedAmount` tokens using the caller's allowance.
    function transferFrom(
        address from,
        address to,
        einput encryptedAmount,
        bytes calldata inputProof
    ) public virtual returns (bool) {
        transferFrom(from, to, TFHE.asEuint64(encryptedAmount, inputProof));
        return true;
    }

    // Transfers `amount` tokens using the caller's allowance.
    function transferFrom(address from, address to, euint64 amount) public virtual returns (bool) {
        require(TFHE.isSenderAllowed(amount));
        address spender = msg.sender;
        ebool isTransferable = _updateAllowance(from, spender, amount);
        _transfer(from, to, amount, isTransferable);
        return true;
    }

    function _approve(address owner, address spender, euint64 amount) internal virtual {
        allowances[owner][spender] = amount;
        TFHE.allow(amount, address(this));
        TFHE.allow(amount, owner);
        TFHE.allow(amount, spender);
    }

    function _allowance(address owner, address spender) internal view virtual returns (euint64) {
        return allowances[owner][spender];
    }

    function _updateAllowance(address owner, address spender, euint64 amount) internal virtual returns (ebool) {
        euint64 currentAllowance = _allowance(owner, spender);
        // makes sure the allowance suffices
        ebool allowedTransfer = TFHE.le(amount, currentAllowance);
        // makes sure the owner has enough tokens
        ebool canTransfer = TFHE.le(amount, balances[owner]);
        ebool isTransferable = TFHE.and(canTransfer, allowedTransfer);
        _approve(owner, spender, TFHE.select(isTransferable, TFHE.sub(currentAllowance, amount), currentAllowance));
        return isTransferable;
    }

    // Transfers an encrypted amount.
    function _transfer(address from, address to, euint64 amount, ebool isTransferable) internal virtual {
        // Add to the balance of `to` and subract from the balance of `from`.
        euint64 transferValue = TFHE.select(isTransferable, amount, TFHE.asEuint64(0));
        euint64 newBalanceTo = TFHE.add(balances[to], transferValue);
        balances[to] = newBalanceTo;
        TFHE.allow(newBalanceTo, address(this));
        TFHE.allow(newBalanceTo, to);
        euint64 newBalanceFrom = TFHE.sub(balances[from], transferValue);
        balances[from] = newBalanceFrom;
        TFHE.allow(newBalanceFrom, address(this));
        TFHE.allow(newBalanceFrom, from);
        emit Transfer(from, to);
    }

    // Converts the amount for deposit.
    function _convertDecimalForDeposit(uint256 amount) internal pure returns (uint64) {
        return uint64(amount / 10 ** (18 - decimals));
    }

    // Converts the amount for withdrawal.
    function _convertDecimalForWithdraw(uint64 amount) internal pure returns (uint256) {
        return uint256(amount) * 10 ** (18 - decimals);
    }
}
