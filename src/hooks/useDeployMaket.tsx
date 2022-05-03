import { useMoralis } from "react-moralis";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

type create = () => Promise<string>;
function useCreateCollection(): [create] {
  const { isAuthenticated, Moralis } = useMoralis();
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

  //auxiliar hook to deploy the market, only used for setup the app in the first time.
  const create: create = async () => {
    const ethers = Moralis.web3Library;

    try {
      const web3Provider = await Moralis.enableWeb3();
      const signer = await web3Provider.getSigner();

      const tokenContract = new ethers.ContractFactory(
        NFTMarket.abi,
        NFTMarket.bytecode,
        signer
      );
      if (!tokenAddress)
        throw new Error("missing reward token in the env file");
      const nft = await tokenContract.deploy(tokenAddress);
      await nft.deployed();
      console.log("nft deployed to:", nft.address);

      return nft.address;
    } catch (error: any) {
      console.log(error);
      return "";
    }
  };

  return [create];
}
export default useCreateCollection;
