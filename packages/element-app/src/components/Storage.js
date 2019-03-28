import React, { Component } from "react";

import element from "@transmute/element-lib";

import config from "../config";


const storage = element.storage.ipfs.configure({
  multiaddr: config.ELEMENT_IPFS_MULTIADDR
});

class Storage extends Component {
  state = {};
  async componentWillMount() {
    const info = await storage.ipfs.id();
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
