import React, { Component } from 'react';

import { ElementLightNode, Pages } from '../../index';

class LightNode extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <ElementLightNode />
      </Pages.WithNavigation>
    );
  }
}

export default LightNode;
