import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ListIcon from '@material-ui/icons/List';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {
  Home,
  Code,
  Star,
  VpnKey,
  Fingerprint,
  Search,
  // Lock,
  BarChart,
  DeveloperBoard,
  // CloudQueueOutlined,
  Web,
  // List,
} from '@material-ui/icons';

import MenuSection from './MenuSection';

class DrawerContent extends React.Component {
  state = {
    isDAppMenuOpen: false,
  };

  render() {
    const { classes } = this.props;
    const { isDAppMenuOpen } = this.state;
    return (
      <div>
        <div className={classes.toolbar} />
        <Divider />
        <MenuSection
          items={[
            {
              label: 'Home',
              icon: <Home />,
              link: '/',
            },
            {
              label: 'DID Wallet',
              icon: <VpnKey />,
              link: '/wallet',
            },
          ]}
        />
        <Divider />

        <MenuSection
          subheader={'Server Node'}
          items={[
            {
              label: 'My DID',
              icon: <Fingerprint />,
              link: '/server/did/profile',
            },
            {
              label: 'DID Resolver',
              icon: <Search />,
              link: '/server/resolver',
            },
            {
              label: 'Explorer',
              icon: <BarChart />,
              link: '/explorer',
            },
            {
              label: 'DID List',
              icon: <ListIcon />,
              link: '/server/did/all',
            },
            {
              label: 'Node Info',
              icon: <DeveloperBoard />,
              link: '/server/info',
            },
          ]}
        />
        <Divider />

        <ListItem
          button
          onClick={() => {
            this.setState({
              isDAppMenuOpen: !isDAppMenuOpen,
            });
          }}
        >
          <ListItemIcon>
            <Web />
          </ListItemIcon>
          <ListItemText primary="Browser Node" />
          {isDAppMenuOpen ? (
            <ExpandLess style={{ color: 'white' }} />
          ) : (
            <ExpandMore style={{ color: 'white' }} />
          )}
        </ListItem>
        <Collapse in={isDAppMenuOpen} timeout="auto" unmountOnExit>
          <MenuSection
            items={[
              {
                label: 'My DID',
                icon: <Fingerprint />,
                link: '/dapp/did/profile',
              },
              {
                label: 'DID Resolver',
                icon: <Search />,
                link: '/dapp/resolver',
              },
              {
                label: 'Explorer',
                icon: <BarChart />,
                link: '/dapp/explore',
              },
              {
                label: 'DID List',
                icon: <ListIcon />,
                link: '/dapp/did/all',
              },
              {
                label: 'Node Info',
                icon: <DeveloperBoard />,
                link: '/dapp/info',
              },
            ]}
          />
        </Collapse>

        <Divider />

        <MenuSection
          items={[
            {
              label: 'Source',
              icon: <Code />,
              link: 'https://github.com/decentralized-identity/element',
            },
            {
              label: 'Credits',
              icon: <Star />,
              link: '/credits',
            },
          ]}
        />
      </div>
    );
  }
}

DrawerContent.propTypes = {
  classes: PropTypes.any.isRequired,
};

export default DrawerContent;
