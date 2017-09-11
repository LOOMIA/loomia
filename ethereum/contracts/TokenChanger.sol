pragma solidity ^0.4.4;

import './CentrallyIssuedToken.sol';

contract TokenChanger {
    
    address owner; 
    CentrallyIssuedToken TILE;
    CentrallyIssuedToken STORJ;

    // target for STORJ/LOOMIA price 
    uint TARGET_PRICE_RATIO = 4; 

    function TokenChanger (address tileContract, address storjContract) {
        owner = msg.sender;
        tileContract = CentrallyIssuedToken(tileContract);
        storjContract = CentrallyIssuedToken(storjContract);
    }

    function tileBalance () constant returns (uint) {
        return TILE.balanceOf(address(this));
    }

    function storjBalance () constant returns (uint) {
        return STORJ.balanceOf(address(this));
    }

    // price of STORJ in TILE
    function storjPrice () constant returns (uint) {
        return storjBalance() * TARGET_PRICE_RATIO / tileBalance();
    }

    // price of TILE in STORJ 
    function tilePrice () constant returns (uint) {
        return tileBalance() / TARGET_PRICE_RATIO / storjBalance();
    }
}
