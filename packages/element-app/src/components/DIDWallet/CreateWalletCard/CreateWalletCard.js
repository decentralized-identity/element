import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import CreateWalletDialog from './CreateWalletDialog';

const styles = {
  card: {
    // maxWidth: 345,
  },
  media: {
    height: 140,
    backgroundSize: 'contain',
  },
};

class CreateWalletCard extends React.Component {
  state = {
    dialogIsOpen: false,
  };

  render() {
    const { classes, getEdvDidDocumentModel } = this.props;
    const { dialogIsOpen } = this.state;
    return (
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image="/mgmt/png/rectangular.png"
            title="Create Wallet"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Create a DID Wallet
            </Typography>
            <Typography component="p">
              A wallet is used to store <i>some</i> of the private keys
              associated with public keys listed in a DID Document. Its not
              advisable to store all keys (especially recovery keys), in the
              same wallet.
            </Typography>
            <br />
            <Typography component="p">
              You can print out the QR Code that is visible when your wallet has
              been locked, and use it to import your wallet later, be sure to
              remember your wallet password!
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              this.setState({
                dialogIsOpen: true,
              });
            }}
          >
            Create New Wallet
          </Button>
        </CardActions>
        <CreateWalletDialog
          open={dialogIsOpen}
          getEdvDidDocumentModel={getEdvDidDocumentModel}
          onClose={() => {
            this.setState({
              dialogIsOpen: false,
            });
          }}
        />
      </Card>
    );
  }
}

CreateWalletCard.propTypes = {
  classes: PropTypes.object.isRequired,
  getEdvDidDocumentModel: PropTypes.func.isRequired,
};

export default withStyles(styles)(CreateWalletCard);
