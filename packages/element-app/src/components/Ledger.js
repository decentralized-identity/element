import React, { Component } from "react";

class Ledger extends Component {
  state = {};
  async componentWillMount() {
    if (!window.web3) {
      alert("MetaMask is required to use this demo.");
    }
    window.web3.eth.getAccounts((err, accounts) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!accounts.length) {
        alert("MetaMask is required to use this demo.");
        return;
      }
      window.web3.eth.getBalance(accounts[0], async (err, balance) => {
        let bal = balance.toNumber();
        console.log("metamask balance: ", accounts[0], bal);
        this.setState({
          ...this.state,
          accounts: {
            [accounts[0]]: bal
          }
        });
      });
    });
  }
  render() {
    return (
      <div className="Ledger">
        <h3>Ledger</h3>
        <pre>
          {JSON.stringify(
            {
              ...this.state
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }
}

export default Ledger;
