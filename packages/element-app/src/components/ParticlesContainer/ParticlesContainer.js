import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Particles from 'react-particles-js';

export class ParticlesContainer extends Component {
  render() {
    const params = this.props.params || {
      particles: {
        line_linked: {
          shadow: {
            enable: true,
            color: '#3CA9D1',
            blur: 5,
          },
        },
      },
    };
    return (
      <React.Fragment>
        <div
          style={{
            zIndex: 2,
            position: 'absolute',
          }}
        >
          {this.props.children}
        </div>

        <Particles
          className="Particles"
          style={{
            zIndex: 1,
            top: 0,
            position: 'absolute',
          }}
          params={params}
        />
      </React.Fragment>
    );
  }
}

ParticlesContainer.propTypes = {
  params: PropTypes.object,
  children: PropTypes.any,
};

export default ParticlesContainer;
