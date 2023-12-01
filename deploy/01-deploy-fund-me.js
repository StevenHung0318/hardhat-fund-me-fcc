// hre = hardhat runtime environments

// async function deployFunc(hre) {
//     console.log("HI")
//     hre.getNamedAccounts
//     hre.deployments
// }
// equal to -> module.exports = async ({ getNamedAccounts, deployments }) => {}

// module.exports.default = deployFunc  -> default to run deployFunc()

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }
// Also equal to -> module.exports = async ({ getNamedAccounts, deployments }) => {}

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A ...
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    // if the contract doesn't exist, we deploy a minimal version of
    // for our local testing

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    // don't wanna verify on local network
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}
module.exports.tags = ["all", "fundme"]
