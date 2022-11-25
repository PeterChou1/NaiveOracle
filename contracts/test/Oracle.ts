import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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

  // async function simulateOracleInput() {
  //   // Contracts are deployed using the first signer/account by default
  //   const data1 = 10;
  //   const data2 = 19;

  //   const salt1 = ethers.utils.randomBytes(32); // generate random salt
  //   const hash1 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data1, salt1]); // generate random hash from salt and data
  //   const salt2 = ethers.utils.randomBytes(32); // generate random salt
  //   const hash2 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data2, salt2]); // generate random hash from salt and data
  //   return { data1, salt1, hash1, data2, salt2, hash2 };
  // }


  describe("Aggregate", function() {
    // run the fixture before each test
    const data1 = 10;
    const data2 = 19;
    const salt1 = ethers.utils.randomBytes(32); // generate random salt
    const hash1 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data1, salt1]); // generate random hash from salt and data
    const salt2 = ethers.utils.randomBytes(32); // generate random salt
    const hash2 = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [data2, salt2]); // generate random hash from salt and data

    it("Should Aggregate two data points", async function () {
      const { test, agg, o1, o2, token, owner } = await loadFixture(deployAggregatorContract);
      // User contract ask Agg->Oracles for data
      await expect(test.callOracle())
        .to.emit(o1, "RequestRecieved")
        .to.emit(o2, "RequestRecieved");

      // Oracle node recieves request and perpare commit hash
      let requestRecievedO1C = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2C = await o2.queryFilter(o2.filters.RequestRecieved());
      let argsO1C = requestRecievedO1C[0].args;
      let argsO2C = requestRecievedO2C[0].args;
      // Oracles contract send the commit hash to Aggregator
      await expect(o1.commitOracleRequest(argsO1C._requestId, argsO1C._callbackAddress, argsO1C._callbackFunctionId, hash1))
        .to.emit(agg, "CommitReceived");
      await expect(o2.commitOracleRequest(argsO2C._requestId, argsO2C._callbackAddress, argsO2C._callbackFunctionId, hash2))
        .to.emit(agg, "CommitReceived")
        .to.emit(o1, "RequestReveal")
        .to.emit(o2, "RequestReveal");

      // Oracle node recieves request and perpare reveal data
      let requestRecievedO1R = await o1.queryFilter(o1.filters.RequestReveal());
      let requestRecievedO2R = await o2.queryFilter(o2.filters.RequestReveal());
      let argsO1R = requestRecievedO1R[0].args;
      let argsO2R = requestRecievedO2R[0].args;
      // Oracles contract send the reveal data to Aggregator
      await expect(o1.revealOracleRequest(argsO1R._requestId, argsO1R._callbackAddress, argsO1R._callbackFunctionId, data1, salt1))
        .to.emit(agg, "ResponseReceived");
      await expect(o2.revealOracleRequest(argsO2R._requestId, argsO2R._callbackAddress, argsO2R._callbackFunctionId, data2, salt2))
        .to.emit(agg, "ResponseReceived")
        .to.emit(agg, "Answered");

      // User contract check the response
      const responseAns = ethers.BigNumber.from("19");
      expect(await test.getResponse()).to.equal(responseAns);
    });


    it("Oracle should unable to have second chance (commit or reveal)", async function () {

    });

    it("Oracle should unable to sent reval before commit finished", async function () {

    });

    it("Oracle should unable to send new commit after commit finished", async function () {

    });

    it("Oracle should unable to callback after request finished", async function () {
      // check commit

      // check reveal

    });

    it("Aggregator should remove CommitReveal stored", async function () {
      // to save cost of storage
      // no need for early version

    });

    it("Oracle should remove commitment stored", async function () {
      // no need for early version

    });
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
      const { test, agg, o1, o2, token, owner } = await loadFixture(deployAggregatorContract);
      // User contract ask Agg->Oracles for data
      await expect(test.callOracle())
        .to.emit(o1, "RequestRecieved")
        .to.emit(o2, "RequestRecieved");
      // Oracle node recieves request and perpare commit hash
      let requestRecievedO1C = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2C = await o2.queryFilter(o2.filters.RequestRecieved());
      let argsO1C = requestRecievedO1C[0].args;
      let argsO2C = requestRecievedO2C[0].args;
      await expect(o1.commitOracleRequest(argsO1C._requestId, argsO1C._callbackAddress, argsO1C._callbackFunctionId, hash1))
        .to.emit(agg, "CommitReceived");
      await expect(o2.commitOracleRequest(argsO2C._requestId, argsO2C._callbackAddress, argsO2C._callbackFunctionId, hash2))
        .to.emit(agg, "CommitReceived");
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
      const { test, agg, o1, o2, token, owner } = await loadFixture(deployAggregatorContract);
      // User contract ask Agg->Oracles for data
      await expect(test.callOracle())
        .to.emit(o1, "RequestRecieved")
        .to.emit(o2, "RequestRecieved");
      // Oracle node recieves request and perpare commit hash
      let requestRecievedO1C = await o1.queryFilter(o1.filters.RequestRecieved());
      let requestRecievedO2C = await o2.queryFilter(o2.filters.RequestRecieved());
      let argsO1C = requestRecievedO1C[0].args;
      let argsO2C = requestRecievedO2C[0].args;

      // notice we trying to freeload by commit the same hash from other oracle
      await expect(o1.commitOracleRequest(argsO1C._requestId, argsO1C._callbackAddress, argsO1C._callbackFunctionId, hash1))
        .to.emit(agg, "CommitReceived");
      await expect(o2.commitOracleRequest(argsO2C._requestId, argsO2C._callbackAddress, argsO2C._callbackFunctionId, hash1))
        .to.be.revertedWith(
          "failed to executed provided commit callback function" //"cannot commit the hash that already exists"
        );
    });

  })

  describe("Oracle", function () {
    it("Oracle should hash correct commitment", async function () {
      // no need for early version

    });
    it("Oracle should remove commitment stored", async function () {
      // no need for early version

    });
  })


  describe("Hacker", function () {
    it("Aggregator should filterout unauthorized Oracle request", async function () {
      // no need for early version

    });
  })
 
});
