import React, { Component } from 'react';

import { ElementFullNode, Pages } from '../../index';

class FullNode extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <ElementFullNode />
      </Pages.WithNavigation>
    );
  }
}

export default FullNode;
