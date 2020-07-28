# Element Contract Test Explainer

Primary Modules:
Ganache CLI v6.9.0 (ganache-core: 2.10.1)
Truffle v5.1.36 (core: 5.1.36)
Solidity v0.5.16 (solc-js)
Node v12.14.0
Web3.js v1.2.1
Chai 4.2.0
Truffle Assertions 0.9.2
Ganache Time Traveler 1.0.14

To begin, clone the repo.

Then start ganache from your node command line window in the element folder:
```
$ ganache-cli
```
From another Node command line editor:
```
$ truffle console
```
This connects Truffle to the Ganache client by connecting to the 'Development' network as defined in the config.js file

```
$truffle(development)> migrate
```
This deploys the Element contracts to the Ganache client.

From a third node command line window, go to the element/test folder:

```
$ truffle test
```
This runs the 4 Truffle unit tests of the element contracts:
1. Adds an operator to the registry, tests that 0 in bytes32 is an invalid hash and proves that an operator cannot be added twice
2. Stakes an operator, tests that only a registered operator can stake, tests that the stake is large enough or that if stake is increased that the current amount is over current limit of 32 eth
3. Tests withdrawl of stake from contract including attempting to withdraw too early
4. Tests submission of anchorhash, checks that only a non-withdrawing operator can submit a hash, checks slashing condition

The Element contract testing suit consists of 5 contracts but only 3 will be actually used in production:
1. ElementOperatorRegistryStaking.sol -- The main contract with an interface that is only required for testing purposes. In a lter iteration all external functions should be defined through an interface
2. Address.sol -- the Open Zeppelin utility contract to manage addresses including testing if an address is a contract address
3. SafeMath.sol -- the Open Zeppeling utility contract agains buffer overruns
4. Migrations.sol -- the Truffle migtrations contract
5. testElement.sol -- a helper test contract that enables the testing of reverts if the main element contract is called by another contract which is not allowed

The new Element Contract has the following methods:
```
/*
* @dev registers msg.sender as an operator and checks if msg.sender is not a contract and not already registered
* @param committment hash that is registered and needs to be submitted with a staking, unstaking and anchoring request
*/
function registerOperator (bytes32 commitmenthash) external returns (bool)

/*
* @dev registers the stake of an operator. Requires that operator is already registered. Operator cannot be represented through a smart contract.
* Minimal stake amount of 32 Eth needs to be satisfied
* @param comittment hash used for registration
*/
function registerStake (bytes32 hash) external payable isRegisteredOperator(hash)

/*
* @dev Requests stake withdrawl and starts 4 week timer (open question: hardocde the duration or put into a constructor). Function can only be called once by operator.
* @param commitment hash
*/
function withdrawstake (bytes32 hash) external isRegisteredOperator(hash) returns (bool)

/*
* @dev finalizes withdrawl, sends the stake to the operator. Open question: unregister operator or just leave entry to avoid the same acccount registering again.
* @param comittment hash
*/
function finalizewithdraw (bytes32 hash) external isRegisteredOperator(hash)

/*
* @dev Registers the anchorhash and emits event and checks if the operator is registered and submitted the correct commit hash, checks for the state slahing condition
* (only 1 transaction per operator per block), checks if no stake withdrawl request is pending, stake is large enough, and the last transaction was at a lower
* blockheight. If any of the checks fail, a failure event is emitted. If the slashing condition is met then the stake of the operator is slashed and a failure
* and slashing event are emitted
* @param committment hash
* @param anchor hash
*/
function registerAnchorhash (bytes32 hash, string calldata anchorHash) external isRegisteredOperator(hash) returns (bool)

/*
* @dev slashes the entire stake of an operator by sending it to the zero address. Transfer to zero address is reentrancy save.
* @param address of operator
*/
function slashoperator (address operator) private returns (bool)
```
