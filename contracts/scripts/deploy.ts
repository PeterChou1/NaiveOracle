import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("NaiveToken");
  const token = await Token.deploy("NaiveToken", "NAIV");
  // TOKEN is not deployed yet wait until it mined
  await token.deployed();
  console.log("Token deployed at address: " + token.address);

  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(token.address);
  await oracle.deployed();
  console.log("Oracle deployed at address: " + oracle.address);


  const SLA = await ethers.getContractFactory("SLA");
  const sla = await SLA.deploy(token.address);
  await sla.deployed();
  console.log("SLA deployed at address: " + sla.address);

  const UserContract = await ethers.getContractFactory("UserContract");
  const usercontract = await UserContract.deploy(sla.address);
  await usercontract.deployed();
  console.log("User contract deployed at: " + usercontract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});

//npx hardhat run scripts/deploy.ts --network goerli
