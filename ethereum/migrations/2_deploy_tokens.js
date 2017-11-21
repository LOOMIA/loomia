const CentralToken = artifacts.require('./CentrallyIssuedToken.sol');
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

module.exports = (deployer) => {
    deployer.deploy(CentralToken, account, 'Storj', "STORJ", 1e15, 7);
    deployer.deploy(CentralToken, account, 'Loomia', "TILE", 1e15, 7);
}
