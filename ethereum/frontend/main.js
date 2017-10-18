var Web3 = require('web3');

var promises = []
promises[0] = new Promise(function (resolve, reject) {
    var interval = setInterval(function () {
        if (typeof web3 !== 'undefined') {
            clearInterval(interval);
            var web3_latest = new Web3(web3.currentProvider);
            resolve(web3_latest);
        }
    }, 50);
});

promises[1] = fetch('rinkeby_addresses').then(r => r.text());
promises[2] = fetch('CentrallyIssuedToken.json').then(r => r.json());
promises[3] = fetch('TokenChanger.json').then(r => r.json());
promises[4] = promises[0].then(web3 => web3.eth.getAccounts());
promises[5] = promises[0].then(web3 => web3.eth.net.getId());

Promise.all(promises).then(function (values) {
    var web3 = values[0];
    var addresses = values[1].split('\n');
    var tokenAbi = values[2].abi;
    var changerAbi = values[3].abi;
    var accounts = values[4];
    var networkId = values[5];

    if (networkId != 4) {
        alert("You are not on Rinkeby. Please switch Metamask to Rinkeby!");
        throw "Not on Rinkeby";
    }
    var STORJ = new web3.eth.Contract(tokenAbi, addresses[0]);
    var TILE = new web3.eth.Contract(tokenAbi, addresses[1]);
    var Changer = new web3.eth.Contract(changerAbi, addresses[2]);

    updatePricesAndBalances();

    document.querySelector("#calculate-storj-return")




    function updatePricesAndBalances () {
        var url = "https://min-api.cryptocompare.com/data/price?fsym=STORJ&tsyms=USD";
        fetch(url).then(r => r.json()).then(price => {
            document.querySelector("#storj-price").textContent = price.USD;
        });

        Changer.methods.storjPrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#tile-price-in-storj").textContent = price;
        });

        Changer.methods.tilePrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#storj-price-in-tile").textContent = price;
        });

        STORJ.methods.balanceOf(addresses[2]).call().then(bal => {
            bal = bal / 1e7;
            document.querySelector("#contract-storj-balance").textContent = bal;
        });

        TILE.methods.balanceOf(addresses[2]).call().then(bal => {
            bal = bal / 1e7;
            document.querySelector("#contract-tile-balance").textContent = bal;
        });

        STORJ.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = bal / 1e7;
            document.querySelector("#wallet-storj-balance").textContent = bal;
        });

        TILE.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = bal / 1e7;
            document.querySelector("#wallet-tile-balance").textContent = bal;
        });
    }
});

