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

  const Oracle1 = await ethers.getContractFactory("Oracle");
  const oracle1 = await Oracle1.deploy(token.address);
  await oracle1.deployed();
  console.log("Oracle deployed at address: " + oracle1.address);

  const Oracle2 = await ethers.getContractFactory("Oracle");
  const oracle2 = await Oracle2.deploy(token.address);
  await oracle2.deployed();
  console.log("Oracle deployed at address: " + oracle2.address);

  const Oracle3 = await ethers.getContractFactory("Oracle");
  const oracle3 = await Oracle3.deploy(token.address);
  await oracle3.deployed();
  console.log("Oracle deployed at address: " + oracle3.address);

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
