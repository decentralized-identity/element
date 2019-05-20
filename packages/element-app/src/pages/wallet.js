import React, { Component } from 'react';

import { DIDWallet, Pages } from '../components/index';

export class Wallet extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <DIDWallet />
      </Pages.WithNavigation>
    );
  }
}

export default Wallet;
