import React, { ChangeEvent, useState } from "react";
import Processing from "../src/components/Processing";
import ToastError from "../src/components/ToastError";
import ToastSucess from "../src/components/ToastSucess";
import useCreateCollection from "../src/hooks/useCreateCollection";
import { useMoralis } from "react-moralis";

const CreateCollection = () => {
  //State to save the IPFS url of the image.
  const [imgUrl, setImgUrl] = useState("");
  //state to save the inputs of the user
  const [formInput, updateFormInput] = useState({
    name: "Name",
    description: "",
    fee: "",
  });
  //Moralis authentication hook.
  const { isAuthenticated, authenticate } = useMoralis();
  //Success toast
  const [isSuccess, setisSuccess] = useState(false);
  //Error toast
  const [isError, setisError] = useState(false);
  //Processing modal overlay
  const [processing, setProcessing] = useState(false);
  //useCreateCollection functions = saveFile : function to save files on ipfs
  //                                create : deploy the nft contract. i.e. the NFT collection
  const [saveFile, create] = useCreateCollection();

  //call the custom hook function
  const submitCollection = async () => {
    const { name, description, fee } = formInput;
    //open authentication case the user didnt authenticate yet
    if (!isAuthenticated) authenticate();
    setProcessing(true);
    //call the custom hook with the necessary parameters
    const result = await create({
      name,
      description,
      imgUrl,
      fee,
      //the callback is the function that is executed when the process is finished.
      callback: success,
    });
    if (!result) {
      //if we got a result we close the locking modal.
      setProcessing(false);
      //if we got a error then we open the error toast and close it after 5 seconds.
      if (!isError) {
        setisError(true);
        setTimeout(function () {
          setisError(false);
        }, 5000);
      }
    }
  };
  //the success funcion is the callback that the custom hook will call when the process is finished
  const success = () => {
    //clean the input form.
    setImgUrl("");
    updateFormInput({ name: "", description: "", fee: "" });
    //close the locking modal.
    setProcessing(false);
    //open the success toast and close it after 5 seconds.
    if (!isSuccess) {
      setisSuccess(true);
      setTimeout(function () {
        setisSuccess(false);
      }, 5000);
    }
  };
  return (
    <div>
      <div className="mx-auto mt-10 w-1/2 text-center bg-white rounded-xl">
        <div className="p-8 pl-14">
          <p className="text-5xl font-bold text-[#404D3A] my-6">
            Create New Collection
          </p>
          <label className="mt-12 text-2xl font-normal label">
            Collection Name
          </label>
          <div className="">
            <input
              className="rounded bg-inherit border-2 border-[#404D3A] pl-1"
              type="text"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
          </div>
          <div className="mt-8">
            <label className="text-2xl">Description</label>
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
          <div className="mt-8">
            <label className="text-2xl">Creator Fee (%)</label>
            <div className="">
              <input
                placeholder="2.5"
                className="pl-1 rounded bg-inherit border-2 border-[#404D3A]"
                onChange={(e) =>
                  updateFormInput({
                    ...formInput,
                    fee: Math.round(parseFloat(e.target.value) * 10).toString(),
                  })
                }
              ></input>
            </div>
          </div>
          <button
            className="mt-8 bg-[#404D3A] text-[#E8C39C]  rounded-lg p-2 hover:drop-shadow"
            onClick={submitCollection}
          >
            Create
          </button>
        </div>
      </div>
      <Processing isOpen={processing} />
      {isSuccess && <ToastSucess isOpen={isSuccess} toggle={setisSuccess} />}
      {isError && <ToastError isOpen={isError} toggle={setisError} />}
    </div>
  );
};

export default CreateCollection;
