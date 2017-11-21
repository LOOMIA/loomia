var fs = require('fs');
const CentrallyIssuedToken = artifacts.require('./CentrallyIssuedToken.sol');
const TokenChangerBNT = artifacts.require('./TokenChangerBNT.sol');

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
    TILE = CentrallyIssuedToken.at(addresses[1]);

    addresses = fs.readFileSync("addresses_bnt", "utf8").split('\n');
    BNT = CentrallyIssuedToken.at(addresses[0]);
    changer = TokenChangerBNT.at(addresses[1]);
    
    // 50K BNT, 4M TILE held in contract to start
    // I'm assuming TILE at $0.25 and BNT at $2.00
    // So $100K BNT, $1M TILE
    BNT.transfer(changer.address, 5e11, { from: web3.eth.accounts[0] });
    TILE.transfer(changer.address, 4e13, { from: web3.eth.accounts[0] });

    // Transfer 100 TILE and 40 BNT to user
    TILE.transfer(web3.eth.accounts[1], 1e9, { from: web3.eth.accounts[0] });
    BNT.transfer(web3.eth.accounts[1], 4e8, { from: web3.eth.accounts[0] });

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

    // Approve 40 BNT to TokenChanger
    prom = BNT.approve(changer.address, 0, { from: web3.eth.accounts[1] });
    logErr('BNT approve', prom);
    prom = BNT.approve(changer.address, 4e8, { from: web3.eth.accounts[1] });
    logErr('BNT approve', prom);

    // Sell 40 BNT
    prom = changer.sellBNT(4e8, { 
        from: web3.eth.accounts[1], 
        gas: 200e3 
    });
    logErr('sell BNT', prom);

    setTimeout(() => {
        log('BNT price', changer.BNTPrice())
        log('tile price', changer.tilePrice())
        log('contract BNT balance', BNT.balanceOf(changer.address))
        log('contract tile balance', TILE.balanceOf(changer.address))
        log('user BNT balance', BNT.balanceOf(web3.eth.accounts[1]))
        log('user tile balance', TILE.balanceOf(web3.eth.accounts[1]))
    }, 500);
    
    callback();
}
