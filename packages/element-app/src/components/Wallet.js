import React, { Component } from "react";
import QrReader from "react-qr-reader";

class Wallet extends Component {
  state = {};

  handleScan = data => {
    if (data) {

      this.setState({
        result: data
      });
    }
  };
  
  handleError = err => {
    console.error(err);
  };

  render() {
    return (
      <div className="Wallet">
        <h3>Wallet</h3>
        <QrReader
          delay={300}
          onError={this.handleError}
          onScan={this.handleScan}
          style={{ width: "100%" }}
        />
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

export default Wallet;
