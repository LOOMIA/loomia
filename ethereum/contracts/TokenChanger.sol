pragma solidity ^0.4.15;

import './CentrallyIssuedToken.sol';

contract TokenChanger {
    
    address owner; 
    CentrallyIssuedToken TILE;
    CentrallyIssuedToken STORJ;

    uint RESERVE_RATIO = 10; 
    uint DECIMAL_PLACES = 7;

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
        return tileBalance() * 10**DECIMAL_PLACES / 
               (storjBalance() * RESERVE_RATIO);
    }

    // price of TILE in STORJ 
    function tilePrice () constant returns (uint) {
        return storjBalance() * 10**DECIMAL_PLACES * RESERVE_RATIO / 
               tileBalance();
    }

    // User has to approve TILE contract to transfer funds before
    // running this function or it will throw an error. 
    // Later on, if the token changer is part the TILE contract, 
    // no approval would be required
    function buyTile(uint quantity) {
        uint price = tilePrice() * quantity / 1e7;
        bool success = STORJ.transferFrom(msg.sender, address(this), price);
        require(success);
        success = TILE.transfer(msg.sender, quantity);
        require(success);
    }

    // user has to approve STORJ contract to transfer funds before
    // running this function or it will throw an error
    function buyStorj (uint quantity) {
        uint price = storjPrice() * quantity / 1e7;
        bool success = TILE.transferFrom(msg.sender, address(this), price);
        require(success);
        success = STORJ.transfer(msg.sender, quantity);
        require(success);
    }
}
