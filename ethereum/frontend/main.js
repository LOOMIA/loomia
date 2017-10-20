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

    document.querySelector("#storj-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[0]}`
    document.querySelector("#tile-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[1]}`
    document.querySelector("#token-changer-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[2]}`

    document.querySelector("#calculate-storj-return")
        .addEventListener('click', function () {
        var amount = document.querySelector("#tile-calc-amount").valueAsNumber;

        S = Number(document.querySelector("#contract-tile-balance")
            .textContent.replace(/,/g, ''));
        S *= 1e7;
        T = parseInt(amount * 1e7);
        W = 10;
        C = Number(document.querySelector("#contract-storj-balance")
            .textContent.replace(/,/g, ''));
        C *= 1e7;

        var storjReturn = C * (1 - (1 - T/S)**W) / 1e7;
        var averageReturn = storjReturn / amount;
        var averageSale = amount / storjReturn;

        storjReturn = storjReturn.toFixed(7);
        averageReturn = averageReturn.toFixed(7);
        averageSale = averageSale.toFixed(7);

        document.querySelector('#storj-return').textContent = storjReturn;
        document.querySelector('#storj-average-return').textContent = averageReturn;
        document.querySelector('#tile-average-sale').textContent = averageSale;
    });

    document.querySelector("#calculate-tile-return")
        .addEventListener('click', function () {
        var amount = document.querySelector("#storj-calc-amount").valueAsNumber;

        S = Number(document.querySelector("#contract-tile-balance")
            .textContent.replace(/,/g, ''));
        S *= 1e7;
        E = parseInt(amount * 1e7);
        W = .1;
        C = Number(document.querySelector("#contract-storj-balance")
            .textContent.replace(/,/g, ''));
        C *= 1e7;

        var tileReturn = S * ((1 + E/C)**W - 1) / 1e7;
        var averageReturn = tileReturn / amount;
        var averageSale = amount / tileReturn;

        tileReturn = tileReturn.toFixed(7);
        averageReturn = averageReturn.toFixed(7);
        averageSale = averageSale.toFixed(7);

        document.querySelector('#tile-return').textContent = tileReturn;
        document.querySelector('#tile-average-return').textContent = averageReturn;
        document.querySelector('#storj-average-sale').textContent = averageSale;
    });

    document.querySelector("#approve-tile").addEventListener('click', function () {
        var amount = document.querySelector("#tile-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        TILE.methods.approve(addresses[2], amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx);
    });

    document.querySelector("#sell-tile").addEventListener('click', function () {
        var amount = document.querySelector("#tile-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        Changer.methods.sellTile(amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx) 
            .on("receipt", function () {
                console.log('here');
                updatePricesAndBalances(); 
            })
            .on("error", console.log);
    });

    document.querySelector("#approve-storj").addEventListener('click', function () {
        var amount = document.querySelector("#storj-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        STORJ.methods.approve(addresses[2], amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx)
            .on("receipt", updatePricesAndBalances)
    });

    document.querySelector("#sell-storj").addEventListener('click', function () {
        var amount = document.querySelector("#storj-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        Changer.methods.sellStorj(amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx)
            .on("receipt", updatePricesAndBalances)
            .on("error", console.error);
    });

    document.querySelector("#update-balances", updatePricesAndBalances); 

    function displayTx(tx) {
        var url = "https://rinkeby.etherscan.io/tx/" + tx;
        var html = `<a href=${url}>${tx}</a>`;
        document.querySelector("#tx-hash").innerHTML = html;
    }

    function updatePricesAndBalances () {
        var url = "https://min-api.cryptocompare.com/data/price?fsym=STORJ&tsyms=USD";
        fetch(url).then(r => r.json()).then(price => {
            document.querySelector("#storj-price").textContent = price.USD;
        });

        Changer.methods.storjPrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#storj-price-in-tile").textContent = price;
        });

        Changer.methods.tilePrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#tile-price-in-storj").textContent = price;
        });

        STORJ.methods.balanceOf(addresses[2]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#contract-storj-balance").textContent = bal;
        });

        TILE.methods.balanceOf(addresses[2]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#contract-tile-balance").textContent = bal;
        });

        STORJ.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#wallet-storj-balance").textContent = bal;
        });

        TILE.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#wallet-tile-balance").textContent = bal;
        });

        TILE.methods.allowance(accounts[0], addresses[2]).call().then(num => {
            num = numberWithCommas(num / 1e7);
            document.querySelector("#tile-allowance").textContent = num;
        });

        STORJ.methods.allowance(accounts[0], addresses[2]).call().then(num => {
            num = numberWithCommas(num / 1e7);
            document.querySelector("#storj-allowance").textContent = num;
        });
    }
});

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
