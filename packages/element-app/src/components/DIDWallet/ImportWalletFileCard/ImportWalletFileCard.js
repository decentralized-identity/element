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

const styles = {
  card: {
    // maxWidth: 345,
  },
  media: {
    height: 140,
    backgroundSize: 'contain',
  },
};

class ImportWalletFileCard extends React.Component {
  state = {
    dialogIsOpen: false,
  };

  handleFileChange = (event) => {
    Object.keys(event.target.files).map((index) => {
      const file = event.target.files[index];
      const reader = new FileReader();
      reader.onload = (upload) => {
        console.log();
        this.props.importCipherTextWallet(upload.target.result);
      };
      return reader.readAsText(file);
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image="/mgmt/png/accessory-1.png"
            title="Import Wallet File"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Import Wallet File
            </Typography>
            <Typography component="p">
              If you have an encrypted wallet file already, you can import it using this card.
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              document.getElementById('wallet-file-input').click();
            }}
          >
            Import Encrypted Wallet File
            <input
              accept="text/plain"
              style={{ display: 'none' }}
              id="wallet-file-input"
              multiple
              onChange={this.handleFileChange}
              type="file"
            />
          </Button>
        </CardActions>
        {/* <CreateWalletDialog open={dialogIsOpen} /> */}
      </Card>
    );
  }
}

ImportWalletFileCard.propTypes = {
  classes: PropTypes.object.isRequired,
  importCipherTextWallet: PropTypes.func.isRequired,
};

export default withStyles(styles)(ImportWalletFileCard);
