import React, { ChangeEvent, useEffect, useState } from "react";
import useMint from "../src/hooks/useMint";
import useFetchCollection from "../src/hooks/useFetchCollection";
import Moralis from "moralis";
import { useQuery } from "react-query";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import Processing from "../src/components/Processing";
import ToastSucess from "../src/components/ToastSucess";
import ToastError from "../src/components/ToastError";

const Mint = () => {
  //state to store the users input
  const [imgUrl, setImgUrl] = useState("");
  const [formInput, updateFormInput] = useState({
    name: "Name",
    description: "",
  });
  //open the locking modal
  const [processing, setProcessing] = useState(false);
  //success/erro toast
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setisError] = useState(false);
  //store moralis db collection list.
  const [collectionList, setCollectionList] = useState<
    Moralis.Object<Moralis.Attributes>[]
  >([]);
  //store the selected collection from which the new nft will be minted
  const [collection, setCollection] =
    useState<Moralis.Object<Moralis.Attributes>>();
  //functions from the custom hook useMint
  const [saveFile, mint] = useMint();
  //functions from the custom hook useFetchCollection (react-query)
  const [fetch] = useFetchCollection();
  const { isWeb3Enabled } = useMoralis();
  const { isLoading } = useQuery("collection", {
    enabled: isWeb3Enabled,
    refetchOnWindowFocus: false,
  });
  //when all the collections has been retrieved then set the collection list
  useEffect(() => {
    getCollections();
  }, [isLoading]);

  //function to fetch the collection list and set it on the state
  const getCollections = async () => {
    const [_collections] = await fetch();
    if (!_collections) return;
    setCollectionList(_collections);
    setCollection(_collections[0]);
  };

  //filter the collection based on the picklist value
  async function picklistChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const collectionName = e.target.value;
    for (let i = 0; i < collectionList.length; i++) {
      if (collectionList[i].get("name") === collectionName) {
        setCollection(collectionList[i]);
      }
    }
  }
  //function to store the NFT image into IPFS, all the logic is done in the custom hook
  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const data = e?.target?.files[0];
    if (!data) return;
    const fileURL = await saveFile(data);
    console.log(fileURL);
    setImgUrl(fileURL);
  }

  //callback for the mint function, to set the success toast according to the result of the minting.
  const callback = () => {
    setImgUrl("");
    updateFormInput({ name: "", description: "" });
    setProcessing(false);
    if (!isSuccess) {
      setIsSuccess(true);
      setTimeout(function () {
        setIsSuccess(false);
      }, 5000);
    }
  };
  //call the mint function
  const executeMint = async () => {
    if (!collection || !formInput) return;
    const { name, description } = formInput;
    const collectionName = collection.get("name");
    const address = collection.get("collectionAddress");
    //open the modal
    setProcessing(true);
    //call the mint function from the custom hook useMint
    const result = await mint({
      name,
      description,
      imgUrl,
      callback,
      address,
      collectionName,
    });
    if (!result) {
      setProcessing(false);
      if (!isError) {
        setisError(true);
        setTimeout(function () {
          setisError(false);
        }, 5000);
      }
    }
  };

  return (
    <div className="mt-10">
      <div className="mx-auto mt-10 w-1/2 bg-white py-4 rounded-xl">
        <div className="p-8 pl-14 text-center">
          <p className="text-5xl font-bold text-[#404D3A] my-6">
            Create New Item
          </p>
          <div className="mt-10">
            <label className="file-label">
              <input
                className="hidden"
                type="file"
                name="resume"
                onChange={onChange}
              />
              <div
                className={`w-[350px] mx-auto h-[350px] overflow-hidden grid place-content-center hover:drop-shadow-md cursor-pointer rounded-xl ${
                  imgUrl ? "" : "border-[#404D3A] border-2 border-dashed"
                } `}
              >
                {imgUrl ? (
                  <img className="rounded mt-4" width="350" src={imgUrl} />
                ) : (
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-16 h-16 text-[#404D3A]"
                  />
                )}
              </div>
            </label>
          </div>
          <div className=" mt-4 items-center">
            <label className=" text-2xl label">NFT Name</label>
            <div className="">
              <input
                className="pl-1 rounded bg-inherit border-2 border-[#404D3A]"
                type="text"
                onChange={(e) =>
                  updateFormInput({ ...formInput, name: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-12 text-2xl">
            <label className="">Description</label>
            <div className="">
              <input
                className="pl-1 rounded bg-inherit border-2 border-[#404D3A]"
                onChange={(e) =>
                  updateFormInput({
                    ...formInput,
                    description: e.target.value,
                  })
                }
              ></input>
            </div>
          </div>
          <div className="mt-12 text-2xl">
            <label className="pt-1">Collection</label>
            <div className="w-full mt-5">
              {!!collectionList.length && (
                <div>
                  <div className="select rounded">
                    <select
                      className="bg-white w-3/12 p-2 border-[#404D3A] border-2 rounded"
                      onChange={(e) => {
                        picklistChange(e);
                      }}
                    >
                      {collectionList.map((collection, i) => (
                        <option key={i} className="rounded">
                          {collection.get("name")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <br />
                  <div className="field is-grouped">
                    <div className="control">
                      <button
                        className="mt-4 bg-[#404D3A] text-[#E8C39C] rounded-lg p-2 px-6  hover:drop-shadow"
                        onClick={executeMint}
                      >
                        Mint
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Processing isOpen={processing} />

      {isSuccess && <ToastSucess isOpen={true} toggle={setIsSuccess} />}
      {isError && <ToastError isOpen={true} toggle={setisError} />}
    </div>
  );
};

export default Mint;
