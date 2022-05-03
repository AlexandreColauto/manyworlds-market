const hre = require('hardhat')
const fs = require('fs')
async function main() {
  const NFTMarket = await hre.ethers.getContractFactory('NFTMarket')
  const nftMarket = await NFTMarket.deploy(process.env.MARKET_FEE_WALLET)
  await nftMarket.deployed()
  console.log('NFT Market Deployed: ', nftMarket.address)

  const NFT = await hre.ethers.getContractFactory('NFT')
  const nft = await NFT.deploy('test')
  await nft.deployed()
  console.log('NFT Deployed: ', nft.address)

  let config = `
  export const nftmarketaddress = '${nftMarket.address}'
  export const nftaddress = '${nft.address}'`

  let data = JSON.stringify(config)
  fs.writeFileSync('./config.js', JSON.parse(data))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
