import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Oracle = await ethers.getContractFactory("Oracle");
  const token = await Oracle.deploy(
    "0x9245c9f28fdB80d87bf659014B1F37cDd1cb4492"
  );

  console.log("Contract Address:", token.address);
  console.log(token);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//npx hardhat run scripts/deployOracle.ts --network goerli
