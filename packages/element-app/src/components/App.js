import React, { Component } from "react";

import Storage from "./Storage";
import Ledger from "./Ledger";
import Sidetree from "./Sidetree";


// WIP for testing CRUD.
// import Wallet from "./Wallet";

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <Wallet /> */}
        <Sidetree />
        <Ledger />
        <Storage />
      </div>
    );
  }
}

export default App;
