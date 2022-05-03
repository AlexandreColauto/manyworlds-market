import { NextPage } from "next/types";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
const Layout: NextPage = (props) => {
  return (
    <div>
      <Header />
      <div className="bg-gradient-to-l pt-3 pb-5 pl-4 from-zinc-900 to-[#404D3A]">{props.children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
