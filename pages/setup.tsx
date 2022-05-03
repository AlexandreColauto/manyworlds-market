import React, { useState } from "react";
import useDeployMaket from "../src/hooks/useDeployMaket";

function Setup() {
  // Setup page, only used when deploing the app for the first time
  const [address, setAddress] = useState("");
  const [create] = useDeployMaket();

  const handleClick = async () => {
    //deploy the market and display the address to the user
    const _address = await create();
    setAddress(_address);
  };

  return (
    <div className="flex justify-center my-24">
      <div className="text-xl font-bold text-white">
        <p>
          In order to make the deploy of the website you need to go through some
          steps,
        </p>
        <br />
        <p>first deploy the market and grab the address:</p>
        <button onClick={handleClick} className="border p-2 my-4">
          Deploy the market
        </button>
        <div>Address: {address}</div>
        <br />
        <br />
        <p>
          Then edit the .env.local.example file with the propper information{" "}
        </p>
        <p> Contract address and credentials from the services:</p>
        <br />
        <p>Get Server URL and APP ID from moralis:</p>
        <p>
          <a target="_blank" className=" border-b" href="https://moralis.io/">
            Moralis
          </a>
        </p>
        <p>And Get Key Id and Secret Acess key from AWS:</p>
        <p>
          <a
            target="_blank"
            className=" border-b"
            href="https://objectivefs.com/howto/how-to-get-amazon-s3-keys"
          >
            Amazon keys
          </a>
        </p>
        <p>and rename the file to just .env.local </p>
        <br />
        <p>This will set your environment variables.</p>
        <p>If all the information was set correctly, the webiste is ready!</p>

        <p>
          You migh have to configure the policies of your s3 bucket to allow
          external sites to write into the database.
        </p>
      </div>
    </div>
  );
}

export default Setup;
