/**
 * Test for Tile Token Distribution
 *
 * @author Pactum IO <dev@pactum.io>
 */

import {getEvents, BigNumber, cnf, increaseTimeTo} from './helpers/tools';
import expectThrow from './helpers/expectThrow';
import ether from './helpers/ether';
import {logger as log} from '../../tools/lib/logger';

const TileDistribution  = artifacts.require('./TileDistribution');
const TileToken      = artifacts.require('./TileToken');
const TokenVesting  = artifacts.require('./TokenVesting');
const TokenTimeLock  = artifacts.require('./TokenTimelock');

const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const zero      = new BigNumber(0);
const tokenSupply = new BigNumber(1046000000 * 1e18);
const someValue = ether(42);
const someTokenValue = new BigNumber(5000000 * 1e18);

/**
  * Tile Distribution contract
  */
contract('TileDistribution', (accounts) => {
    const owner             = accounts[0];
    const vestedHolder1     = accounts[1];
    const vestedHolder2     = accounts[2];
    const vestedHolder3     = accounts[3];
    const vestedHolder4     = accounts[4];
    const vestedHolder5     = accounts[5];
    const tileHolder1       = accounts[6];
    const tileHolder2       = accounts[7];
    const timelockHolder    = accounts[8];
    const nonOwner          = accounts[9];
    const zeroAddress       = '0x0000000000000000000000000000000000000000';

    const arrayOfAddresses50 = addressArray(tileHolder1, 50);
    const arrayOfAmounts50 = amountArray(someTokenValue, 50);
    const arrayOfAddresses100 = addressArray(tileHolder1, 100);
    const arrayOfAmounts100 = amountArray(someTokenValue, 100);

    function addressArray(value, len) {
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(value);
        }
        return arr;
    }

    function amountArray(value, len) {
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(value);
        }
        return arr;
    }

    // Provide contract instances for every test case
    let tileDistributionInstance;

    let tileTokenAddress;
    let tileTokenInstance;

    let vestingContractAddress0;
    let vestingContractAddress1;
    let vestingContractAddress2;
    let vestingContractAddress3;
    let vestingContractAddress4;
    let vestingInstance0;
    let vestingInstance1;
    let vestingInstance2;
    let vestingInstance3;
    let vestingInstance4;

    let timelockInstance;
    let timelockAddress;

    let deployedBlockNumber;
    let deployedBlockNumberTimeStamp;

    before(async () => {
        tileDistributionInstance  = await TileDistribution.deployed();
        deployedBlockNumber = await web3.eth.blockNumber;
        deployedBlockNumberTimeStamp = new BigNumber(await web3.eth.getBlock(deployedBlockNumber).timestamp);
    });

    it('should instantiate the Tile Distribution contract correctly', async () => {
        const _vestingDuration = await tileDistributionInstance.VESTING_DURATION();
        const _vestingAmount = await tileDistributionInstance.VESTING_TKN_AMOUNT();
        const _vestingStart = await tileDistributionInstance.VESTING_START_TIME();
        const _vestingCliff = await tileDistributionInstance.VESTING_CLIFF();
        const _timelockDuration = await tileDistributionInstance.TIMELOCK_DURATION();
        const _timelockAmount = await tileDistributionInstance.TIMELOCK_TKN_AMOUNT();
        const _owner = await tileDistributionInstance.owner();
        const _expectedVest = new BigNumber(tokenSupply.mul(0.15));
        const _expectedTimelock = new BigNumber(tokenSupply.mul(0.05));

        _vestingDuration.should.be.bignumber.equal(2 * 365 * 86400);
        _vestingAmount.should.be.bignumber.equal(_expectedVest);
        _vestingStart.should.be.bignumber.equal(1504224000);
        _vestingCliff.should.be.bignumber.equal(26 * 7 * 86400);
        _timelockDuration.should.be.bignumber.equal(365 * 86400);
        _timelockAmount.should.be.bignumber.equal(_expectedTimelock);
        _owner.should.be.bignumber.equal(owner);
    });

    it('should retrieve contracts created', async () => {
        tileTokenAddress          = await tileDistributionInstance.token();
        tileTokenInstance         = await TileToken.at(tileTokenAddress);

        timelockAddress           = await tileDistributionInstance.tokenTimelockAddress();
        timelockInstance          = await TokenTimeLock.at(timelockAddress);

        vestingContractAddress0    = await tileDistributionInstance.tokenVestingAddresses(0);
        vestingContractAddress1    = await tileDistributionInstance.tokenVestingAddresses(1);
        vestingContractAddress2    = await tileDistributionInstance.tokenVestingAddresses(2);
        vestingContractAddress3    = await tileDistributionInstance.tokenVestingAddresses(3);
        vestingContractAddress4    = await tileDistributionInstance.tokenVestingAddresses(4);
        vestingInstance0          = await TokenVesting.at(vestingContractAddress0);
        vestingInstance1          = await TokenVesting.at(vestingContractAddress1);
        vestingInstance2          = await TokenVesting.at(vestingContractAddress2);
        vestingInstance3          = await TokenVesting.at(vestingContractAddress3);
        vestingInstance4          = await TokenVesting.at(vestingContractAddress4);
    });

    it('should instantiate token contract correctly', async () => {
        const name      = await tileTokenInstance.NAME();
        const symbol    = await tileTokenInstance.SYMBOL();
        const decimals  = await tileTokenInstance.DECIMALS();
        const totalSupply = await tileTokenInstance.totalSupply();
        const _tokenBalance =  await tileTokenInstance.balanceOf(tileDistributionInstance.address);
        const _vestingAmount = await tileDistributionInstance.VESTING_TKN_AMOUNT();
        const _timelockAmount = await tileDistributionInstance.TIMELOCK_TKN_AMOUNT();

        assert.equal(name, 'LOOMIA TILE', 'Name does not match');
        assert.equal(symbol, 'TILE', 'Symbol does not match');
        assert.equal(decimals, 18, 'Decimals does not match');
        totalSupply.should.be.bignumber.equal(tokenSupply);
        ((totalSupply.sub(_vestingAmount)).sub(_timelockAmount)).should.be.bignumber.equal(_tokenBalance);
    });

    it('should instantiate 5 Token Vesting contracts correctly', async () => {
        const _vestingAmount = await tileDistributionInstance.VESTING_TKN_AMOUNT();
        const _tileDistAddress = await tileDistributionInstance.address;

        const _vestingCliff = await tileDistributionInstance.VESTING_CLIFF();
        const _vestingStart = await tileDistributionInstance.VESTING_START_TIME();
        const _vestingDuration = await tileDistributionInstance.VESTING_DURATION();

        const _owner0 = await vestingInstance0.owner();
        const _owner1 = await vestingInstance1.owner();
        const _owner2 = await vestingInstance2.owner();
        const _owner3 = await vestingInstance3.owner();
        const _owner4 = await vestingInstance4.owner();

        const _ben0 = await vestingInstance0.beneficiary();
        const _ben1 = await vestingInstance1.beneficiary();
        const _ben2 = await vestingInstance2.beneficiary();
        const _ben3 = await vestingInstance3.beneficiary();
        const _ben4 = await vestingInstance4.beneficiary();

        const _cliff0 = await vestingInstance0.cliff();
        const _cliff1 = await vestingInstance1.cliff();
        const _cliff2 = await vestingInstance2.cliff();
        const _cliff3 = await vestingInstance3.cliff();
        const _cliff4 = await vestingInstance4.cliff();

        const _start0 = await vestingInstance0.start();
        const _start1 = await vestingInstance1.start();
        const _start2 = await vestingInstance2.start();
        const _start3 = await vestingInstance3.start();
        const _start4 = await vestingInstance4.start();

        const _duration0 = await vestingInstance0.duration();
        const _duration1 = await vestingInstance1.duration();
        const _duration2 = await vestingInstance2.duration();
        const _duration3 = await vestingInstance3.duration();
        const _duration4 = await vestingInstance4.duration();

        const _revocable0 = await vestingInstance0.revocable();
        const _revocable1 = await vestingInstance1.revocable();
        const _revocable2 = await vestingInstance2.revocable();
        const _revocable3 = await vestingInstance3.revocable();
        const _revocable4 = await vestingInstance4.revocable();

        const _tokenBalance0 =  await tileTokenInstance.balanceOf(vestingContractAddress0);
        const _tokenBalance1 =  await tileTokenInstance.balanceOf(vestingContractAddress1);
        const _tokenBalance2 =  await tileTokenInstance.balanceOf(vestingContractAddress2);
        const _tokenBalance3 =  await tileTokenInstance.balanceOf(vestingContractAddress3);
        const _tokenBalance4 =  await tileTokenInstance.balanceOf(vestingContractAddress4);

        // Check token balance in contract is correct
        _tokenBalance0.should.be.bignumber.equal(_vestingAmount.div(5));
        _tokenBalance1.should.be.bignumber.equal(_vestingAmount.div(5));
        _tokenBalance2.should.be.bignumber.equal(_vestingAmount.div(5));
        _tokenBalance3.should.be.bignumber.equal(_vestingAmount.div(5));
        _tokenBalance4.should.be.bignumber.equal(_vestingAmount.div(5));

        // Check owner is correct
        assert.equal(_owner0, _tileDistAddress, 'Owner Address does not match');
        assert.equal(_owner1, _tileDistAddress, 'Owner Address does not match');
        assert.equal(_owner2, _tileDistAddress, 'Owner Address does not match');
        assert.equal(_owner3, _tileDistAddress, 'Owner Address does not match');
        assert.equal(_owner4, _tileDistAddress, 'Owner Address does not match');

        // Check the address of the Beneficiary is correct
        assert.equal(_ben0, vestedHolder1, 'Beneficiary0 Address does not match');
        assert.equal(_ben1, vestedHolder2, 'Beneficiary1 Address does not match');
        assert.equal(_ben2, vestedHolder3, 'Beneficiary2 Address does not match');
        assert.equal(_ben3, vestedHolder4, 'Beneficiary3 Address does not match');
        assert.equal(_ben4, vestedHolder5, 'Beneficiary4 Address does not match');

        // Check that the cliff is correct
        _cliff0.should.be.bignumber.equal(_vestingStart.add(_vestingCliff));
        _cliff1.should.be.bignumber.equal(_vestingStart.add(_vestingCliff));
        _cliff2.should.be.bignumber.equal(_vestingStart.add(_vestingCliff));
        _cliff3.should.be.bignumber.equal(_vestingStart.add(_vestingCliff));
        _cliff4.should.be.bignumber.equal(_vestingStart.add(_vestingCliff));

        // Check that the start time is correct
        _start0.should.be.bignumber.equal(_vestingStart);
        _start1.should.be.bignumber.equal(_vestingStart);
        _start2.should.be.bignumber.equal(_vestingStart);
        _start3.should.be.bignumber.equal(_vestingStart);
        _start4.should.be.bignumber.equal(_vestingStart);

        // Check that the duration is correct
        _duration0.should.be.bignumber.equal(_vestingDuration);
        _duration1.should.be.bignumber.equal(_vestingDuration);
        _duration2.should.be.bignumber.equal(_vestingDuration);
        _duration3.should.be.bignumber.equal(_vestingDuration);
        _duration4.should.be.bignumber.equal(_vestingDuration);

        // Check that revocable is set to false
        assert.isFalse(_revocable0, 'Revocable should be set to false');
        assert.isFalse(_revocable1, 'Revocable should be set to false');
        assert.isFalse(_revocable2, 'Revocable should be set to false');
        assert.isFalse(_revocable3, 'Revocable should be set to false');
        assert.isFalse(_revocable4, 'Revocable should be set to false');
    });

    it('Multi Vesting contract should not have a 6th vesting instance', async () => {
        await expectThrow(tileDistributionInstance.tokenVestingAddresses(6));
    });

    it('should instantiate Token Timelock contract correctly', async () => {
        const _timelockDuration = await tileDistributionInstance.TIMELOCK_DURATION();
        const _timelockAmount = await tileDistributionInstance.TIMELOCK_TKN_AMOUNT();
        const _timelockAddress = await timelockInstance.address;
        const _token = await timelockInstance.token();
        const _tokenBalance = await tileTokenInstance.balanceOf(_timelockAddress);
        const _tokenAddress = await tileTokenInstance.address;
        const _beneficiary = await timelockInstance.beneficiary();
        const _releaseTime = await timelockInstance.releaseTime();
        // Check token balance in contract is correct
        _tokenBalance.should.be.bignumber.equal(_timelockAmount);
        assert.equal(_token, _tokenAddress, 'TokenAddress does not match');
        assert.equal(_beneficiary, timelockHolder, 'Beneficiary address does not match');
        // Check that Time Lock release is at least a year from now but not over a year.
        assert.isAbove(deployedBlockNumberTimeStamp.add(_timelockDuration).add(100).toNumber(), _releaseTime, 'Release time should be at a year0');
        assert.isBelow(deployedBlockNumberTimeStamp.add(_timelockDuration).minus(100).toNumber(), _releaseTime, 'Release time should be at a year1');
    });

    it('should fail, because we try to send ether to the TileDistribution contract', async () => {
        await expectThrow(tileDistributionInstance.sendTransaction({
            from:   tileHolder1,
            value:  someValue,
            gas:    6000000
        }));
    });

    it('Emits Airdrop event when distributing tokens ', async () => {
        const tx = await tileDistributionInstance.distributeTokens(tileHolder1, someTokenValue, {
            from: owner,
            gas: 6000000
        });

            // Testing events
        const event = getEvents(tx, 'AirDrop');
        assert.equal(event[0]._beneficiaryAddress, tileHolder1, 'Address does not match');
        event[0]._amount.should.be.bignumber.equal(someTokenValue);
    });

    it('Tokens are distributed to Tile Holders ', async () => {
        const _oldTokenBalance = await tileTokenInstance.balanceOf(tileHolder2);
        await tileDistributionInstance.distributeTokens(tileHolder2, someTokenValue, {
            from: owner,
            gas: 6000000
        });
        const _newTokenBalance = await tileTokenInstance.balanceOf(tileHolder2);
        _oldTokenBalance.should.be.bignumber.equal(zero);
        _newTokenBalance.should.be.bignumber.equal(someTokenValue);
    });

    it('Should fail distributing tokens, because message sender is not owner', async () => {
        await expectThrow(tileDistributionInstance.distributeTokens(tileHolder2, someTokenValue, {
            from: nonOwner,
            gas: 6000000
        }));
    });

    it('should fail, because we try to airdrop tokens to a zero address', async () => {
        await expectThrow(tileDistributionInstance.distributeTokens(zeroAddress, someTokenValue, {
            from: owner,
            gas: 6000000
        }));
    });

    it('should fail, because we try to send zero tokens to a beneficiary', async () => {
        await expectThrow(tileDistributionInstance.distributeTokens(tileHolder2, zero, {
            from: owner,
            gas: 6000000
        }));
    });

    it('should fail, because we try to send more tokens than contract holds', async () => {
        const _tokenBalance =  await tileTokenInstance.balanceOf(tileDistributionInstance.address);
        const _moreThanBalance = new BigNumber(_tokenBalance.add(1));
        await expectThrow(tileDistributionInstance.distributeTokens(tileHolder2, _moreThanBalance, {
            from: owner,
            gas: 6000000
        }));
    });

    it('Emits Airdrop event when distributing tokens via batch function ', async () => {
        const tx = await tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2], [someTokenValue, someTokenValue], {
            from: owner,
            gas: 6000000
        });

            // Testing events
        const event = getEvents(tx, 'AirDrop');
        assert.equal(event[0]._beneficiaryAddress, tileHolder1, 'Address does not match');
        event[0]._amount.should.be.bignumber.equal(someTokenValue);
        assert.equal(event[1]._beneficiaryAddress, tileHolder2, 'Address does not match');
        event[1]._amount.should.be.bignumber.equal(someTokenValue);
    });

    it('Tokens are distributed to Tile Holders via Batch function', async () => {
        const _oldTokenBalance1 = await tileTokenInstance.balanceOf(tileHolder1);
        const _oldTokenBalance2 = await tileTokenInstance.balanceOf(tileHolder2);
        await tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2], [someTokenValue, someTokenValue], {
            from: owner,
            gas: 6000000
        });
        const _newTokenBalance1 = await tileTokenInstance.balanceOf(tileHolder1);
        const _newTokenBalance2 = await tileTokenInstance.balanceOf(tileHolder2);
        (_oldTokenBalance1.add(someTokenValue)).should.be.bignumber.equal(_newTokenBalance1);
        (_oldTokenBalance2.add(someTokenValue)).should.be.bignumber.equal(_newTokenBalance2);
    });

    it('Should fail batch distributing of tokens, because message sender is not owner', async () => {
        await expectThrow(tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2], [someTokenValue, someTokenValue], {
            from: nonOwner,
            gas: 6000000
        }));
    });

    it('should fail batch distribution, because we try to airdrop tokens to a zero address', async () => {
        await expectThrow(tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2, zeroAddress], [someTokenValue, someTokenValue, someTokenValue], {
            from: owner,
            gas: 6000000
        }));
    });

    it('should fail batch distribution, because we try to send zero tokens to a beneficiary', async () => {
        await expectThrow(tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2, tileHolder1], [someTokenValue, someTokenValue, zero], {
            from: owner,
            gas: 6000000
        }));
    });

    it('should fail batch distribution, because we try to send more tokens than contract holds', async () => {
        const _tokenBalance =  await tileTokenInstance.balanceOf(tileDistributionInstance.address);
        const _moreThanBalance = new BigNumber(_tokenBalance.add(1));
        await expectThrow(tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2], [someTokenValue, _moreThanBalance], {
            from: owner,
            gas: 6000000
        }));
    });

    it('should fail batch distribution, because we have an extra address an no corresponding amount to send', async () => {
        await expectThrow(tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2, tileHolder1], [someTokenValue, someTokenValue], {
            from: owner,
            gas: 6000000
        }));
    });

    it('should fail batch distribution, because we have an extra amount an no corresponding address', async () => {
        await expectThrow(tileDistributionInstance.batchDistributeTokens([tileHolder1, tileHolder2], [someTokenValue, someTokenValue, someTokenValue], {
            from: owner,
            gas: 6000000
        }));
    });

    it('We can successfully AirDrop to 50 addresses', async () => {
        await tileDistributionInstance.batchDistributeTokens(arrayOfAddresses50, arrayOfAmounts50, {
            from: owner,
            gas: 6000000
        });
    });

    it('We can successfully AirDrop to 100 addresses', async () => {
        await tileDistributionInstance.batchDistributeTokens(arrayOfAddresses100, arrayOfAmounts100, {
            from: owner,
            gas: 6000000
        });
    });

    it('Fails because an unauthorized user tries to transfer Ownership', async () => {
        await expectThrow(tileDistributionInstance.transferOwnership(tileHolder1, {
            from: nonOwner,
            gas: 6000000
        }));
    });

    it('Fails because owner attempts to transfers Ownership to a zero Address', async () => {
        await expectThrow(tileDistributionInstance.transferOwnership(zeroAddress, {
            from: owner,
            gas: 6000000
        }));
    });

    it('Should successfully transfer Ownership', async () => {
        await (tileDistributionInstance.transferOwnership(tileHolder1, {
            from: owner,
            gas: 6000000
        }));
        const _owner = await tileDistributionInstance.owner();
        _owner.should.be.bignumber.equal(tileHolder1);
    });
});
