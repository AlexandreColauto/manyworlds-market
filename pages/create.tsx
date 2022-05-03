import React, { useEffect, useState } from "react";
import Toggle from "../src/components/Toggle";
import CreateCollection from "./createcollection";
import Mint from "./mint";
import { useMoralis } from "react-moralis";

function Create() {
  const [collection, setColection] = useState(false);
  const { chainId } = useMoralis();

  return (
    <div className="w-full mt-6 pb-24">
      {chainId == process.env.NEXT_PUBLIC_CHAIN_ID ? (
        <>
          <div className="justify-items-center items-center flex flex-col pt-5">
            <p className="text-6xl font-bold text-[#E8C39C]">Create a New</p>
            <p className="text-6xl font-bold text-[#E8C39C]">
              Collection or Item
            </p>
          </div>
          <div className=" justify-center flex mt-16">
            <Toggle callback={setColection} />
          </div>
          <div className="hidden "></div>
          {!collection ? <CreateCollection /> : <Mint />}
        </>
      ) : (
        <div className="text-white text-xl font-bold text-center">
          <p>
            YOU&apos;RE ON THE WRONG CHAIN, PLEASE CHANGE TO BSC MAIN NET chain
          </p>
          <p>Your chain: {chainId}</p>
          Required chain : {process.env.NEXT_PUBLIC_CHAIN_ID}
        </div>
      )}
    </div>
  );
}

export default Create;
