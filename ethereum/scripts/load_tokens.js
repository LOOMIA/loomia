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
    addresses = fs.readFileSync("addresses", "utf8").split('\n');

    STORJ = CentrallyIssuedToken.at(addresses[0]);
    TILE = CentrallyIssuedToken.at(addresses[1]);
    changer = TokenChanger.at(addresses[2]);
    
    // 200K Storj, 4M TILE held in contract to start
    // I'm assuming TILE at $0.25 and Storj at $0.50
    // So $100K Storj, $1M TILE
    STORJ.transfer(changer.address, 2e12, { from: web3.eth.accounts[0] });
    TILE.transfer(changer.address, 4e13, { from: web3.eth.accounts[0] });

    // Transfer 100 TILE to user
    TILE.transfer(web3.eth.accounts[1], 1e9, { from: web3.eth.accounts[0] });

    // Approve 100 TILE to TokenChanger
    prom = TILE.approve(changer.address, 0, { from: web3.eth.accounts[1] });
    logErr('tile approve', prom);
    prom = TILE.approve(changer.address, 1e9, { from: web3.eth.accounts[1] });
    logErr('tile approve', prom);

    // Sell 100 TILE
    prom = changer.sellTile(1e9, { 
        from: web3.eth.accounts[1], 
        gas: 200e3 
    });
    logErr('sell tile', prom);

    // Approve 40 STORJ to TokenChanger
    prom = STORJ.approve(changer.address, 0, { from: web3.eth.accounts[1] });
    logErr('storj approve', prom);
    prom = STORJ.approve(changer.address, 4e8, { from: web3.eth.accounts[1] });
    logErr('storj approve', prom);

    // Sell 40 STORJ
    prom = changer.sellStorj(4e8, { 
        from: web3.eth.accounts[1], 
        gas: 200e3 
    });
    logErr('sell storj', prom);

    setTimeout(() => {
        log('storj price', changer.storjPrice())
        log('tile price', changer.tilePrice())
        log('contract storj balance', STORJ.balanceOf(addresses[2]))
        log('contract tile balance', TILE.balanceOf(addresses[2]))
        log('user storj balance', STORJ.balanceOf(web3.eth.accounts[1]))
        log('user tile balance', TILE.balanceOf(web3.eth.accounts[1]))
    }, 500);
    
    callback();
}
