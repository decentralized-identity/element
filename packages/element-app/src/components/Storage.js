import React, { Component } from "react";

import ipfsClient from "ipfs-http-client";

import config from "../config";

const ipfs = ipfsClient(config.ELEMENT_IPFS_MULTIADDR);

class Storage extends Component {
  state = {};
  async componentWillMount() {
    const info = await ipfs.id();
    this.setState({
      info
    });
  }
  render() {
    const { info } = this.state;
    return (
      <div className="Storage">
        <h3>Storage</h3>
        <pre>
          {JSON.stringify(
            {
              ...info
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }
}

export default Storage;
