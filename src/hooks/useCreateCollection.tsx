import { useMoralis } from "react-moralis";
import axios from "axios";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";

type uploadFile = (e: File) => Promise<string>;
interface props {
  name: string;
  // ? after the parameters means that is optional
  description?: string;
  imgUrl?: string | null;
  fee?: string | null;
  callback: () => void;
}
type create = (props: props) => Promise<boolean>;
function useCreateCollection(): [uploadFile, create] {
  const { isAuthenticated, Moralis } = useMoralis();
  const marketAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;

  const create: create = async (props) => {
    const ethers = Moralis.web3Library;

    const { name, description, imgUrl, fee, callback } = props;

    if (!name) {
      alert("Give a name to your collection!");
      return false;
    }
    try {
      const contentType = "application/json"; // type of file
      // setup params for putObject
      //the key will be the name of the folder in s3 bucket from which we will retrieve the metadata,
      const key = name + "/";
      const payload = {
        key,
        contentType,
      };
      //call the api to post this new folder into s3 bucket.
      const resp = await axios.post("/api/upload", payload);
      //get the aws variables to build the correct uri for the collection.
      const response = await axios.get("/api/aws");

      if (response.status !== 200) return false;
      //get the s3bucket name and the region from the api call
      const [s3Bucket, region] = response.data;
      console.log(response.data);
      const web3Provider = await Moralis.enableWeb3();
      const signer = await web3Provider.getSigner();
      const address = await Moralis.account;
      //build the nft uri using the bucket name and region retrieved from the internal api call
      const url =
        "https://" +
        s3Bucket +
        ".s3." +
        region +
        ".amazonaws.com/" +
        name.replace(" ", "+") +
        "/";
      const tokenContract = new ethers.ContractFactory(
        NFT.abi,
        NFT.bytecode,
        signer
      );
      console.log(url);
      //Deploy the nft smart contract using the designed uri (erc1155 uri are setted on collection deployment)
      const nft = await tokenContract.deploy(
        url + "{id}.json",
        marketAddress,
        fee,
        address
      );
      await nft.deployed();
      console.log("nft deployed to:", nft.address);
      // save the collection information into the moralis db so can be retrieved from the front end
      const Collection = Moralis.Object.extend({
        className: "collection",
      });
      const collection = new Collection();
      collection.save({
        name: name,
        collectionAddress: nft.address,
        s3: url,
        owner: address,
        imgUrl: imgUrl,
        description: description,
      });

      callback();
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  };
  //auxiliar function to upload collection logo if wanted (deactivated by default)
  const saveFile: uploadFile = async (e) => {
    const data = e;
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    return file._url;
  };

  return [saveFile, create];
}
export default useCreateCollection;
