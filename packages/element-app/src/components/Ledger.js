import React, { Component } from "react";

import config from "../config";

import Web3 from "web3";

import element from '@transmute/element-lib';

const getDefaultWeb3 = () => {
  return new Web3(Web3.providers.HttpProvider(config.ELEMENT_PROVIDER));
};

// const fundWallets = async (
//  web3
// }

let defaultWeb3;
let defaultAccounts;

class Ledger extends Component {
  state = {};
  async componentWillMount() {
    if (window.location.hostname === "localhost") {
      defaultWeb3 = getDefaultWeb3();
      defaultAccounts = await defaultWeb3.eth.getAccounts();
      // console.log(defaultAccounts);
      this.setState({
        ...this.state,
        defaultAccounts
      });
    }
    if (!window.web3) {
      alert("MetaMask is required to use this demo.");
    }
    window.web3.eth.getAccounts((err, accounts) => {
      if (!accounts.length) {
        alert("MetaMask is required to use this demo.");
        return;
      }
      // console.log(err, accounts);

      element.ledger.setDefaultSigningAddress(accounts[0]);
      this.setState({
        accounts
      });

      window.web3.eth.getBalance(accounts[0], async (err, balance) => {
        let bal = balance.toNumber();
        if (window.location.hostname === "localhost" && bal === 0) {
          let tx = await defaultWeb3.eth.sendTransaction({
            from: defaultAccounts[0],
            to: accounts[0],
            value: 1 * 10
          });
          console.log("funded: ", tx);
        }
        this.setState({
          ...this.state,
          balance: bal
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
