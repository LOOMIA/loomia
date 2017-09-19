// Execute this migration from the scripts/ directory

var fs = require('fs');

const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChanger = artifacts.require('./TokenChanger.sol');

var account = web3.eth.accounts[0];

function cd_project_root() {
    while (!fs.existsSync('truffle.js'))
        process.chdir('..')
}

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
        cd_project_root();
        fs.writeFileSync('contracts/addresses', addresses);
    });
}
