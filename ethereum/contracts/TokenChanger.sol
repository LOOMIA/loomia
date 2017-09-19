pragma solidity ^0.4.15;

import './CentrallyIssuedToken.sol';

contract TokenChanger {
    
    address owner; 
    CentrallyIssuedToken TILE;
    CentrallyIssuedToken STORJ;

    // target for STORJ/LOOMIA price 
    uint TARGET_PRICE_RATIO = 4; 

    function TokenChanger (address tileContract, address storjContract) {
        owner = msg.sender;
        TILE = CentrallyIssuedToken(tileContract);
        STORJ = CentrallyIssuedToken(storjContract);
    }

    function tileBalance () constant returns (uint) {
        return TILE.balanceOf(address(this));
    }

    function storjBalance () constant returns (uint) {
        return STORJ.balanceOf(address(this));
    }

    // price of STORJ in TILE
    function storjPrice () constant returns (uint) {
        return storjBalance() * 1e7 * TARGET_PRICE_RATIO / tileBalance();
    }

    // price of TILE in STORJ 
    function tilePrice () constant returns (uint) {
        return tileBalance() * 1e7 / TARGET_PRICE_RATIO / storjBalance();
    }

    // user has to approve contract to transfer funds before
    // running this function or it will throw an error
    function buyTile(uint quantity) {
        uint price = tilePrice() * quantity / 1e7;
        bool success = STORJ.transferFrom(msg.sender, address(this), price);
        require(success);
        success = TILE.transfer(msg.sender, quantity);
        require(success);
    }

    function buyStorj (uint quantity) {
        uint price = storjPrice() * quantity / 1e7;
        bool success = TILE.transferFrom(msg.sender, address(this), price);
        require(success);
        success = STORJ.transfer(msg.sender, quantity);
        require(success);
    }
}
