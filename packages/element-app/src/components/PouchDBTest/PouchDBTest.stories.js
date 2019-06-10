import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { PouchDBTest } from './PouchDBTest';

storiesOf('PouchDB', module).add('Test', () => <PouchDBTest />);
