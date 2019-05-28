import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import {
  grey,
  deepPurple,
  green,
  red,
  indigo,
  purple,
  // amber,
  // blue,
  // yellow,
  // blueGrey,
} from '@material-ui/core/colors';

import { AutoRotatingCarousel, Slide } from 'material-auto-rotating-carousel';

import { Button, Typography } from '@material-ui/core';

import { Pages } from '../components/index';

class Landing extends Component {
  state = {
    mobile: false,
    isCarouselOpen: !localStorage.getItem('hasClosedTour'),
  };

  componentWillMount() {
    const setMobile = () => {
      this.setState({
        mobile: window.innerWidth < 640,
      });
    };
    /*eslint-disable */
    (function() {
      const throttle = function(type, name, obj) {
        obj = obj || window;
        let running = false;
        const func = function() {
          if (running) {
            return;
          }
          running = true;
          requestAnimationFrame(() => {
            obj.dispatchEvent(new CustomEvent(name));
            running = false;
          });
        };
        obj.addEventListener(type, func);
      };
      throttle('resize', 'optimizedResize');
    })();

    // handle event
    window.addEventListener('optimizedResize', () => {
      setMobile();
    });
    setMobile();
    /* eslint-enable */
  }

  handleCloseTour = () => {
    this.setState({
      isCarouselOpen: false,
    });
    localStorage.setItem('hasClosedTour', true);
  };

  handleStartTour = () => {
    this.setState({
      isCarouselOpen: true,
    });
  };

  render() {
    const { mobile, isCarouselOpen } = this.state;
    return (
      <Pages.WithNavigation>
        <Typography variant="h2">Welcome to Element</Typography>
        <br />
        <Typography variant="body1">
          {`Decentralized Identifiers (DIDs) are a new type of identifier for verifiable,
          "self-sovereign" digital identity. DIDs are fully under the control of the DID subject,
          independent from any centralized registry, identity provider, or certificate authority.
          DIDs are URLs that relate a DID subject to means for trustable interactions with that
          subject. DIDs resolve to DID Documents — simple documents that describe how to use that
          specific DID. Each DID Document contains at least three things: cryptographic material,
          authentication suites, and service endpoints. Cryptographic material combined with
          authentication suites provide a set of mechanisms to authenticate as the DID subject
          (e.g., public keys, pseudonymous biometric protocols, etc.). Service endpoints enable
          trusted interactions with the DID subject.`}
        </Typography>
        <br />
        <div>
          <Button
            variant="contained"
            onClick={() => {
              window.open('https://github.com/decentralized-identity/element');
            }}
          >
            Read More on Github.com
          </Button>{' '}
          <Button variant="contained" color={'primary'} onClick={this.handleStartTour}>
            Start Tour
          </Button>
        </div>

        <br />
        <br />

        <Typography variant="h4">Getting Started</Typography>
        <br />
        <Typography variant="body1">
          {`Remember, this is a demo, and element is under active development. 
          In order to control a DID you must control private keys associated with it. 
          For testing and development purposes, we created a browser wallet system, 
          which you can use to create and manage your DID.`}
        </Typography>
        <br />

        <Button
          variant="contained"
          color={'secondary'}
          onClick={() => {
            this.props.history.push('/wallet');
          }}
        >
          Create Wallet
        </Button>

        <AutoRotatingCarousel
          label="Get started"
          interval={6 * 1000}
          open={isCarouselOpen}
          mobile={mobile}
          ButtonProps={{
            onClick: this.handleCloseTour,
          }}
          onClose={this.handleCloseTour}
        >
          <Slide
            media={<img src="/cys/png/011-data.png" alt="data" />}
            mediaBackgroundStyle={{ backgroundColor: purple[400], padding: '32px' }}
            style={{ backgroundColor: purple[600] }}
            title="Open Source Library"
            subtitle="Modular JavaScript library for working with Decentralized Identities and Verifiable Credentials."
          />
          <Slide
            media={<img src="/cys/png/039-id.png" alt="id" />}
            mediaBackgroundStyle={{ backgroundColor: deepPurple[400], padding: '32px' }}
            style={{ backgroundColor: deepPurple[600] }}
            title="Progressive Web App"
            subtitle="Modern, extensible and friendly interface for reviewing identities, credentials and attestations."
          />
          <Slide
            media={<img src="/cys/png/036-server.png" alt="server" />}
            mediaBackgroundStyle={{ backgroundColor: indigo[400], padding: '32px' }}
            style={{ backgroundColor: indigo[600] }}
            title="Serverless Backend"
            subtitle="Cloud Function powerd REST API built with Swagger and JSON Schema."
          />

          <Slide
            media={<img src="/mgmt/png/ancient.png" alt="ancient" />}
            mediaBackgroundStyle={{ backgroundColor: deepPurple[400] }}
            style={{ backgroundColor: deepPurple[600] }}
            title="Standards Compliant"
            subtitle="Leverages the DID Spec, Sidetree Protocol, Linked Data Signatures and more."
          />

          <Slide
            media={<img src="/mgmt/png/chatting.png" alt="chatting" />}
            mediaBackgroundStyle={{ backgroundColor: red[400], padding: '32px' }}
            style={{ backgroundColor: red[600] }}
            title="Research & Development"
            subtitle="Perfect for collaborating and testing new signature suites or credential flows."
          />

          <Slide
            media={<img src="/cys/png/031-network.png" alt="network" />}
            mediaBackgroundStyle={{ backgroundColor: deepPurple[400], padding: '32px' }}
            style={{ backgroundColor: deepPurple[600] }}
            title="Authenticated Encryption"
            subtitle="Leverage DID Documents for private communication over insecure channels."
          />

          <Slide
            media={<img src="/mgmt/png/agreement.png" alt="agreement" />}
            mediaBackgroundStyle={{ backgroundColor: green[400], padding: '32px' }}
            style={{ backgroundColor: green[600] }}
            title="Verifiable Credentials"
            subtitle="Decentralized Identity powerd verifiable credentials built with JSON-LD and modular signature suites."
          />
          <Slide
            media={<img src="/cys/png/050-alarm.png" alt="alarm" />}
            mediaBackgroundStyle={{ backgroundColor: grey[700], padding: '32px' }}
            style={{ backgroundColor: grey[800] }}
            title="Under Construction!"
            subtitle="Element is experimental, be careful and have fun!"
          />
        </AutoRotatingCarousel>
      </Pages.WithNavigation>
    );
  }
}


Landing.propTypes = {
  history: PropTypes.any.isRequired,
};

const ConnectedPage = withRouter(Landing);
export { ConnectedPage as Landing };
export default ConnectedPage;
