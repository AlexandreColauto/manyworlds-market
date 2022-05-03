import { useMoralis } from "react-moralis";
import { putObject } from "../../lib/s3";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import axios from "axios";

type uploadFile = (e: File) => Promise<string>;
interface props {
  name: string;
  description?: string;
  imgUrl?: string | null;
  callback: () => void;
  address: string;
  collectionName: string;
}
type create = (props: props) => Promise<boolean | undefined>;
function useCreateCollection(): [uploadFile, create] {
  const { isAuthenticated, Moralis, authenticate } = useMoralis();

  const mint: create = async (props) => {
    const ethers = Moralis.web3Library;

    const { name, description, imgUrl, callback, address, collectionName } =
      props;
    if (!name || !imgUrl) {
      alert("Fill the required Information before minting.");
      return false;
    }
    if (!isAuthenticated) authenticate();
    //call the current id and the fee from the collection smart contract
    const currentId = {
      contractAddress: address,
      functionName: "currentId",
      abi: NFT.abi,
    };
    const [_tokenId, _fee] = (await Moralis.executeFunction(currentId)) as any;

    let tokenId = parseInt(_tokenId.toString(), 10) + 1;
    let fee = parseInt(_fee.toString(), 10);

    const mint = {
      contractAddress: address,
      functionName: "mint",
      abi: NFT.abi,
      params: {
        receiver: Moralis.account,
      },
    };
    try {
      //then call the mint function on the smart cotnract
      const tokenHash: any = await Moralis.executeFunction(mint);

      if (tokenHash) {
        const contentType = "application/json"; // type of file
        //create the metada json to store on the s3 bucket.
        const data = JSON.stringify({ name, description, image: imgUrl, fee });
        //pad the start of id with 0 to conform with the standard
        const tokenIdString = tokenId.toString().padStart(64, "0");
        // setup params for putObject
        const key = collectionName + "/" + tokenIdString + ".json";
        const body = data;
        const payload = {
          key,
          body,
          contentType,
        };
        //call the internal api to store the file on the bucket
        const resp = await axios.post("/api/upload", payload);
      }
      //wait for the transaction to complete and call teh success callback
      await tokenHash.wait();
      callback();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  //aux function to save the nft metadata at ipfs
  const saveFile: uploadFile = async (e) => {
    console.log("uploading file");
    const data = e;
    //use moralis as rpc to ipfs.
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    return file._url;
  };

  return [saveFile, mint];
}
export default useCreateCollection;
