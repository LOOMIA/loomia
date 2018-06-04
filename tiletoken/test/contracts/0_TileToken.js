/**
 * Test for LOOMIA TILE Token
 *
 * @author Pactum IO <dev@pactum.io>
 */

import {getEvents, BigNumber} from './helpers/tools';
import expectThrow from './helpers/expectThrow';

const loomiaToken = artifacts.require('./TileToken');

const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

/**
 * Tile Token Contract
 */
contract('TileToken', (accounts) => {
    const owner                 = accounts[0];
    const tokenHolder1          = accounts[1];
    const spendingAddress       = accounts[2];
    const recipient             = accounts[3];
    const anotherAccount        = accounts[4];
    const tokenHolder5          = accounts[5];
    const zeroTokenHolder       = accounts[6];
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const zero = new BigNumber(0);
    const tokenSupply = new BigNumber(1046000000000000000000000000);

    // Provide Tile Token instance for every test case
    let tileTokenInstance;
    beforeEach(async () => {
        tileTokenInstance = await loomiaToken.deployed();
    });

    it('should instantiate the token correctly', async () => {
        const name      = await tileTokenInstance.NAME();
        const symbol    = await tileTokenInstance.SYMBOL();
        const decimals  = await tileTokenInstance.DECIMALS();
        const totalSupply = await tileTokenInstance.totalSupply();

        assert.equal(name, 'LOOMIA TILE', 'Name does not match');
        assert.equal(symbol, 'TILE', 'Symbol does not match');
        assert.equal(decimals, 18, 'Decimals does not match');
        totalSupply.should.be.bignumber.equal(tokenSupply);
    });

    describe('balanceOf', function () {
        describe('when the requested account has no tokens', function () {
            it('returns zero', async function () {
                const balance = await tileTokenInstance.balanceOf(zeroTokenHolder);
                balance.should.be.bignumber.equal(zero);
            });
        });
        describe('when the requested account has some tokens', function () {
            it('returns the total amount of tokens', async function () {
                const balance = await tileTokenInstance.balanceOf(owner);
                balance.should.be.bignumber.equal(tokenSupply);
            });
        });
    });
    describe('transfer', function () {
        describe('when the recipient is not the zero address', function () {
            const to = tokenHolder1;
            describe('when the sender does not have enough balance', function () {
                const transferAmount = tokenSupply.add(1);
                it('reverts', async function () {
                    await expectThrow(tileTokenInstance.transfer(to, transferAmount, {
                        from: owner
                    }));
                });
            });
            describe('when the sender has enough balance', function () {
                const transferAmount = new BigNumber(500 * 1e18);
                it('transfers the requested amount', async function () {
                    await tileTokenInstance.transfer(to, transferAmount, {
                        from: owner
                    });
                    const senderBalance = await tileTokenInstance.balanceOf(owner);
                    senderBalance.should.be.bignumber.equal(tokenSupply.sub(transferAmount));
                    const recipientBalance = await tileTokenInstance.balanceOf(to);
                    recipientBalance.should.be.bignumber.equal(transferAmount);
                });
                it('emits a transfer event', async function () {
                    const tx = await tileTokenInstance.transfer(to, transferAmount, {
                        from: owner
                    });
                    // Test the event

                    const events = getEvents(tx, 'Transfer');

                    assert.equal(events[0].from, owner, 'From address does not match');
                    assert.equal(events[0].to, to, 'To address does not match');
                    (events[0].value).should.be.bignumber.equal(transferAmount);
                });
            });
        });
        describe('when the recipient is the zero address', function () {
            const to = zeroAddress;
            it('reverts', async function () {
                await expectThrow(tileTokenInstance.transfer(to, 100, {
                    from: owner
                }));
            });
        });
    });
    describe('approve', function () {
        describe('when the spender is not the zero address', function () {
            const spender = spendingAddress;
            describe('when the sender has enough balance', function () {
                const amount = new BigNumber(100 * 1e18);
                it('emits an approval event', async function () {
                    const tx = await tileTokenInstance.approve(spender, amount, {
                        from: owner
                    });
                    // Test the event
                    const events = getEvents(tx, 'Approval');

                    assert.equal(events[0].owner, owner, 'address does not match');
                    assert.equal(events[0].spender, spender, 'Spender address does not match');
                    (events[0].value).should.be.bignumber.equal(amount);
                });
                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await tileTokenInstance.approve(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });
                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await tileTokenInstance.approve(spender, 1, {
                            from: owner
                        });
                    });
                    it('approves the requested amount and replaces the previous one', async function () {
                        await tileTokenInstance.approve(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });
            });
            describe('when the sender does not have enough balance', function () {
                const amount = new BigNumber(101 * 1e18);
                it('emits an approval event', async function () {
                    const tx = await tileTokenInstance.approve(spender, amount, {
                        from: owner
                    });

                    const events = getEvents(tx, 'Approval');

                    assert.equal(events[0].owner, owner, 'address does not match');
                    assert.equal(events[0].spender, spender, 'Spender address does not match');
                    (events[0].value).should.be.bignumber.equal(amount);
                });
                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await tileTokenInstance.approve(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });
                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await tileTokenInstance.approve(spender, 1, {
                            from: owner
                        });
                    });
                    it('approves the requested amount and replaces the previous one', async function () {
                        await tileTokenInstance.approve(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });
            });
        });
        describe('when the spender is the zero address', function () {
            const amount = new BigNumber(100 * 1e18);
            const spender = zeroAddress;
            it('approves the requested amount', async function () {
                await tileTokenInstance.approve(spender, amount, {
                    from: owner
                });
                const allowance = await tileTokenInstance.allowance(owner, spender);
                allowance.should.be.bignumber.equal(amount);
            });
            it('emits an approval event', async function () {
                const tx = await tileTokenInstance.approve(spender, amount, {
                    from: owner
                });

                const events = getEvents(tx, 'Approval');
                assert.equal(events[0].owner, owner, 'address does not match');
                assert.equal(events[0].spender, spender, 'Spender address does not match');
                (events[0].value).should.be.bignumber.equal(amount);
            });
        });
    });
    describe('transfer from', function () {
        const spender = recipient;
        describe('when the recipient is not the zero address', function () {
            const to = anotherAccount;
            describe('when the spender has enough approved balance', function () {
                beforeEach(async function () {
                    const approvalAmount = new BigNumber(30000 * 1e18);
                    await tileTokenInstance.approve(spender, approvalAmount, {
                        from: owner
                    });
                    await tileTokenInstance.approve(spender, approvalAmount, {
                        from: zeroTokenHolder
                    });
                });
                describe('when the owner has enough balance', function () {
                    const amount = new BigNumber(30000 * 1e18);
                    it('transfers the requested amount', async function () {
                        const balanceBefore = await tileTokenInstance.balanceOf(owner);
                        await tileTokenInstance.transferFrom(owner, to, amount, {
                            from: spender
                        });
                        const senderBalance = await tileTokenInstance.balanceOf(owner);
                        senderBalance.should.be.bignumber.equal(balanceBefore.sub(amount));
                        const recipientBalance = await tileTokenInstance.balanceOf(to);
                        recipientBalance.should.be.bignumber.equal(amount);
                    });
                    it('decreases the spender allowance', async function () {
                        await tileTokenInstance.transferFrom(owner, to, amount, {
                            from: spender
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        assert(allowance.eq(0));
                    });
                    it('emits a transfer event', async function () {
                        const tx = await tileTokenInstance.transferFrom(owner, to, amount, {
                            from: spender
                        });

                        // Test the event
                        const events = getEvents(tx, 'Transfer');
                        assert.equal(events[0].from, owner, 'address does not match');
                        assert.equal(events[0].to, to, 'To address does not match');
                        (events[0].value).should.be.bignumber.equal(amount);
                    });
                });
                describe('when the owner does not have enough balance', function () {
                    const amount = new BigNumber(1 * 1e18);
                    it('reverts', async function () {
                        await expectThrow(tileTokenInstance.transferFrom(zeroTokenHolder, to, amount, {
                            from: spender
                        }));
                    });
                });
            });
            describe('when the spender does not have enough approved balance', function () {
                beforeEach(async function () {
                    const approvalAmount = new BigNumber(99 * 1e18);
                    const bigApprovalAmount = new BigNumber(999 * 1e18);
                    await tileTokenInstance.approve(spender, approvalAmount, {
                        from: owner
                    });
                    await tileTokenInstance.approve(spender, bigApprovalAmount, {
                        from: tokenHolder1
                    });
                });
                describe('when the owner has enough balance', function () {
                    const amount = new BigNumber(100 * 1e18);
                    it('reverts', async function () {
                        await expectThrow(tileTokenInstance.transferFrom(owner, to, amount, {
                            from: spender
                        }));
                    });
                });
                describe('when the owner does not have enough balance', function () {
                    const amount = new BigNumber(1001 * 1e18);
                    it('reverts', async function () {
                        await expectThrow(tileTokenInstance.transferFrom(tokenHolder1, to, amount, {
                            from: spender
                        }));
                    });
                });
            });
        });
        describe('when the recipient is the zero address', function () {
            const amount = new BigNumber(100 * 1e18);
            const to = zeroAddress;

            beforeEach(async function () {
                await tileTokenInstance.approve(spender, amount, {
                    from: owner
                });
            });
            it('reverts', async function () {
                await expectThrow(tileTokenInstance.transferFrom(owner, to, amount, {
                    from: spender
                }));
            });
        });
    });
    describe('decrease approval', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                const amount = new BigNumber(100 * 1e18);

                it('emits an approval event', async function () {
                    const tx = await tileTokenInstance.decreaseApproval(spender, amount, {
                        from: owner
                    });

                    // Test the event
                    const events = getEvents(tx, 'Approval');
                    assert.equal(events[0].owner, owner, 'address does not match');
                    assert.equal(events[0].spender, spender, 'Spender address does not match');
                    (events[0].value).should.be.bignumber.equal(0);
                });

                describe('when there was no approved amount before', function () {
                    it('keeps the allowance to zero', async function () {
                        await tileTokenInstance.decreaseApproval(spender, amount, {
                            from: owner
                        });

                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(0);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        const approvalAmount = new BigNumber(1000 * 1e18);
                        await tileTokenInstance.approve(spender, approvalAmount, {
                            from: owner
                        });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await tileTokenInstance.decreaseApproval(spender, amount, {
                            from: owner
                        });
                        const approvalAmount = new BigNumber(1000 * 1e18);
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(approvalAmount.sub(amount));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = new BigNumber(1000 * 1e18);

                it('emits an approval event', async function () {
                    const tx = await tileTokenInstance.decreaseApproval(spender, amount, {
                        from: owner
                    });

                    // Test the event
                    const events = getEvents(tx, 'Approval');
                    assert.equal(events[0].owner, owner, 'address does not match');
                    assert.equal(events[0].spender, spender, 'Spender address does not match');
                    (events[0].value).should.be.bignumber.equal(0);
                });
                describe('when there was no approved amount before', function () {
                    it('keeps the allowance to zero', async function () {
                        await tileTokenInstance.decreaseApproval(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(0);
                    });
                });
                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        const approvalAmount = new BigNumber(1001 * 1e18);
                        await tileTokenInstance.approve(spender, approvalAmount, {
                            from: owner
                        });
                    });
                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await tileTokenInstance.decreaseApproval(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(1 * 1e18);
                    });
                });
            });
        });
        describe('when the spender is the zero address', function () {
            const amount = new BigNumber(100 * 1e18);
            const spender = zeroAddress;
            it('decreases the requested amount', async function () {
                await tileTokenInstance.decreaseApproval(spender, amount, {
                    from: owner
                });
                const allowance = await tileTokenInstance.allowance(owner, spender);
                allowance.should.be.bignumber.equal(0);
            });
            it('emits an approval event', async function () {
                const tx = await tileTokenInstance.decreaseApproval(spender, amount, {
                    from: owner
                });

                // Test the event
                const events = getEvents(tx, 'Approval');
                assert.equal(events[0].owner, owner, 'address does not match');
                assert.equal(events[0].spender, spender, 'Spender address does not match');
                (events[0].value).should.be.bignumber.equal(0);
            });
        });
    });
    describe('increase approval', function () {
        const amount = new BigNumber(100 * 1e18);
        describe('when the spender is not the zero address', function () {
            const spender = recipient;
            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const oldAllowance = await tileTokenInstance.allowance(owner, spender);
                    const tx = await tileTokenInstance.increaseApproval(spender, amount, {
                        from: owner
                    });

                    // Test the event
                    const events = getEvents(tx, 'Approval');
                    assert.equal(events[0].owner, owner, 'address does not match');
                    assert.equal(events[0].spender, spender, 'Spender address does not match');
                    (events[0].value).should.be.bignumber.equal(amount.add(oldAllowance));
                });
                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        const oldAllowance = await tileTokenInstance.allowance(owner, spender);
                        await tileTokenInstance.increaseApproval(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(amount.add(oldAllowance));
                    });
                });
                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        const approvalAmount = new BigNumber(1 * 1e18);
                        await tileTokenInstance.approve(spender, approvalAmount, {
                            from: owner
                        });
                    });
                    it('increases the spender allowance adding the requested amount', async function () {
                        const oldAllowance = await tileTokenInstance.allowance(owner, spender);
                        await tileTokenInstance.increaseApproval(spender, amount, {
                            from: owner
                        });
                        const allowance = await tileTokenInstance.allowance(owner, spender);
                        allowance.should.be.bignumber.equal(oldAllowance.add(amount));
                    });
                });
            });
            describe('when the sender does not have enough balance', function () {
                const amount = new BigNumber(2 * 1e18);
                it('emits an approval event', async function () {
                    const oldAllowance = await tileTokenInstance.allowance(tokenHolder1, spender);
                    const tx = await tileTokenInstance.increaseApproval(spender, amount, {
                        from: tokenHolder1
                    });
                    // Test the event
                    const events = getEvents(tx, 'Approval');
                    assert.equal(events[0].owner, tokenHolder1, 'address does not match');
                    assert.equal(events[0].spender, spender, 'Spender address does not match');
                    (events[0].value).should.be.bignumber.equal(oldAllowance.add(amount));
                });
                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await tileTokenInstance.increaseApproval(spender, amount, {
                            from: tokenHolder5
                        });
                        const allowance = await tileTokenInstance.allowance(tokenHolder5, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });
                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        const approvalAmount = new BigNumber(1 * 1e18);
                        await tileTokenInstance.approve(spender, approvalAmount, {
                            from: tokenHolder5
                        });
                    });
                    it('increases the spender allowance adding the requested amount', async function () {
                        const oldAllowance = await tileTokenInstance.allowance(tokenHolder5, spender);
                        await tileTokenInstance.increaseApproval(spender, amount, {
                            from: tokenHolder5
                        });
                        const allowance = await tileTokenInstance.allowance(tokenHolder5, spender);
                        allowance.should.be.bignumber.equal(oldAllowance.add(amount));
                    });
                });
            });
        });
        describe('when the spender is the zero address', function () {
            const spender = zeroAddress;
            it('approves the requested amount', async function () {
                await tileTokenInstance.increaseApproval(spender, amount, {
                    from: owner
                });
                const allowance = await tileTokenInstance.allowance(owner, spender);
                allowance.should.be.bignumber.equal(amount);
            });
            it('emits an approval event', async function () {
                const oldAllowance = await tileTokenInstance.allowance(owner, spender);
                const tx = await tileTokenInstance.increaseApproval(spender, amount, {
                    from: owner
                });
                // Test the event
                const events = getEvents(tx, 'Approval');
                assert.equal(events[0].owner, owner, 'address does not match');
                assert.equal(events[0].spender, spender, 'Spender address does not match');
                (events[0].value).should.be.bignumber.equal(oldAllowance.add(amount));
            });
        });
    });
});
