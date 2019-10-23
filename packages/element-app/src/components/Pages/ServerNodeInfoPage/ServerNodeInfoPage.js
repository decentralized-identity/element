import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Button } from '@material-ui/core';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

// eslint-disable-next-line
import 'brace/mode/json';
// eslint-disable-next-line
import 'brace/theme/mono_industrial';

import { Pages } from '../../index';

const SWAGGER_UI = process.env.REACT_APP_SWAGGER_URL;

export class ServerNodeInfoPage extends Component {
  componentWillMount() {
    this.props.getNodeInfo();
  }

  render() {
    const { fullNode } = this.props;

    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Button variant={'contained'} size={'small'} href={SWAGGER_UI}>
              Swagger API Docs
            </Button>
          </Grid>
          {fullNode.nodeInfo && (
            <AceEditor
              mode="json"
              theme="mono_industrial"
              style={{ width: '100%' }}
              name="jsonEditor"
              value={JSON.stringify(this.props.fullNode.nodeInfo, null, 2)}
              editorProps={{ $blockScrolling: true }}
            />
          )}
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

ServerNodeInfoPage.propTypes = {
  fullNode: PropTypes.object.isRequired,
  getNodeInfo: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
};
