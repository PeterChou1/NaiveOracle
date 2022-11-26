import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SLA", function () {
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

    const ServerLevelAggrement = await ethers.getContractFactory("SLA");
    const sla = await ServerLevelAggrement.deploy(token.address);

    const UserContract = await ethers.getContractFactory("UserContract");
    const user = await UserContract.deploy(sla.address);

    return { sla, o1, o2, user, token, owner, otherAccount };
  }

  describe("Aggregate", function() {
    // run the fixture before each test
    const data1 = 10;
    const data2 = 19;
    const salt1 = ethers.utils.randomBytes(32); // generate random salt
    const hash1 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data1, salt1]); // generate random hash from salt and data
    const salt2 = ethers.utils.randomBytes(32); // generate random salt
    const hash2 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data2, salt2]); // generate random hash from salt and data

    it("Should Aggregate two data points", async function () {
      const { user, sla, o1, o2, token, owner, otherAccount } = await loadFixture(deployAggregatorContract);

      // order matching
      await expect(user.callOracle(2, 0))
        .to.emit(sla, "OrderBroadcasted");
        // .to.emit(o1, "RequestRecieved")
        // .to.emit(o2, "RequestRecieved");
      let OrderBroadcasted = await sla.queryFilter(sla.filters.OrderBroadcasted());
      let orderArgs = OrderBroadcasted[0].args;
      await expect(o1.acceptOrder(orderArgs.requestId, orderArgs.callbackAddress, orderArgs.callbackFunctionId))
        .to.not.emit(sla, "OrderMatched")
        .to.not.emit(o1, "RequestRecieved");
      await expect(o2.acceptOrder(orderArgs.requestId, orderArgs.callbackAddress, orderArgs.callbackFunctionId))
        .to.emit(sla, "OrderMatched") // enough oracle accepted, trigger aggregation->getAnswer
        .to.emit(o1, "RequestRecieved")
        .to.emit(o2, "RequestRecieved");

      // Oracle node recieves request and perpare commit hash
      let requestRecievedO1C = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2C = await o2.queryFilter(o2.filters.RequestRecieved());
      let argsO1C = requestRecievedO1C[0].args;
      let argsO2C = requestRecievedO2C[0].args;
      // Oracles contract send the commit hash to Aggregator
      await expect(o1.commitOracleRequest(argsO1C._requestId, argsO1C._callbackAddress, argsO1C._callbackFunctionId, hash1))
        .to.emit(sla, "CommitReceived");
      await expect(o2.commitOracleRequest(argsO2C._requestId, argsO2C._callbackAddress, argsO2C._callbackFunctionId, hash2))
        .to.emit(sla, "CommitReceived")
        .to.emit(o1, "RequestReveal")
        .to.emit(o2, "RequestReveal");

      // Oracle node recieves request and perpare reveal data
      let requestRecievedO1R = await o1.queryFilter(o1.filters.RequestReveal());
      let requestRecievedO2R = await o2.queryFilter(o2.filters.RequestReveal());
      let argsO1R = requestRecievedO1R[0].args;
      let argsO2R = requestRecievedO2R[0].args;
      // Oracles contract send the reveal data to Aggregator
      await expect(o1.revealOracleRequest(argsO1R._requestId, argsO1R._callbackAddress, argsO1R._callbackFunctionId, data1, salt1))
        .to.emit(sla, "ResponseReceived");
      await expect(o2.revealOracleRequest(argsO2R._requestId, argsO2R._callbackAddress, argsO2R._callbackFunctionId, data2, salt2))
        .to.emit(sla, "ResponseReceived")
        .to.emit(sla, "Answered");

      // User contract check the response
      const responseAns = ethers.BigNumber.from("19");
      expect(await user.getResponse()).to.equal(responseAns);
    });


  })

  describe("Reputation", function () {
  })

  describe("Order Matching", function () {
  })

  describe("Freeloading", function () {
    // run the fixture before each test
    const data1 = 10;
    const data2 = 19;
    const salt1 = ethers.utils.randomBytes(32); // generate random salt
    const hash1 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data1, salt1]); // generate random hash from salt and data
    const salt2 = ethers.utils.randomBytes(32); // generate random salt
    const hash2 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data2, salt2]); // generate random hash from salt and data

   
    it("Aggregator should reject invalid reveal (with wrong data or salt)", async function () {
      const { user, sla, o1, o2, token, owner } = await loadFixture(deployAggregatorContract);
      
      // order matching
      await expect(user.callOracle(2, 0))
        .to.emit(sla, "OrderBroadcasted");
      // .to.emit(o1, "RequestRecieved")
      // .to.emit(o2, "RequestRecieved");
      let OrderBroadcasted = await sla.queryFilter(sla.filters.OrderBroadcasted());
      let orderArgs = OrderBroadcasted[0].args;
      await expect(o1.acceptOrder(orderArgs.requestId, orderArgs.callbackAddress, orderArgs.callbackFunctionId))
        .to.not.emit(sla, "OrderMatched")
        .to.not.emit(o1, "RequestRecieved");
      await expect(o2.acceptOrder(orderArgs.requestId, orderArgs.callbackAddress, orderArgs.callbackFunctionId))
        .to.emit(sla, "OrderMatched") // enough oracle accepted, trigger aggregation->getAnswer
        .to.emit(o1, "RequestRecieved")
        .to.emit(o2, "RequestRecieved");

      // Oracle node recieves request and perpare commit hash
      let requestRecievedO1C = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2C = await o2.queryFilter(o2.filters.RequestRecieved());
      let argsO1C = requestRecievedO1C[0].args;
      let argsO2C = requestRecievedO2C[0].args;
      await expect(o1.commitOracleRequest(argsO1C._requestId, argsO1C._callbackAddress, argsO1C._callbackFunctionId, hash1))
        .to.emit(sla, "CommitReceived");
      await expect(o2.commitOracleRequest(argsO2C._requestId, argsO2C._callbackAddress, argsO2C._callbackFunctionId, hash2))
        .to.emit(sla, "CommitReceived")
        .to.emit(o1, "RequestReveal")
        .to.emit(o2, "RequestReveal");
      // Oracle node recieves request and perpare reveal data
      let requestRecievedO1R = await o1.queryFilter(o1.filters.RequestReveal());
      let argsO1R = requestRecievedO1R[0].args;

      // notice we reveal with wrong data/salt
      await expect(o1.revealOracleRequest(argsO1R._requestId, argsO1R._callbackAddress, argsO1R._callbackFunctionId, data1, salt2))
        .to.be.revertedWith(
          "failed to executed provided reveal callback function" //"invalid reveal"
        );
    });

    it("Aggregator should pervent Oracles to do freeloading (by steal both commit and reveal data)", async function () {
      const { user, sla, o1, o2, token, owner } = await loadFixture(deployAggregatorContract);
      // order matching
      await expect(user.callOracle(2, 0))
        .to.emit(sla, "OrderBroadcasted");
      // .to.emit(o1, "RequestRecieved")
      // .to.emit(o2, "RequestRecieved");
      let OrderBroadcasted = await sla.queryFilter(sla.filters.OrderBroadcasted());
      let orderArgs = OrderBroadcasted[0].args;
      await expect(o1.acceptOrder(orderArgs.requestId, orderArgs.callbackAddress, orderArgs.callbackFunctionId))
        .to.not.emit(sla, "OrderMatched")
        .to.not.emit(o1, "RequestRecieved");
      await expect(o2.acceptOrder(orderArgs.requestId, orderArgs.callbackAddress, orderArgs.callbackFunctionId))
        .to.emit(sla, "OrderMatched") // enough oracle accepted, trigger aggregation->getAnswer
        .to.emit(o1, "RequestRecieved")
        .to.emit(o2, "RequestRecieved");

      // Oracle node recieves request and perpare commit hash
      let requestRecievedO1C = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2C = await o2.queryFilter(o2.filters.RequestRecieved());
      let argsO1C = requestRecievedO1C[0].args;
      let argsO2C = requestRecievedO2C[0].args;

      // notice we trying to freeload by commit the same hash from other oracle
      await expect(o1.commitOracleRequest(argsO1C._requestId, argsO1C._callbackAddress, argsO1C._callbackFunctionId, hash1))
        .to.emit(sla, "CommitReceived");
      await expect(o2.commitOracleRequest(argsO2C._requestId, argsO2C._callbackAddress, argsO2C._callbackFunctionId, hash1))
        .to.be.revertedWith(
          "failed to executed provided commit callback function" //"cannot commit the hash that already exists"
        );
    });

  })

  describe("Coin Slashing", function () {
    // it("Detect bad behavers of Oracle (Score)", async function () {
    // });

    // it("Spending should allocated evently(in range of +-gas) when Oracles behaves good", async function () {

    // });
    // it("Oracle should't earn if when Oracles behaves bad", async function () {
    //   // Oracle should't earn if they got bad score in current round from reputation contract

    //   // if they got bad score in current round from some part of sla

    //   // check their balance is not changed

    // });
  })
  
});


describe("Oracle", function () {

  describe("Other, waiting to allocate", function () {
    // it("Oracle should hash correct commitment", async function () {
    //   // no need for early version

    // });
    // it("Oracle should remove commitment stored", async function () {
    //   // no need for early version

    // });
    // it("Oracle should unable to have second chance (commit or reveal)", async function () {

    // });

    // it("Oracle should unable to sent reval before commit finished", async function () {

    // });

    // it("Oracle should unable to send new commit after commit finished", async function () {

    // });

    // it("Oracle should unable to callback after request finished", async function () {
    //   // check commit

    //   // check reveal

    // });

    // it("Aggregator should remove CommitReveal stored", async function () {
    //   // to save cost of storage
    //   // no need for early version

    // });

    // it("Oracle should remove commitment stored", async function () {
    //   // no need for early version

    // });
    // it("Aggregator should filterout unauthorized Oracle(address) request", async function () {
    //   // no need for early version

    // });
  })

})
