import React, { Component } from "react";

import element from "@transmute/element-lib";

class Sidetree extends Component {
  state = {};
  async componentWillMount() {
    this.setState({
      contract: element.ledger.getContractAddress()
    });
    const model = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage: element.storage,
      ledger: element.ledger
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
      storage: element.storage,
      ledger: element.ledger
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
        storage: element.storage,
        ledger: element.ledger
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
