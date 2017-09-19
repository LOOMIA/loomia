var fs = require('fs');
const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChanger = artifacts.require('./TokenChanger.sol');

function cd_project_root() {
    while (!fs.existsSync('truffle.js'))
        process.chdir('..')
}

function log(name, promise) {
    logErr(name, promise);
    logResponse(name, promise);
}

function logErr(name, promise) {
    promise.catch(err => console.log(name, err));
}

function logResponse(name, promise) {
    promise.then(value => console.log(name, value))
}
    

module.exports = function (callback) {
    cd_project_root();
    addresses = fs.readFileSync("contracts/addresses", "utf8").split('\n');

    STORJ = CentrallyIssuedToken.at(addresses[0]);
    TILE = CentrallyIssuedToken.at(addresses[1]);
    changer = TokenChanger.at(addresses[2]);
    
    STORJ.transfer(changer.address, 1e12, { from: web3.eth.accounts[0] });
    TILE.transfer(changer.address, 1e11, { from: web3.eth.accounts[0] });

    TILE.transfer(web3.eth.accounts[1], 1e9, { from: web3.eth.accounts[0] });
    prom = TILE.approve(changer.address, 0, { from: web3.eth.accounts[1] });
    logErr('tile approve', prom);
    prom = TILE.approve(changer.address, 1e9, { from: web3.eth.accounts[1] });
    logErr('tile approve', prom);

    prom = changer.buyStorj(1e7, { 
        from: web3.eth.accounts[1], 
        gas: 200e3 
    });
    logErr('buy storj', prom);

    setTimeout(() => {
        log('storj price', changer.storjPrice())
        log('tile price', changer.tilePrice())
        log('storj balance', STORJ.balanceOf(web3.eth.accounts[1]))
        log('tile balance', TILE.balanceOf(web3.eth.accounts[1]))
    }, 500);
    
    callback();
}
