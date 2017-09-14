var fs = require('fs');
var locus = require('locus');
const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChanger = artifacts.require('./TokenChanger.sol');

module.exports = function (callback) {
    addresses = fs.readFileSync("addresses", "utf8").split('\n');
    STORJ = CentrallyIssuedToken.at(addresses[0]);
    TILE = CentrallyIssuedToken.at(addresses[1]);
    changer = TokenChanger.at(addresses[2]);
    STORJ.transfer(changer.address, 1e12, { from: web3.eth.accounts[0] });
    TILE.transfer(changer.address, 1e11, { from: web3.eth.accounts[0] });
    setTimeout(() => {
        changer.storjPrice().then(console.log);
    }, 500);
    
    callback();
}
