import React, { Component } from "react";

import element from "@transmute/element-lib";

import config from "../config";

class Sidetree extends Component {
  state = {};
  async componentWillMount() {
    let anchorContractAddress = localStorage.getItem("anchorContractAddress");
    const blockchain = element.blockchain.ethereum.configure({
      anchorContractAddress: anchorContractAddress
    });

    await blockchain.resolving;

    this.setState({
      contract: blockchain.anchorContractAddress
    });

    localStorage.setItem(
      "anchorContractAddress",
      blockchain.anchorContractAddress
    );

    const storage = element.storage.ipfs.configure({
      multiaddr: config.ELEMENT_IPFS_MULTIADDR
    });

    this.blockchain = blockchain;
    this.storage = storage;

    const model = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage: this.storage,
      blockchain: this.blockchain
    });
    this.setState({
      model
    });
  }

  newCreateOp = async () => {
    const keypair = await element.func.createKeys();
    const operation = await element.func.payloadToOperation({
      type: "create",
      kid: "#key1",
      payload: {
        "@context": "https://w3id.org/did/v1",
        publicKey: [
          {
            id: "#key1",
            type: "Secp256k1VerificationKey2018",
            publicKeyHex: keypair.publicKey
          }
        ]
      },
      privateKey: keypair.privateKey
    });

    this.setState({
      operations: [operation, ...(this.state.operations || [])]
    });
  };

  anchorOperations = async () => {
    const tx = await element.func.operationsToTransaction({
      operations: this.state.operations,
      storage: this.storage,
      blockchain: this.blockchain
    });
    this.setState({
      lastTx: tx,
      operations: []
    });
    element.func
      .syncFromBlockNumber({
        transactionTime: 0,
        initialState: {},
        reducer: element.reducer,
        storage: this.storage,
        blockchain: this.blockchain
      })
      .then(model => {
        this.setState({
          model
        });
      });
  };

  render() {
    return (
      <div className="Sidetree">
        <h3>Sidetree</h3>
        <h5>
          On first load with metamask, you be asked to deploy a contract that
          will be used for the rest of the demo. You will need to clear local
          storage if you restart ganache.
        </h5>
        <pre>
          {JSON.stringify(
            {
              ...this.state
            },
            null,
            2
          )}
        </pre>
        <button onClick={this.newCreateOp}>create</button>
        <button onClick={this.anchorOperations}>anchor</button>
      </div>
    );
  }
}

export default Sidetree;
