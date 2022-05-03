import React, { useEffect, useMemo, useState } from "react";
import useLoadNFTs from "../src/hooks/useLoadNFTs";
import ModalListNFT from "../src/components/ModalListNFT";
import type { metadata } from "../src/hooks/useLoadNFTs";
import Link from "next/link";
import { useMoralis } from "react-moralis";
import Moralis from "moralis";
import Disclosure from "../src/components/Disclosure";
import NFTTile from "../src/components/NFTTile";
import { useQuery } from "react-query";
import ToastError from "../src/components/ToastError";
import ToastSucess from "../src/components/ToastSucess";

function CreatorsDashboard() {
  //Moralis variables
  const { isWeb3Enabled, user } = useMoralis();
  //state to store the nft to list in the marketplace
  const [nftToList, setnftToList] = useState<metadata>();
  //state to control the modal to list the nft.
  const [modalOpen, setModalOpen] = useState(false);
  //state to store the all nfts of the user
  const [userNFTsMetada, setUserNFTsMetada] = useState<metadata[]>();
  // store the filtered nfts of the user, use this to filter by collection
  const [filteredNFTs, setFilteredNFTs] = useState<metadata[]>();
  //state to switch between all collections and a specific collection.
  const [allCollections, setAllCollections] = useState<boolean>();
  // state to display message in case the user doesnt have any nft to display
  const [empty, setEmpty] = useState(false);
  // control the success toast in case of  a successful listing.
  const [isSuccess, setIsSuccess] = useState(false);
  // control the error toast in case of a failed listing
  const [isError, setisError] = useState(false);
  //hold the collection information retrieved from moralis.
  const [collectionList, setCollectionList] = useState<
    Moralis.Object<Moralis.Attributes>[]
  >([]);
  //function from custom hook useLoadNFTs
  const fetchNFTs = useLoadNFTs();
  //variable to check when the collection is fully retrieved, avoiding rendering without the proper information
  const { isLoading } = useQuery("collection", {
    enabled: isWeb3Enabled,
    refetchOnWindowFocus: false,
  });

  //Open the modal to list the nft
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  //should fetch nfts when there is a user authenticated and when all the collections has been retrieved
  useEffect(() => {
    executeFectchNFTs();
  }, [isWeb3Enabled, isLoading]);

  const executeFectchNFTs = async () => {
    //guardian clause, exit case there is no authenticated user or when the collection is still loading
    if (!isWeb3Enabled && !isLoading) return;
    try {
      //fetch the nfts using the custom hook useLoadNFTS
      const [_metadata, _collectionList, loading] = await fetchNFTs();
      //case the response is empty display the empty message
      setEmpty(!_metadata?.length);
      //save the metadata in the state so we can apply filters later.
      setUserNFTsMetada(_metadata);
      //also set the filtered nfts as the response, displaying in that way all the nfts.
      setFilteredNFTs(_metadata);
      if (!_collectionList) return;
      //set all the collections
      setCollectionList(_collectionList);
      //switch this state do display the disclosure for each collection, and this should only be displayed case all collections is set, otherwise just display the nfts of the selected collection
      setAllCollections(true);
    } catch (err) {
      //case an error occurs display the error toast
      console.log(err);
      if (!isError) {
        setisError(true);
        setTimeout(function () {
          setisError(false);
        }, 5000);
      }
    }
  };

  //action to list the nft
  const listNFT = async (nft: metadata) => {
    //save the current nft in the state.
    setnftToList(nft);
    //open the list modal
    toggleModal();
    return;
  };

  //filter the current collection based on the picklist value
  async function picklistChange(e: React.ChangeEvent<HTMLSelectElement>) {
    //get the collection address from the picklist
    const collectionName = e.target.value;
    //case all collection is selected, display all nfts within each collection disclosure.
    if (collectionName === "All Collections") {
      setFilteredNFTs(userNFTsMetada);
      setAllCollections(true);
      return;
    }
    if (!userNFTsMetada) return;
    //case any other collection Address is selected then filter all the nfts based on this address
    const _metadata = userNFTsMetada.filter((item) => {
      return item.address === collectionName.toLowerCase();
    });
    setAllCollections(false);
    //and then display this filtered nfts
    setFilteredNFTs(_metadata);
  }

  return (
    <div className="pb-24">
      {empty ? (
        <div className="flex mx-auto justify-content-center mt-8">
          <div className="mx-auto text-center">
            <p className="text-4xl text-[#E8C39C] font-bold">
              {" "}
              You currently have no NFT, you can mint another one.
            </p>
            <br />
            <Link href="/create">
              <button className="w-4/12 bg-secondary hover:bg-primary text-white hover:text-white cursor-pointer font-bold py-3 px-12 rounded-xl">
                {" "}
                Mint{" "}
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {nftToList && (
            <ModalListNFT
              isOpen={modalOpen}
              toggle={toggleModal}
              NFTToList={nftToList}
              setErrorMessage={setisError}
              setSuccessMessage={setIsSuccess}
            />
          )}
          <p className="text-5xl text-[#E8C39C] font-bold text-center py-14">
            Your Collection
          </p>
          <div className="flex mt-4 bg-black w-4/12 mb-8 mx-auto border border-secondary rounded overflow-hidden">
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
              {collectionList.map((collection, i) => (
                <option key={i} value={collection.get("collectionAddress")}>
                  {collection.get("name")}
                </option>
              ))}
            </select>
          </div>
          {!allCollections ? (
            <div className="md:flex justify-center">
              <div className="px-4" style={{ maxWidth: "1600px" }}>
                {filteredNFTs && filteredNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {filteredNFTs.map((nft: any, i: any) => (
                      <div key={i}>
                        <NFTTile nft={nft} callback={listNFT} button="List" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex w-full mx-auto justify-content-center mt-8">
                    <div className="mx-auto text-center">
                      <p className="text-4xl font-bold">
                        <div>You Have No NFTs On This Colleciton</div>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {userNFTsMetada &&
                collectionList.map(
                  (collection, i) =>
                    userNFTsMetada.filter((item) => {
                      return (
                        item.address ===
                        collection.get("collectionAddress").toLowerCase()
                      );
                    }).length > 0 && (
                      <Disclosure
                        key={i}
                        collectionName={collection.get("name")}
                        filteredNFTs={userNFTsMetada.filter((item) => {
                          return (
                            item.address ===
                            collection.get("collectionAddress").toLowerCase()
                          );
                        })}
                        listNFT={listNFT}
                      />
                    )
                )}
            </div>
          )}
        </div>
      )}

      {isSuccess && <ToastSucess isOpen={true} toggle={setIsSuccess} />}
      {isError && <ToastError isOpen={true} toggle={setisError} />}
    </div>
  );
}

export default CreatorsDashboard;
