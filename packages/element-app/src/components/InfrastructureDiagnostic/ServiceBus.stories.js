import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import PropTypes from 'prop-types';
import { Paper, Button } from '@material-ui/core';
import nanobus from 'nanobus';

const serviceBus = nanobus();

export class ServiceBusSummary extends Component {
  state = {};

  componentWillMount() {
    serviceBus.on('element:sidetree:transaction', ({ transaction }) => {
      action('event received: ')(transaction);
    });
  }

  render() {
    return (
      <Paper className="ServiceBusSummary" style={{ padding: '8px', wordBreak: 'break-all' }}>
        <Button
          onClick={async () => {
            serviceBus.emit('element:sidetree:transaction', {
              transaction: {
                test: 123,
              },
            });
          }}
        >
          Emit Event
        </Button>
      </Paper>
    );
  }
}

ServiceBusSummary.propTypes = {
  yolo: PropTypes.any,
};

export default ServiceBusSummary;

storiesOf('Infrastructure', module).add('Service Bus', () => <ServiceBusSummary />);
