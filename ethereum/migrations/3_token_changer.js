const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChanger = artifacts.require('./TokenChanger.sol');

var STORJ = CentrallyIssuedToken.at("0xcee82601ad015669d92100b42f665ab6d4746dda");
var TILE = CentrallyIssuedToken.at("0x8045a43fb3ff107229134c6fa8b3e8cfee722c1e");

module.exports = (deployer) => {
    deployer.deploy(TokenChanger, TILE.address, STORJ.address);
}
