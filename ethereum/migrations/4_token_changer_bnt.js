var fs = require('fs');

const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChangerBNT = artifacts.require('./TokenChangerBNT.sol');

var account = web3.eth.accounts[0];

function cd_project_root() {
    while (!fs.existsSync('truffle.js'))
        process.chdir('..')
}

function unlock(wallet) {
    cd_project_root();
    var password = fs.readFileSync("password", "utf8")
                     .split('\n')[0];
    web3.personal.unlockAccount(wallet, password)
}

module.exports = (deployer, network) => {
    cd_project_root();
    var BNT;

    // for TestRPC deployments
    //var TILE = fs.readFileSync('addresses', 'utf8').split('\n')[1];

    // Rinkeby address
    var TILE = "0x25Cb4b8A72f17178c7e54129d88388bbc0cA4e90";

    if (network == "rinkeby" || network == "mainnet")
        unlock(web3.eth.accounts[0])

    deployer.then(() => {
        return CentrallyIssuedToken.new(account, 'Bancor', "BNT", 1e15, 7);
    }).then(instance => {
        BNT = instance.address;
        return TokenChangerBNT.new(TILE, BNT);
    }).then(instance => {
        var addresses = [BNT, instance.address].join('\n');
        fs.writeFileSync('addresses_bnt', addresses);
    });
}
