import { useMoralis } from "react-moralis";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
type props = {
  collectionAddr: string;
  id: string;
  nftPrice: string;
  callback: () => void;
  errCallback: () => void;
};

const ListNFT = () => {
  const { Moralis, isWeb3Enabled } = useMoralis();
  const list = async (props: props) => {
    !isWeb3Enabled ? await Moralis.enableWeb3() : null;
    const marketAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
    const userAddress = await Moralis.account;
    if (!marketAddress || !userAddress) return;

    const { collectionAddr, id, nftPrice, callback, errCallback } = props;
    try {
      //first check if the market contract is approved to spend the users nfts (this is done by default in the nft smartcontract but here is a double check for security reasons)
      const isApprvd = {
        contractAddress: collectionAddr,
        functionName: "isApprovedForAll",
        abi: NFT.abi,
        params: {
          account: userAddress,
          operator: marketAddress,
        },
      };
      //if is not approved then approve.
      const isApproved = await Moralis.executeFunction(isApprvd);
      if (!isApproved) {
        const setApproval = {
          contractAddress: collectionAddr,
          functionName: "setApprovalForAll",
          abi: NFT.abi,
          params: {
            operator: marketAddress,
            approved: true,
          },
        };
        const approveTransaction: any = await Moralis.executeFunction(
          setApproval
        );
        await approveTransaction.wait();
      }
      //then call the list function from the market contract with the propper parameters
      const listItem = {
        contractAddress: marketAddress,
        functionName: "ListNFT",
        abi: NFTMarket.abi,
        params: {
          NFTaddress: collectionAddr,
          collectionAddress: collectionAddr,
          id: id,
          price: Moralis.Units.ETH(nftPrice.toString()),
        },
      };
      const listTransaction: any = await Moralis.executeFunction(listItem);
      await listTransaction.wait();

      callback();
    } catch (err) {
      console.log(err);
      errCallback();
    }
  };

  return list;
};

export default ListNFT;
