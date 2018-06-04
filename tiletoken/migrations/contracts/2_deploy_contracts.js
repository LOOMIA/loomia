/**
 * Migration
 *
 */
const cnf           = require('../../cnf.json');
const TileToken      = artifacts.require('./TileToken.sol');
const TileDistribution  = artifacts.require('./TileDistribution.sol');

module.exports = function (deployer, network, accounts) {
    if (network === 'mainnet') {
        console.log('Truffle migration is for local dev environment only!');
        console.log('Not meant MainNet deployment');
        process.exit(1);
    } else if (network === 'rinkeby') {
        deployer.deploy(
            TileDistribution,
            ['0x4dd96AF7e103258815a3c73F8B3c0Bb728E90d85', '0xd8308598e5e9C6c9cD0c9b398BF0cf3c2FC331E6', '0xD2A66347B44E079A1d32959E7DCfBdB93D919442', '0xAB11387ba904E05a272dcC91e2840B8fc56A5DD2', '0x9EeeCD74fF610E157F8a3367D37E82912a25fd7a'],
            '0x6992A5F39b141020289441De58641935d7a81Ed0'
        );
    } else {
        deployer.deploy(TileToken);
        deployer.deploy(TileDistribution, [cnf.TestVestingAddress.one, cnf.TestVestingAddress.two,
            cnf.TestVestingAddress.three, cnf.TestVestingAddress.four, cnf.TestVestingAddress.five], cnf.TestTimelockHolder);
    }
};
