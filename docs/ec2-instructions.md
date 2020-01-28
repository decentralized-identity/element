# If using EC2

We recommend using

- Ubuntu Server 18.04 LTS
- a t2.small instance or equivalent (1 vCPU, 2GB of RAM and 8 GB of Disk)

To setup, run the following commands:

```
# Update packaging tool
sudo apt update
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
# Install node
nvm install v10.16.0
# Install other required dependencies
sudo apt install python build-essential jq
```
