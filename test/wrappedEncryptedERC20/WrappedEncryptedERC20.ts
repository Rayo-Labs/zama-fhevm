import { expect } from "chai";
import { ethers } from "hardhat";

import { awaitAllDecryptionResults } from "../asyncDecrypt";
import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";

describe("WrappedEncryptedERC20", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const encryptedTokenFactory = await ethers.getContractFactory("WrappedEncryptedERC20");
    const encryptedToken = await encryptedTokenFactory.connect(this.signers.alice).deploy("Wrapped Test Token", "WTT");
    await encryptedToken.waitForDeployment();

    this.encryptedTokenAddress = await encryptedToken.getAddress();
    this.weerc20 = encryptedToken;
    this.instances = await createInstances(this.signers);
  });

  it.skip("should deposit the contract", async function () {
    const beforeBalance = await ethers.provider.getBalance(this.signers.alice.address);
    const beforeContractBalance = await ethers.provider.getBalance(this.encryptedTokenAddress);

    const depositAmount = 0.01;
    const depositAmount18Decimal = BigInt(depositAmount * 10 ** 18);
    const depositAmount6Decimal = BigInt(depositAmount * 10 ** 6);
    const transaction = await this.weerc20.connect(this.signers.alice).deposit({ value: depositAmount18Decimal });
    const receipt = await transaction.wait();

    const gasUsed = BigInt(receipt.gasUsed.toString());
    const gasPrice = BigInt(receipt.gasPrice.toString());
    const totalFee = gasUsed * gasPrice;

    const afterBalance = await ethers.provider.getBalance(this.signers.alice.address);
    const afterContractBalance = await ethers.provider.getBalance(this.encryptedTokenAddress);
    const totalSupply = await this.weerc20.totalSupply();

    expect(afterBalance).to.equal(beforeBalance - depositAmount18Decimal - totalFee);
    expect(afterContractBalance).to.equal(beforeContractBalance + depositAmount18Decimal);
    expect(totalSupply).to.equal(depositAmount6Decimal);
  });

  it("should withdraw the contract", async function () {
    const depositAmount = 0.01;
    const depositAmount18Decimal = BigInt(depositAmount * 10 ** 18);

    const depositTrancastion = await this.weerc20
      .connect(this.signers.alice)
      .deposit({ value: depositAmount18Decimal });
    await depositTrancastion.wait();

    const withdrawAmount = 0.005;
    const withdrawAmount18Decimal = BigInt(withdrawAmount * 10 ** 18);
    const withdrawAmount6Decimal = BigInt(withdrawAmount * 10 ** 6);
    const beforeAliceBalance = await ethers.provider.getBalance(this.signers.alice.address);
    const beforeBobBalance = await ethers.provider.getBalance(this.signers.bob.address);
    const beforeContractBalance = await ethers.provider.getBalance(this.encryptedTokenAddress);
    const beforeContractTotalSupply = await this.weerc20.totalSupply();

    const inputAmount = this.instances.alice.createEncryptedInput(
      this.encryptedTokenAddress,
      this.signers.alice.address,
    );
    inputAmount.add64(withdrawAmount6Decimal);
    const encryptedWithdrawAmount = inputAmount.encrypt();

    const inputTo = this.instances.alice.createEncryptedInput(this.encryptedTokenAddress, this.signers.alice.address);
    inputTo.addAddress(this.signers.bob.address);
    const encryptedTo = inputTo.encrypt();

    const withdrawTransaction = await this.weerc20
      .connect(this.signers.alice)
      .withdrawal(
        encryptedWithdrawAmount.handles[0],
        encryptedWithdrawAmount.inputProof,
        encryptedTo.handles[0],
        encryptedTo.inputProof,
      );
    const withdrawReceipt = await withdrawTransaction.wait();
    await awaitAllDecryptionResults();

    const withdrawGasUsed = BigInt(withdrawReceipt.gasUsed.toString());
    const withdrawGasPrice = BigInt(withdrawReceipt.gasPrice.toString());
    const withdrawTotalFee = withdrawGasUsed * withdrawGasPrice;

    const afterAliceBalance = await ethers.provider.getBalance(this.signers.alice.address);
    const afterBobBalance = await ethers.provider.getBalance(this.signers.bob.address);
    const afterContractBalance = await ethers.provider.getBalance(this.encryptedTokenAddress);
    const afterContractTotalSupply = await this.weerc20.totalSupply();

    expect(afterContractTotalSupply).to.equal(beforeContractTotalSupply - withdrawAmount6Decimal);
  });
});
