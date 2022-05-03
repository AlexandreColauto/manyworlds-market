import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faFacebook,
  faTwitter,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <div className="mb-0">
      <div className="h-50 bg-[#1B1C17] align-center flex justify-center flex-col border-t-2 border-[#E8C39C]">
        <div className="p-5">
          <ul>
            <div className="flex align-middle pt-3 text-[#F2F2F2] justify-around">
              <div id="menu" className="align-middle">
                <li>
                  <Link href="/create">
                    <p className="text-[#F2F2F2] cursor-pointer hover:drop-shadow hover:scale-105">
                      Collection #1
                    </p>
                  </Link>
                </li>
                <li>
                  <Link href="/create">
                    <p className="text-[#F2F2F2] cursor-pointer hover:drop-shadow hover:scale-105">
                      Collection #2
                    </p>
                  </Link>
                </li>
                <li>
                  <Link href="/create">
                    <p className="text-[#F2F2F2] cursor-pointer hover:drop-shadow hover:scale-105">
                      Collection #3
                    </p>
                  </Link>
                </li>
                <li>
                  <Link href="/explore">
                    <p className="text-[#F2F2F2] cursor-pointer hover:drop-shadow hover:scale-105">
                      All
                    </p>
                  </Link>
                </li>
              </div>
              <li>
                <div className="float-root mt-6">
                  <div className="float-left">
                    <Image src="/logo.png" alt="logo" width="30" height="30" />
                  </div>
                  <p className="text-[#F2F2F2] ml-2 text-xl font-bold float-right">
                    NFT Marketplace{" "}
                  </p>
                </div>
              </li>
              <li>
                <div className="flex text-[#F2F2F2] mt-6 align-middle justify-between w-200">
                  <Link href="/">
                    <FontAwesomeIcon
                      icon={faYoutube}
                      className="mx-2 cursor-pointer hover:drop-shadow hover:scale-105"
                    />
                  </Link>
                  <Link href="/">
                    <FontAwesomeIcon
                      icon={faFacebook}
                      className="mx-2 cursor-pointer hover:drop-shadow hover:scale-105"
                    />
                  </Link>
                  <Link href="/">
                    <FontAwesomeIcon
                      icon={faTwitter}
                      className="mx-2 cursor-pointer hover:drop-shadow hover:scale-105"
                    />
                  </Link>
                  <Link href="/">
                    <FontAwesomeIcon
                      icon={faLinkedin}
                      className="mx-2 cursor-pointer hover:drop-shadow hover:scale-105"
                    />
                  </Link>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Footer;
