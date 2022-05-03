import { useMoralis } from "react-moralis";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import axios from "axios";

interface marketItms {
  collectionAddress: string;
  itemId: string;
  nftAddress: string;
  owner: string;
  price: string;
  sold: boolean;
  tokenId: string;
}

interface metadata {
  description: string;
  id: string;
  image: string;
  marketId?: number;
  name: string;
  price?: string;
  address: string;
}

type fetchItems = (
  collectionAddress?: string | undefined
) => Promise<[marketItms[], metadata[]] | undefined>;

type filterNFTs = (
  collectionAddr: string,
  collections: marketItms[],
  metadata: metadata[]
) => [marketItms[], metadata[]];

interface dictionary {
  [key: string]: string;
}

const useFetchMarket = (): [fetchItems, filterNFTs] => {
  const { Moralis, isWeb3Enabled, isWeb3EnableLoading, web3 } = useMoralis();

  const fetchItems = async (): Promise<
    [marketItms[], metadata[]] | undefined
  > => {
    if (!isWeb3Enabled) return;
    const marketAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
    const userAddress = await Moralis.account;
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

    if (!marketAddress || !userAddress) return;
    // call the function that will return all listed nfts on the marketplace (internal smart contract function)
    const fetchItems = {
      chain: chainId,
      contractAddress: marketAddress,
      functionName: "fetchAllCollection",
      abi: NFTMarket.abi,
    };
    try {
      const marketItms: any = await Moralis.executeFunction(fetchItems);
      //get the URI for each collection
      const collectionsURI = await getCollectionURI(marketItms);
      //fetch the nft metadata
      const nftsMeta = await setNFTMetadata(marketItms, collectionsURI);
      return [marketItms, nftsMeta];
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const getCollectionURI = async (marketItms: marketItms[]) => {
    //again, creating a dictonary to help associating each collection to their uri, since we are using erc1155 and the uri is the same for the whole collection only changing the id.
    const CollectionURIDictionary: dictionary = {};
    //Promise.all because we will get a array of promises and we need to resolve all of them before continuing executing the code.
    await Promise.all(
      marketItms.map(async (item) => {
        //if dictionary doesnt contains the collection address yet, fetch the uri and set it on the dictionary
        if (!CollectionURIDictionary[item.collectionAddress]) {
          const ethers = Moralis.web3Library;
          if (!web3) return;
          const nftContract = new ethers.Contract(
            item.collectionAddress,
            NFT.abi,
            web3
          );
          //fetch the collection uri straight from the smart contract.
          const uri = await nftContract.uri(item.tokenId);
          //add the uri to the dictonary
          CollectionURIDictionary[item.collectionAddress] = uri;
        }
      })
    );
    return CollectionURIDictionary;
  };

  async function setNFTMetadata(
    nftsMeta: marketItms[],
    collectionsURI: dictionary
  ) {
    return await Promise.all(
      nftsMeta.map(async (nft) => {
        //get the uri from the collectionsURI dictionary
        const nftURI = collectionsURI[nft.collectionAddress];
        //padd the id with 0 following the erc1155 standard for metadata.
        const tokenIdString = nft.tokenId.toString().padStart(64, "0");
        //replace the {id} from the collection uri with the actual padded id of the nft, getting this way the right metadata for that nft
        const uri = nftURI?.replace("{id}", tokenIdString);
        // use axios to fetch the metadata
        const _metadata = await axios.get(uri);
        const metadata: metadata = _metadata.data;
        //add the token id as metadata for the nft
        metadata.id = nft.tokenId;
        //use moralis to convert wei to a human readable format.
        metadata.price = Moralis.Units.FromWei(nft.price);
        //add the market id to the nft (this id will be used to buy the nft)
        metadata.marketId = parseInt(nft.itemId);
        metadata.address = nft.collectionAddress;
        return metadata;
      })
    );
  }

  //auxiliar function to filter the nfts
  const filterNFTs: filterNFTs = (
    collectionAddr: string,
    collections: marketItms[],
    metadata: metadata[]
  ) => {
    const _collections = collections.filter((item) => {
      return item.collectionAddress === collectionAddr;
    });
    const _metadata = metadata.filter((item) => {
      return item.address === collectionAddr;
    });
    return [_collections, _metadata];
  };
  return [fetchItems, filterNFTs];
};

export default useFetchMarket;
