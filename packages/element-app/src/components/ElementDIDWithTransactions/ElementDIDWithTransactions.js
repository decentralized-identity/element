import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { DIDDocument } from '../DIDDocument';
import { SidetreeTransaction } from '../SidetreeTransaction';

export class ElementDIDWithTransactions extends Component {
  render() {
    const { record, onCopyToClipboard } = this.props;
    return (
      <React.Fragment>
        <DIDDocument didDocument={record.doc} onCopyToClipboard={onCopyToClipboard} />
        <ExpansionPanel style={{ width: '100%' }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Sidetree Transactions</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
            {record.txns.map(txn => (
              <SidetreeTransaction
                key={txn.transactionNumber}
                txn={txn}
                blockchain={'Ethereum'}
                network={'ropsten'}
              />
            ))}
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <br />
      </React.Fragment>
    );
  }
}

ElementDIDWithTransactions.propTypes = {
  record: PropTypes.object.isRequired,
  onCopyToClipboard: PropTypes.func,
};

export default ElementDIDWithTransactions;
