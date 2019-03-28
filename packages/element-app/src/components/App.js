import React, { Component } from "react";

import Storage from "./Storage";
import Ledger from "./Ledger";
import Sidetree from "./Sidetree";

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
