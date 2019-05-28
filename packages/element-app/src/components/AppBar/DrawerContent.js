import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@material-ui/core/Divider';

import {
  Home,
  Code,
  Star,
  VpnKey,
  // Fingerprint,
  Search,
  // Lock,
  DeveloperBoard,
  // CloudQueueOutlined,
  List,
} from '@material-ui/icons';

import MenuSection from './MenuSection';

const DrawerContent = ({ classes }) => (
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

    <MenuSection
      subheader={'Browser'}
      items={[
        {
          label: 'My DID',
          icon: <DeveloperBoard />,
          link: '/dapp/did/profile',
        },
        {
          label: 'DID Resolver',
          icon: <Search />,
          link: '/dapp/resolver',
        },
        {
          label: 'DID List',
          icon: <List />,
          link: '/dapp/did/all',
        },
      ]}
    />
    <Divider />

    <MenuSection
      subheader={'Server'}
      items={[
        {
          label: 'My DID',
          icon: <DeveloperBoard />,
          link: '/server/did/profile',
        },
        {
          label: 'DID Resolver',
          icon: <Search />,
          link: '/server/resolver',
        },
        {
          label: 'DID List',
          icon: <List />,
          link: '/server/did/all',
        },
      ]}
    />
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

DrawerContent.propTypes = {
  classes: PropTypes.any.isRequired,
};

export default DrawerContent;
