// Execute this migration from the scripts/ directory

var fs = require('fs');

const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChanger = artifacts.require('./TokenChanger.sol');

var account = web3.eth.accounts[0];

module.exports = (deployer) => {
    var STORJ, TILE;
    deployer.then(() => {
        return CentrallyIssuedToken.new(account, 'Storj', "STORJ", 1e15, 7);
    }).then(instance => {
        STORJ = instance.address;
        return CentrallyIssuedToken.new(account, 'Loomia', "TILE", 1e15, 7);
    }).then(instance => {
        TILE = instance.address;
        return TokenChanger.new(TILE, STORJ);
    }).then(instance => {
        var addresses = [STORJ, TILE, instance.address].join('\n');
        fs.writeFileSync('addresses', addresses);
    });
}
