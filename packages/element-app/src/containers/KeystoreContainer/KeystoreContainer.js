import React from 'react';
// import PropTypes from "prop-types";

import Loading from '../../components/Loading/Loading';
import Snackbar from '../../components/Snackbar/Snackbar';
import WebKeystore from '../../components/WebKeystore/WebKeystore';

class KeystoreContainer extends React.Component {
  state = {
    isSetup: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        isSetup: true,
      });
    }, 1 * 1000);
  }

  render() {
    if (!this.state.isSetup) {
      return <Loading message="Preparing Keystore..." />;
    }
    return (
      <div>
        <Snackbar {...this.props} />
        <WebKeystore {...this.props} />
      </div>
    );
  }
}

export { KeystoreContainer };
export default KeystoreContainer;
