import React from "react";
import ReactDOM from "react-dom";

import * as ElementCore from "@transmute/element-core";

class App extends React.Component {
  state = {
    mnemonic: ""
  };
  async componentWillMount() {
    const mnemonic = await ElementCore.MnemonicKeySystem.generateMnemonic();
    this.setState({
      mnemonic
    });
  }
  render() {
    return (
      <div>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
