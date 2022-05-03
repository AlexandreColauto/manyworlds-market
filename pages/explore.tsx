import React, { useEffect, useState } from "react";
import useFetchMarket from "../src/hooks/useFetchMarket";
import { useMoralis } from "react-moralis";
import Moralis from "moralis/types";
import useFetchCollection from "../src/hooks/useFetchCollection";
import useBuyNFT from "../src/hooks/useBuyNFT";
import NFTTile from "../src/components/NFTTile";
import { useQuery } from "react-query";
import Link from "next/link";
import ToastSucess from "../src/components/ToastSucess";
import ToastError from "../src/components/ToastError";
import Processing from "../src/components/Processing";
import customCollections from "../customCollections.json";

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

function Explore() {
  //functions from the custom hook useFetchMarket
  const [fetchItems, filterItems] = useFetchMarket();
  const { isWeb3Enabled } = useMoralis();
  //save the collection list on this state
  const [collectionList, setCollectionList] = useState<
    Moralis.Object<Moralis.Attributes>[]
  >([]);
  //set a filtered collection to display only the nfts of this selected collection
  const [filteredcollectionList, setfilteredcollectionList] = useState<
    Moralis.Object<Moralis.Attributes>[]
  >([]);
  //get the function of the custom hook useFetchCollection
  const [, fetchAll] = useFetchCollection();
  //save all the market items so filters can be applied latter
  const [marketItms, setMarketItms] = useState<marketItms[]>();
  //save all the nfts metadata on the state
  const [metadata, setMetadata] = useState<metadata[]>();
  //set the filtered nfts so only the nfts of a given collection are displayed
  const [filtered_metadata, setfiltered_Metadata] = useState<metadata[]>();
  //display an empty message in case there is no nfts to display in the market
  const [empty, setEmpty] = useState(false);
  //error and success toasts
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setisError] = useState(false);
  //locking modal that prevent users from switching pages and causing unexpected behaviour
  const [processing, setProcessing] = useState(false);
  //function from the custom hook useBuyNFT
  const buy = useBuyNFT();
  //variable from react-query that tells when the query is finished, avoiding doing logicc with missing data.
  const { isLoading } = useQuery("collection", {
    enabled: isWeb3Enabled,
    refetchOnWindowFocus: false,
  });
  //as soon we got an authenticated user fetch all market items
  useEffect(() => {
    getItems();
  }, [isWeb3Enabled]);

  //as soon the react-query finishes the query retrieve all the collections
  useEffect(() => {
    getCollections();
  }, [isLoading]);

  //when the collection and the items are retrieved, display the nfts to the user
  useEffect(() => {
    if (!marketItms || !collectionList) return;
    filterCollections(marketItms);
  }, [marketItms, collectionList]);

  const getItems = async () => {
    if (!isWeb3Enabled) return;
    //call the function from the custom hook useFetchMarket, from which a call to the contract is make returning all the listed items.
    const answer = await fetchItems();

    if (!answer) return;
    //display the empty message case the length of the result is 0, i.e. there is no listed nfts.
    setEmpty(!answer[0].length);
    //destruct the variables and set the necessary state.
    const [_marketItms, _metadata] = answer;
    setMarketItms(_marketItms);
    setMetadata(_metadata);
    setfiltered_Metadata(_metadata);
    filterCollections(_marketItms);
  };

  const getCollections = async () => {
    if (!isWeb3Enabled) return;
    //fetch all collections from the custom hook useFetchCollection
    const [_collections] = await fetchAll();
    if (!_collections) return;
    console.log(_collections);
    setCollectionList(_collections);
  };

  //filter the collection based on the picklist value.
  async function picklistChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const collectionName = e.target.value;
    if (collectionName === "All Collections") {
      setfiltered_Metadata(metadata);
      return;
    }
    if (!marketItms || !metadata) return;
    //filter items is a custom function from useFetchMarket hook.
    const [_marketItms, _metadata] = filterItems(
      collectionName,
      marketItms,
      metadata
    );
    setfiltered_Metadata(_metadata);
  }

  async function handleBuy(nftToBuy: metadata) {
    //OPEN the modal
    setProcessing(true);
    //define the success callback function
    const callback = () => {
      setProcessing(false);
      setIsSuccess(true);
    };
    //define the error callback function
    const errCallback = () => {
      setProcessing(false);
      setisError(true);
    };
    //call the custom hook
    await buy({ ...nftToBuy, callback, errCallback });
  }
  //filter the market items to display only the collections from the moralis db, cleaning any trash that might be listed to the maarket contract (used most for testing but is another security step into production)
  const filterCollections = (marketItms: marketItms[]) => {
    const filteredCollections: any[] = [];
    if (!marketItms) return;
    collectionList.map((collection, i) => {
      const collectionsItems = marketItms.filter((item) => {
        return (
          item.collectionAddress === collection.attributes.collectionAddress
        );
      });
      if (collectionsItems.length) filteredCollections.push(collection);
    });
    setfilteredcollectionList(filteredCollections);
  };

  return (
    <div className="pb-16">
      <p className="text-6xl text-[#E8C39C] font-bold text-center py-14">
        Explore Collections
      </p>
      <div className="flex mt-4 bg-black w-8/12 mb-8 mx-auto border border-secondary rounded overflow-hidden">
        <span className="text-sm text-white  px-4 py-2 bg-secondary whitespace-no-wrap">
          Collection:
        </span>
        <select
          className=" py-2 w-full  bg-white"
          onChange={(e) => {
            picklistChange(e);
          }}
        >
          <option>All Collections</option>
          {customCollections &&
            customCollections.map((collection, index: any) => (
              <option value={collection.address} key={index}>
                {collection.name}
              </option>
            ))}
          {filteredcollectionList.map((collection, i) => (
            <option key={i} value={collection.get("collectionAddress")}>
              {collection.get("name")}
            </option>
          ))}
        </select>
      </div>
      <hr />
      {empty ? (
        <div className="flex mx-auto justify-content-center mt-8">
          <div className="mx-auto text-center">
            <p className="text-4xl font-bold text-white">
              {" "}
              There&apos;s currently no NFT on the Marketplace, come back later.
            </p>
          </div>
        </div>
      ) : (
        <div className="md:flex justify-center">
          <div className="px-4" style={{ maxWidth: "1600px" }}>
            <div className="grid grid-cols-1 text-[#E8C39C] sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {filtered_metadata &&
                filtered_metadata.map((nft, i) => (
                  <NFTTile
                    key={i}
                    nft={nft}
                    callback={handleBuy}
                    button="Buy"
                  />
                ))}
            </div>
          </div>
        </div>
      )}
      <Processing isOpen={processing} />

      {isSuccess && <ToastSucess isOpen={true} toggle={setIsSuccess} />}
      {isError && <ToastError isOpen={true} toggle={setisError} />}
    </div>
  );
}

export default Explore;
