import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Oracle", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAggregatorContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("NaiveToken");
    const token = await Token.deploy("NaiveToken", "NT");

    const Oracle = await ethers.getContractFactory("Oracle");
    const o1 = await Oracle.deploy(token.address);
    const o2 = await Oracle.deploy(token.address);


    const Aggregator = await ethers.getContractFactory("Aggregator");
    const agg = await Aggregator.deploy([o1.address, o2.address], token.address);

    const TestContract = await ethers.getContractFactory("TestContract");
    const test = await TestContract.deploy(agg.address);

    return { agg, o1, o2, test, token, owner, otherAccount };
  }


  describe("Aggregate", function() {
    it("Should Aggregate two data points", async function () {
      const { test, agg, o1, o2, token, owner } = await loadFixture(deployAggregatorContract);
      const gwei = ethers.BigNumber.from("1");
      const result = ethers.BigNumber.from("1000");
      token.deposit(gwei, {value: gwei});
      expect(await token.balanceOf(owner.address)).to.equal(result);

      await expect(test.callOracle())
                .to.emit(o1, "RequestRecieved")
                .to.emit(o2, "RequestRecieved");
      let requestRecievedO1 = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2 = await o2.queryFilter(o2.filters.RequestRecieved());
      let args1 = requestRecievedO1[0].args;
      let args2 = requestRecievedO2[0].args;

      await expect(o1.fulfillOracleRequest(args1._requestId, args1._callbackAddress, args1._callbackFunctionId, 10))
            .to.emit(agg, "ResponseReceived");

      await expect(o2.fulfillOracleRequest(args2._requestId, args2._callbackAddress, args2._callbackFunctionId, 19))
            .to.emit(agg, "ResponseReceived")
            .to.emit(agg, "Answered");
      
      const responseAns = ethers.BigNumber.from("19");
      expect(await test.getResponse()).to.equal(responseAns);

    });

  })
 
});
