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

import ScanQRCodeDialog from './ScanQRCodeDialog';

const styles = {
  card: {
    // maxWidth: 345,
  },
  media: {
    height: 140,
    backgroundSize: 'contain',
  },
};

class ImportWalletQRCodeCard extends React.Component {
  state = {
    dialogIsOpen: false,
  };

  render() {
    const { classes } = this.props;
    const { dialogIsOpen } = this.state;
    return (
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image="/mgmt/png/office-material-2.png"
            title="Import QR Code"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Import Wallet QR Code
            </Typography>
            <Typography component="p">
              If you have an encrypted wallet QR Code already, you can import it using this card.
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
            Import Encrypted QR Code Wallet
          </Button>
        </CardActions>
        <ScanQRCodeDialog
          open={dialogIsOpen}
          onClose={() => {
            this.setState({
              dialogIsOpen: false,
            });
          }}
          onScan={(data) => {
            this.props.importCipherTextWallet(data);
          }}
        />
      </Card>
    );
  }
}

ImportWalletQRCodeCard.propTypes = {
  classes: PropTypes.object.isRequired,
  importCipherTextWallet: PropTypes.func.isRequired,
};

export default withStyles(styles)(ImportWalletQRCodeCard);
