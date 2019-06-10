import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Button } from '@material-ui/core';

import PouchDB from 'pouchdb';

const db = new PouchDB('element-pouchdb');

export class PouchDBTest extends Component {
  state = {};

  render() {
    return (
      <Paper className="PouchDBTest" style={{ padding: '8px', wordBreak: 'break-all' }}>
        <Button
          onClick={async () => {
            const todo = {
              _id: new Date().toISOString(),
              title: 'hello',
              completed: false,
            };
            const record = await db.put(todo);

            console.log(record);
          }}
        >
          Yolo
        </Button>
      </Paper>
    );
  }
}

PouchDBTest.propTypes = {
  yolo: PropTypes.any,
};

export default PouchDBTest;
