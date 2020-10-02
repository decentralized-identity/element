pragma solidity >=0.4.21 <0.7.0;

import "./SafeMath.sol";
import "./Address.sol";

contract ElementOperatorRegistryStaking {

using SafeMath for uint;
using Address for address;

//to convert either to wei and the other way around
uint BIGNUMBER = 10**18;

//in eth which means that msg.value needs to be multiplied by 10^18 to convert to wei. Open question: Hardcode value or put into constructor
uint minimal_stake = 32;

//initializing transaction number
uint256 transactionNumber = 0;

//operator registry data
struct OperatorReg {
    bytes32 commitmenthash;
    bool set;
}

//data to be captured for the staking of a registered operator
struct stakingInfo {
        uint amount;
        bool requested;
        uint releaseDate;
    }

//links staking info to an operator
mapping (address => stakingInfo) private stakinginfo;

//sets up the operator registry (address of operator and a committment hash that has to be submitted with every transaction)
mapping (address => OperatorReg) private registry;

//structure to record an anchoring event in order to be able to enforce slashing conditions
struct Anchor_registry {
        address committer;
        string anchorhash;
        uint blockheight;

}

mapping (uint256 => Anchor_registry) private anchorregistry;

//ensure that only registered operators can submit anchor transactions
modifier isRegisteredOperator(bytes32 hash){
        require(registry[msg.sender].commitmenthash == hash,"Caller is either not registred Operator or wrong committment!");
        _;
    }
//event when an anchor hash has been properly registered
event anchorsuccess (address indexed _operator, string _anchorHash, uint256 _transactionNumber);
event anchorfailed (address indexed _operator, string _anchorHash);
event operatorstaked (address indexed _operator, uint _amount);
event operatorslashed (address indexed _operator);
event operatorslashedtransferfailed (address indexed _operator);
event stakereturned (address indexed operator, uint amount);
event stakereturnfailed (address indexed operator, uint amount);

/*
* @dev registers msg.sender as an operator and checks if msg.sender is not a contract and not already registered
* @param committment hash that is registered and needs to be submitted with a staking, unstaking and anchoring request
*/
function registerOperator (bytes32 commitmenthash) external returns (bool) {

    address operator = msg.sender;
    require (!operator.isContract(),"Submitter cannot be a contract!");
    require (commitmenthash != bytes32(0),"Hash cannot be 0");
    if (registry[operator].set == true) {

        return false;

    } else {

    registry[operator].commitmenthash = commitmenthash;
    registry[operator].set = true;

    return true;

    }
}

/*
* @dev registers the stake of an operator. Requires that operator is already registered. Operator cannot be represented through a smart contract.
* Minimal stake amount of 32 Eth needs to be satisfied
* @param comittment hash used for registration
*/
function registerStake (bytes32 hash) external payable isRegisteredOperator(hash) {
    address operator = msg.sender;
    //this looks spurious, however, the contract address check in register Operator could be tricked if the calling contract were to be deployed
    //through a constructor. Hence, we need to check one more time if the caller is a contract but never again afterwards.
    require (!operator.isContract(),"Submitter cannot be a contract!");
    require (msg.value >= minimal_stake*BIGNUMBER || stakinginfo[operator].amount >= minimal_stake*BIGNUMBER, "Stake !>= 32 Eth");

    if (stakinginfo[operator].amount == 0) {
        stakinginfo[operator].amount = msg.value;
        stakinginfo[operator].requested = false;
    } else {
        stakinginfo[operator].amount = stakinginfo[operator].amount + msg.value;
    }

    emit operatorstaked (operator, stakinginfo[operator].amount);

}

/*
* @dev Requests stake withdrawl and starts 4 week timer (open question: hardocde the duration or put into a constructor). Function can only be called once by operator.
* @param commitment hash
*/
function withdrawstake (bytes32 hash) external isRegisteredOperator(hash) returns (bool) {

    if (stakinginfo[msg.sender].amount >= minimal_stake*BIGNUMBER && stakinginfo[msg.sender].requested == false) {
    
    stakinginfo[msg.sender].requested = true;
    stakinginfo[msg.sender].releaseDate = now + 4 weeks;
    
    return true;
    } else {
    
        return false;
    
    }
}

/*
* @dev finalizes withdrawl, sends the stake to the operator. Open question: unregister operator or just leave entry to avoid the same acccount registering again.
* @param comittment hash
*/
function finalizewithdraw (bytes32 hash) external isRegisteredOperator(hash) {

require (stakinginfo[msg.sender].requested && now > stakinginfo[msg.sender].releaseDate, "Not registered stake withdrawl or unstaking period not over");

uint transfer_amount = stakinginfo[msg.sender].amount;
(bool success, ) = msg.sender.call.value(transfer_amount)("");

if (success) {

emit stakereturned (msg.sender, transfer_amount);

} else {

emit stakereturnfailed (msg.sender, transfer_amount);

}

}


/*
* @dev Registers the anchorhash and emits event and checks if the operator is registered and submitted the correct commit hash, checks for the state slahing condition
* (only 1 transaction per operator per block), checks if no stake withdrawl request is pending, stake is large enough, and the last transaction was at a lower
* blockheight. If any of the checks fail, a failure event is emitted. If the slashing condition is met then the stake of the operator is slashed and a failure
* and slashing event are emitted
* @param committment hash
* @param anchor hash
*/
function registerAnchorhash (bytes32 hash, string calldata anchorHash) external isRegisteredOperator(hash) returns (bool) {

    //checking for slashing condition; only 1 transaction per operator per block no matter the other subsequent conditions

    if (anchorregistry[transactionNumber].committer == msg.sender && anchorregistry[transactionNumber].blockheight == block.number) {

        bool result = slashoperator(msg.sender);

        if (result) {

            emit operatorslashed (msg.sender);

        } else {

           emit operatorslashedtransferfailed (msg.sender);

        }

        emit anchorfailed (msg.sender, anchorHash);
        return false;

    }

    //Anchoring fails is stake smaller than minimal stake or operator requested a withdrawl or a transaction has already been registered for this block
    
    if (stakinginfo[msg.sender].requested || stakinginfo[msg.sender].amount < minimal_stake*BIGNUMBER || anchorregistry[transactionNumber].blockheight == block.number) {

        emit anchorfailed (msg.sender, anchorHash);
        return false;

    }

    if (!stakinginfo[msg.sender].requested && stakinginfo[msg.sender].amount >= minimal_stake*BIGNUMBER && anchorregistry[transactionNumber].blockheight < block.number) {

        transactionNumber = transactionNumber + 1;
        anchorregistry[transactionNumber].committer = msg.sender;
        anchorregistry[transactionNumber].anchorhash = anchorHash;
        anchorregistry[transactionNumber].blockheight = block.number;

    emit anchorsuccess (msg.sender, anchorHash, transactionNumber);
    return true;
    }

}

/*
* @dev slashes the entire stake of an operator by sending it to the zero address. Transfer to zero address is reentrancy save.
* @param address of operator
*/
function slashoperator (address operator) private returns (bool) {

    uint burning_amount = stakinginfo[operator].amount;
    delete stakinginfo[operator];
    (bool success, ) = address(0).call.value(burning_amount)("");
    require (success,"Transfer failed");

    return true;
}

}