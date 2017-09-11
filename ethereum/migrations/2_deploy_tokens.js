const CentralToken = artifacts.require('./CentrallyIssuedToken.sol');
var account = web3.eth.accounts[0];

module.exports = (deployer) => {
    deployer.deploy(CentralToken, account, 'Storj', "STORJ", 1e15, 7);
    deployer.deploy(CentralToken, account, 'Loomia', "TILE", 1e15, 7);
}
