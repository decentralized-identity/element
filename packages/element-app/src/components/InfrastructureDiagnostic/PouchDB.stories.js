import React, { Component } from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import PropTypes from 'prop-types';
import { Paper, Button } from '@material-ui/core';

import PouchDB from 'pouchdb';

const db = new PouchDB('element-pouchdb');

export class PouchDBSummary extends Component {
  state = {};

  render() {
    return (
      <Paper className="PouchDBSummary" style={{ padding: '8px', wordBreak: 'break-all' }}>
        <Button
          onClick={async () => {
            const todo = {
              _id: new Date().toISOString(),
              title: 'hello',
              completed: false,
            };
            const record = await db.put(todo);

            action('data base record: ')(record);
          }}
        >
          Save Database Record
        </Button>
      </Paper>
    );
  }
}

PouchDBSummary.propTypes = {
  yolo: PropTypes.any,
};

export default PouchDBSummary;

storiesOf('Infrastructure', module).add('PouchDB', () => <PouchDBSummary />);
