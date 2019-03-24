import React, { Component } from "react";

import Storage from "./Storage";
import Ledger from "./Ledger";
import Sidetree from "./Sidetree";

import element from "@transmute/element-lib";

import config from "../config";

const { ELEMENT_CONTRACT_ADDRESS, ELEMENT_IPFS_MULTIADDR } = config;

element.ledger.setContractAddress(ELEMENT_CONTRACT_ADDRESS);
element.storage.setMultiAddr(ELEMENT_IPFS_MULTIADDR);

class App extends Component {
  render() {
    return (
      <div className="App">
        <Sidetree />
        <Ledger />
        <Storage />
      </div>
    );
  }
}

export default App;
