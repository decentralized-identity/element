import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AceEditor from 'react-ace';
import { DIDResolver } from '../index';
import OperationDialog from './OperationDialog';

const SWAGGER_UI = process.env.REACT_APP_SWAGGER_URL;

class ElementFullNode extends Component {
  state = {
    isDialogOpen: false,
  };

  componentWillMount() {
    this.props.getNodeInfo();
  }

  render() {
    const { wallet } = this.props;
    const { isDialogOpen } = this.state;
    return (
      <div className="ElementFullNode" style={{ padding: '16px' }}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant={'h4'}>Sidetree Ethereum via Cloud Functions</Typography>
            <br />
            <Typography variant={'body1'}>Uses Swagger, JSON Schema and Infura.</Typography>
            <br />
            <Button variant={'contained'} size={'small'} href={SWAGGER_UI}>
              Docs
            </Button>{' '}
            <Button
              color="primary"
              variant={'contained'}
              size={'small'}
              onClick={() => {
                this.setState({
                  isDialogOpen: true,
                });
              }}
            >
              New Operation
            </Button>
            <OperationDialog
              open={isDialogOpen}
              wallet={wallet}
              signAndSubmit={this.props.signAndSubmit}
              onClose={() => {
                this.setState({
                  isDialogOpen: false,
                });
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <DIDResolver resolveDID={this.props.resolveDID} did={this.props.fullNode} />
          </Grid>

          {this.props.fullNode.nodeInfo && (
            <Grid item xs={12}>
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Node Info</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <AceEditor
                    mode="json"
                    theme="github"
                    style={{ width: '100%' }}
                    name="jsonEditor"
                    value={JSON.stringify(this.props.fullNode.nodeInfo, null, 2)}
                    editorProps={{ $blockScrolling: true }}
                  />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
          )}
        </Grid>
      </div>
    );
  }
}

ElementFullNode.propTypes = {
  wallet: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  getNodeInfo: PropTypes.func.isRequired,
  signAndSubmit: PropTypes.func.isRequired,
  fullNode: PropTypes.object.isRequired,
};

export default ElementFullNode;
