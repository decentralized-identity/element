const Element = artifacts.require("./ElementOperatorRegistryStaking.sol");
const Test = artifacts.require("./testElement.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
const helper = require('ganache-time-traveler');

// tools for overloaded function calls
const web3Abi = require('web3-eth-abi');
const web3Utils = require('web3-utils');

contract("Element Contract Test", async accounts => {

    let alice = accounts[0], bob = accounts[3], charlie = accounts[4], doris = accounts[5];
    const bytes0 = web3Utils.padLeft(web3Utils.toHex(0), 64);
    const dayinseconds = 86400;


  let instance;

  async function stopMining() {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: "2.0",
        method: "miner_stop",
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }
  
  async function startMining() {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: "2.0",
        method: "miner_start",
        params: [1],
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }
  
  async function queueTransaction(from, to, gasLimit, data) {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        id: new Date().getTime(),
        params: [
          {
            from: from,
            to: to,
            gas: gasLimit,
            data: data
          }
        ]
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }

  before(async () => {
    instance = await Element.new();
    instance1 = await Test.new();
  });

  it("Adds an operator to the registry, tests that 0 in bytes32 is an invalid hash and proves that an operator cannot be added twice", async () => {
    const element_address = instance.address;
    let commitment_hash = web3Utils.sha3(accounts[1]);
    //check if boolean returns true for a registration
    let result = await instance.registerOperator.call(commitment_hash,{from: alice});
    assert (result == true,"Alice could not be registered");
    //test revert if hash is bytes32(0)
    await truffleAssert.reverts(instance.registerOperator(bytes0,{from: alice}),"Hash cannot be 0");
    //test revert for the registration function called from an external contract by returning a false return upon calling the Element contract from the test contract
    await truffleAssert.reverts(instance1.test.call(element_address),"Submitter cannot be a contract!");
    //register alice as operator
    await instance.registerOperator(commitment_hash,{from: alice});
    //check that you cannot register alice twice
    let fake_hash = web3Utils.sha3(accounts[2]);
    let result1 = await instance.registerOperator.call(fake_hash,{from: alice});
    assert (result1 == false,"Alice was registered");
  });
 

  it("Stakes an operator, tests that only a registered operator can stake, tests that the stake is large enough or that if stake is increased that the current amount is over current limit of 32 eth", async () => {
    let commitment_hash = web3Utils.sha3(accounts[1]);
    let fake_hash = web3Utils.sha3(accounts[2]);
    let stake = web3Utils.toWei('32', "ether");
    let smallstake = web3Utils.toWei('30', "ether");
    //check that modifier works and only registered accounts and hashes can be submitted
    await truffleAssert.reverts(instance.registerStake(commitment_hash,{from:bob, value:stake}),"Caller is either not registred Operator or wrong committment!");
    await truffleAssert.reverts(instance.registerStake(fake_hash,{from:alice, value:stake}),"Caller is either not registred Operator or wrong committment!");
    //check revert for too small a stake
    await truffleAssert.reverts(instance.registerStake(commitment_hash,{from:alice, value:smallstake}),"Stake !>= 32 Eth");
    //deposit stake for alice
    let result2 = await instance.registerStake(commitment_hash,{from:alice, value:stake});
    //check event is emitted correctly
    truffleAssert.eventEmitted(result2, 'operatorstaked', (ev) => {
        return ev._operator == alice && ev._amount == stake;
        });

    });

    it("Tests withdrawl of stake from contract including attempting to withdraw too early", async () => {
        let commitment_hash = web3Utils.sha3(accounts[1]);
        let didnotwaitlongenough = dayinseconds*14;
        let waitedlongenough = dayinseconds*21;
        let stake = web3Utils.toWei('32', "ether");
        //check that withdrawl registering works
        let result2 = await instance.withdrawstake.call(commitment_hash,{from:alice});
        assert (result2 == true,"Registering withdrawal failed");
        //check that you cannot call finalize withdrawal if you have not registered withdrawl first
        await truffleAssert.reverts(instance.finalizewithdraw(commitment_hash,{from:alice}),"Not registered stake withdrawl or unstaking period not over");
        //register withdrawl by alice
        await instance.withdrawstake(commitment_hash,{from:alice});
        //test the registering withdrawl twice fails
        let result3 = await instance.withdrawstake.call(commitment_hash,{from:alice});
        assert (result3 == false,"Oopps you registered withdrawl twice");
        //check that calling final withdrawl before lock period is over fails
        await helper.advanceTime(didnotwaitlongenough);
        await truffleAssert.reverts(instance.finalizewithdraw(commitment_hash,{from:alice}),"Not registered stake withdrawl or unstaking period not over");
        await helper.advanceTime(waitedlongenough);
        //finalize withdrawl by alice
        let result4 = await instance.finalizewithdraw(commitment_hash,{from:alice});
        //check returned stake event is emitted correctly
        truffleAssert.eventEmitted(result4, 'stakereturned', (ev) => {
            return ev.operator == alice && ev.amount == stake;
        });

    });

        it("Tests submission of anchorhash, checks that only a non-withdrawing operator can submit a hash, checks slashing condition", async () => {
            let commitment_hash = web3Utils.sha3(accounts[8]);
            let stake = web3Utils.toWei('32', "ether");
            let anchorhash = 'QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKd';
            //register Bob as operator
            await instance.registerOperator(commitment_hash,{from: bob});
            //stake bob
            await instance.registerStake(commitment_hash,{from:bob, value:stake});
            //test anchoring a hash through emitting the correct event
            let result5 = await instance.registerAnchorhash(commitment_hash, anchorhash,{from:bob});
            truffleAssert.eventEmitted(result5, 'anchorsuccess', (ev) => {
                return ev._operator == bob && ev._anchorHash == anchorhash && ev._transactionNumber == 1;
            });
            //check that a submission from an operator in the unbonding period fails
            let commitment_hash1 = web3Utils.sha3(accounts[9]);
            let anchorhash1 = 'QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKd';
            await instance.registerOperator(commitment_hash1,{from: charlie});
            await instance.registerStake(commitment_hash1,{from:charlie, value:stake});
            await instance.withdrawstake(commitment_hash1,{from:charlie});
            let result6 = await instance.registerAnchorhash(commitment_hash1, anchorhash1,{from:charlie});
            truffleAssert.eventEmitted(result6, 'anchorfailed', (ev) => {
                return ev._operator == charlie && ev._anchorHash == anchorhash1;
            });
            
            //set up check of slasshing condition by registering and staking Doris and then submitting 3 transactions in 1 block in the following order Bob, Doris, Bob 
            // this will check that only 1 transaction per block is allowed and that if 1 operator submits 2 transactions his stake will get slashed 
            let commitment_hash2 = web3Utils.sha3(accounts[7]);
            //register and stake Doris
            await instance.registerOperator(commitment_hash2,{from: doris});
            await instance.registerStake(commitment_hash2,{from:doris, value:stake});
            //get current block number and stop mining
            let currentblocknumber = await web3.eth.getBlockNumber();
            await stopMining();
            //submit Bob's 1st transaction and make sure it is not mined
            let encodedmethod = {
                name: 'registerAnchorhash',
                type: 'function',
                inputs: [{
                    type: 'bytes32',
                    name: 'hash'
                },{
                    type: 'string',
                    name: 'anchorHash'
                }],
            };
            let paramValues = [commitment_hash, anchorhash];
            let dataEncoded = web3Abi.encodeFunctionCall(encodedmethod,paramValues);
            let tx1 = await queueTransaction(bob, instance.address, 190000, dataEncoded);
            let receipt1 = await web3.eth.getTransactionReceipt(tx1);
            assert.strictEqual(receipt1, null);
            //submit Doris' transaction and make sure it is not mined
            let paramValues1 = [commitment_hash2, anchorhash];
            let dataEncoded1 = web3Abi.encodeFunctionCall(encodedmethod,paramValues1);
            let tx2 = await queueTransaction(doris, instance.address, 190000, dataEncoded1);
            let receipt2 = await web3.eth.getTransactionReceipt(tx2);
            assert.strictEqual(receipt2, null);
            //submit Bob's 2nd Transaction and make sure it is not mined
            let tx3 = await queueTransaction(bob, instance.address, 190000, dataEncoded);
            let receipt3 = await web3.eth.getTransactionReceipt(tx3);
            assert.strictEqual(receipt3, null);
            //start mining
            await startMining();
            //check that block properly advanced
                let newblocknumber = await web3.eth.getBlockNumber();
                assert.strictEqual(newblocknumber, currentblocknumber + 1);

            //check that the correct events have been triggered 4 total 
            let alleventslastblock = await instance.getPastEvents({filter: {_operator: doris}, fromBlock: currentblocknumber, toBlock: newblocknumber});
            assert.equal(alleventslastblock.length,4,"Expected 4 events");
            let successevent = await instance.getPastEvents('anchorsuccess',{filter: {_operator: bob}, fromBlock: currentblocknumber, toBlock: newblocknumber});
                    assert.equal(successevent.length,1,"Wrong length");
            let failureevent = await instance.getPastEvents('anchorfailed',{filter: {_operator: doris}, fromBlock: currentblocknumber, toBlock: newblocknumber});
                    assert.equal(failureevent.length,1,"Wrong length");
            let slashingevent = await instance.getPastEvents('operatorslashed',{filter:{_operator: bob}, fromBlock: currentblocknumber, toBlock: newblocknumber});
                    assert.equal(slashingevent.length,1,"Wrong length");
            let failureeventbob = await instance.getPastEvents('anchorfailed',{filter:{_operator: bob}, fromBlock: currentblocknumber, toBlock: newblocknumber});
                    assert.equal(failureeventbob.length,1,"Wrong length");
                });

})