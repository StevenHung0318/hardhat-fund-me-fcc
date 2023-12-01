const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? // only going to run this if we are not in a developmentchain
      // staging test only run on test nets
      describe.skip
    : describe("FundMe Staging Tests", function () {
          let deployer
          let fundMe
          // Converts the decimal string ether to a BigInt, using 18 decimal places.
          const sendValue = ethers.parseEther("0.1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContractAt(
                  "FundMe",
                  (await deployments.get("FundMe")).address,
              )
          })

          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target,
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal...",
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
