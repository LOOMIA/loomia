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
promises[6] = fetch('TokenChangerBNT.json').then(r => r.json());

Promise.all(promises).then(function (values) {
    var web3 = values[0];
    var addresses = values[1].split('\n');
    var tokenAbi = values[2].abi;
    var changerAbi = values[3].abi;
    var accounts = values[4];
    var networkId = values[5];
    var changerBNTAbi = values[6].abi;

    if (networkId != 4) {
        alert("You are not on Rinkeby. Please switch Metamask to Rinkeby!");
        throw "Not on Rinkeby";
    }
    var STORJ = new web3.eth.Contract(tokenAbi, addresses[0]);
    var TILE = new web3.eth.Contract(tokenAbi, addresses[1]);
    var Changer = new web3.eth.Contract(changerAbi, addresses[2]);
    var BNT = new web3.eth.Contract(tokenAbi, addresses[3]);
    var ChangerBNT = new web3.eth.Contract(changerBNTAbi, addresses[4]);

    updatePricesAndBalances();

    document.querySelector("#storj-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[0]}`
    document.querySelector("#tile-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[1]}`
    document.querySelector("#token-changer-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[2]}`
    document.querySelector("#bnt-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[3]}`
    document.querySelector("#token-changer-bnt-contract").href = 
        `https://rinkeby.etherscan.io/address/${addresses[4]}`

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

    document.querySelector("#calculate-bnt-return")
        .addEventListener('click', function () {
        var amount = document.querySelector("#bnt-tile-calc-amount").valueAsNumber;

        S = Number(document.querySelector("#contract-bnt-tile-balance")
            .textContent.replace(/,/g, ''));
        S *= 1e7;
        T = parseInt(amount * 1e7);
        W = 10;
        C = Number(document.querySelector("#contract-bnt-balance")
            .textContent.replace(/,/g, ''));
        C *= 1e7;

        var bntReturn = C * (1 - (1 - T/S)**W) / 1e7;
        var averageReturn = bntReturn / amount;
        var averageSale = amount / bntReturn;

        bntReturn = bntReturn.toFixed(7);
        averageReturn = averageReturn.toFixed(7);
        averageSale = averageSale.toFixed(7);

        document.querySelector('#bnt-return').textContent = bntReturn;
        document.querySelector('#bnt-average-return').textContent = averageReturn;
        document.querySelector('#bnt-tile-average-sale').textContent = averageSale;
    });

    document.querySelector("#calculate-bnt-tile-return")
        .addEventListener('click', function () {
        var amount = document.querySelector("#bnt-calc-amount").valueAsNumber;

        S = Number(document.querySelector("#contract-bnt-tile-balance")
            .textContent.replace(/,/g, ''));
        S *= 1e7;
        E = parseInt(amount * 1e7);
        W = .1;
        C = Number(document.querySelector("#contract-bnt-balance")
            .textContent.replace(/,/g, ''));
        C *= 1e7;

        var tileReturn = S * ((1 + E/C)**W - 1) / 1e7;
        var averageReturn = tileReturn / amount;
        var averageSale = amount / tileReturn;

        tileReturn = tileReturn.toFixed(7);
        averageReturn = averageReturn.toFixed(7);
        averageSale = averageSale.toFixed(7);

        document.querySelector('#bnt-tile-return').textContent = tileReturn;
        document.querySelector('#bnt-tile-average-return').textContent = averageReturn;
        document.querySelector('#bnt-average-sale').textContent = averageSale;
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
            .on("receipt", updatePricesAndBalances)
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

    document.querySelector("#approve-bnt").addEventListener('click', function () {
        var amount = document.querySelector("#bnt-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        BNT.methods.approve(addresses[4], amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx)
            .on("receipt", updatePricesAndBalances)
    });

    document.querySelector("#sell-bnt").addEventListener('click', function () {
        var amount = document.querySelector("#bnt-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        ChangerBNT.methods.sellBNT(amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx)
            .on("receipt", updatePricesAndBalances)
            .on("error", console.error);
    });

    document.querySelector("#approve-bnt-tile").addEventListener('click', function () {
        var amount = document.querySelector("#bnt-tile-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        TILE.methods.approve(addresses[4], amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx);
    });

    document.querySelector("#sell-bnt-tile").addEventListener('click', function () {
        var amount = document.querySelector("#bnt-tile-sell-amount").valueAsNumber;
        amount = parseInt(amount * 1e7);
        ChangerBNT.methods.sellTile(amount).send({ from: accounts[0] })
            .on("transactionHash", displayTx) 
            .on("receipt", updatePricesAndBalances)
            .on("error", console.log);
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

        var url = "https://min-api.cryptocompare.com/data/price?fsym=BNT&tsyms=USD";
        fetch(url).then(r => r.json()).then(price => {
            document.querySelector("#bnt-price").textContent = price.USD;
        });

        Changer.methods.storjPrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#storj-price-in-tile").textContent = price;
        });

        Changer.methods.tilePrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#tile-price-in-storj").textContent = price;
        });

        ChangerBNT.methods.BNTPrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#bnt-price-in-tile").textContent = price;
        });

        ChangerBNT.methods.tilePrice().call().then(price => {
            price = price / 1e7;
            document.querySelector("#tile-price-in-bnt").textContent = price;
        });

        // contract balances
        STORJ.methods.balanceOf(addresses[2]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#contract-storj-balance").textContent = bal;
        });

        TILE.methods.balanceOf(addresses[2]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#contract-tile-balance").textContent = bal;
            document.querySelector("#contract-bnt-tile-balance").textContent = bal;
        });

        BNT.methods.balanceOf(addresses[4]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#contract-bnt-balance").textContent = bal;
        });

        TILE.methods.balanceOf(addresses[4]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#contract-bnt-tile-balance").textContent = bal;
        });

        // wallet balances
        STORJ.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#wallet-storj-balance").textContent = bal;
        });

        TILE.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#wallet-tile-balance").textContent = bal;
            document.querySelector("#wallet-bnt-tile-balance").textContent = bal;
        });

        BNT.methods.balanceOf(accounts[0]).call().then(bal => {
            bal = numberWithCommas(bal / 1e7);
            document.querySelector("#wallet-bnt-balance").textContent = bal;
        });

        // contract allowances
        TILE.methods.allowance(accounts[0], addresses[2]).call().then(num => {
            num = numberWithCommas(num / 1e7);
            document.querySelector("#tile-allowance").textContent = num;
        });

        STORJ.methods.allowance(accounts[0], addresses[2]).call().then(num => {
            num = numberWithCommas(num / 1e7);
            document.querySelector("#storj-allowance").textContent = num;
        });

        TILE.methods.allowance(accounts[0], addresses[4]).call().then(num => {
            num = numberWithCommas(num / 1e7);
            document.querySelector("#bnt-tile-allowance").textContent = num;
        });

        BNT.methods.allowance(accounts[0], addresses[4]).call().then(num => {
            num = numberWithCommas(num / 1e7);
            document.querySelector("#bnt-allowance").textContent = num;
        });
    }
});

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
