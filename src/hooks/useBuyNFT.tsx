import { useMoralis } from "react-moralis";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
type props = {
  // ? after the parameters means that is optional
  marketId?: number;
  price?: string;
  callback: () => void;
  errCallback: () => void;
};

const BuyNFT = () => {
  const { Moralis, isWeb3Enabled } = useMoralis();
  const buy = async (props: props) => {
    //enable web3 case is still not initialized yet
    !isWeb3Enabled ? await Moralis.enableWeb3() : null;
    //get the market address from the env file
    const marketAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
    //get the user address
    const userAddress = await Moralis.account;
    if (!marketAddress || !userAddress || !props.price) return;

    const { marketId, price, callback, errCallback } = props;
    try {
      //set the parameters for the Moralis executeFunction
      const buyItem = {
        contractAddress: marketAddress,
        //same name as in contract
        functionName: "performATransaction",
        abi: NFTMarket.abi,
        params: {
          itemId: marketId,
        },
        //Moralis unts eth is a conversor from eth(currency like) to wei (solidity values)*
        msgValue: Moralis.Units.ETH(price),
      };
      //execute the function and buy the nft
      const listTransaction: any = await Moralis.executeFunction(buyItem);
      await listTransaction.wait();

      //invoke the success callback
      callback();
    } catch (err) {
      console.log(err);
      errCallback();
    }
  };

  return buy;
};

export default BuyNFT;
