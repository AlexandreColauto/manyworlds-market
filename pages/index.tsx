import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="bg-gradient-to-l pt-3 pb-5 pl-4 from-zinc-900 to-[#404D3A]">
      <div className="flex p-10 justify-between h-10/12 items-center leading-loose ">
        <div>
          <p className="text-8xl mt-3 font-bold text-[#F2F2F2]">
            Collect, Sell <br />
            or Create <span className="text-[#E8C39C]">NFTs</span>
          </p>
          <p className="text-[#F2F2F2] mt-10 ml-1 font-thin text-lg">
            Create your own NFTs and
            <br />
            put it up to sale directly in to the marketplace.
            <br />
          </p>
          <div className="mt-10 ml-1">
            <Link href="/explore">
              <button className="bg-[#E8C39C] text-[#404D3A] py-2 px-8 font-bold text-basic rounded-2xl hover:bg-[#F2F2F2]">
                Explore Collections
              </button>
            </Link>
            <button className="text-[#F2F2F2] border-2 border-[#F2F2F2] ml-9 py-2 px-7 text-basic font-bold rounded-2xl hover:text-[#404D3A] hover:bg-[#F2F2F2] ">
              Why this matters
            </button>
          </div>
        </div>
        <div className="mt-3">
          <Image src="/logo.png" alt="logo" width="650" height="490" />
        </div>
      </div>
    </div>
  );
};
export default Home;
