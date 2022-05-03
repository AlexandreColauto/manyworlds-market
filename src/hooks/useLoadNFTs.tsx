import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import axios from "axios";
import useFetchCollection from "./useFetchCollection";
import { useCallback, useMemo, useState } from "react";
import Moralis from "moralis/types";

interface metadata {
  address: string;
  collection?: string;
  description: string;
  id: string;
  image: string;
  name: string;
  price?: string;
  marketId?: number;
  fee?: number;
}
function useLoadNFTs() {
  const Web3Api = useMoralisWeb3Api();
  const [, _fetch] = useFetchCollection();
  const { isAuthenticated, Moralis, chainId } = useMoralis();

  const fetchNFTs = async (): Promise<
    | [metadata[], Moralis.Object<Moralis.Attributes>[], boolean]
    | [undefined, undefined, boolean]
  > => {
    const useraddress = Moralis.account;
    const chainId = Moralis.chainId;
    //fetch collection from the custom hook useFetchCollection (cached)
    const [collections, addressDic, loading] = await _fetch();

    if (!useraddress || !collections) return [, , loading];
    //get all nfts that belong to the user, in the current chain
    const options: typeof Moralis.Web3API.account.getNFTs.arguments = {
      chain: chainId,
      address: useraddress,
    };
    const _userNFTsCollections = await Moralis.Web3API.account.getNFTs(options);
    if (!_userNFTsCollections) return [, , loading];
    if (!_userNFTsCollections.result) return [, , loading];
    //filter all nfts to display only nfts that belong to the market, avoiding display external nfts.
    const userNFTsCollections = _userNFTsCollections.result.filter((nft) => {
      return Object.keys(addressDic).includes(nft.token_address.toLowerCase());
    });
    //create a array to save only valid metadata
    const nftsMeta: metadata[] = [];
    await Promise.all(
      userNFTsCollections.map(async (nft) => {
        if (!nft.token_uri) return;
        try {
          console.log(nft.token_uri);
          //fetch the nft metadata from the uri
          const metadata = await axios.get(nft.token_uri);
          //save the collection address in the metadata
          metadata.data.collection = addressDic
            ? addressDic[nft.token_address]
            : "";
          metadata.data.address = nft.token_address;
          metadata.data.id = nft.token_id;
          nftsMeta.push(metadata.data);
        } catch (err) {
          //case any error in the retrieving metadata create a place holder
          const dataPlaceHolder = {
            address: nft.token_address,
            id: nft.token_id,
            description: "Not Available",
            image: "/logo.png",
            name: "Not Available",
          };
          nftsMeta.push(dataPlaceHolder);
        }
      })
    );

    return [nftsMeta, collections, loading];
  };
  return fetchNFTs;
}

export type { metadata };

export default useLoadNFTs;
