/**
* @title TILE Token - LOOMIA
 * @author Pactum IO <dev@pactum.io>
*/
pragma solidity ^0.4.19;

import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";


contract TileToken is StandardToken {
    string public constant NAME = "LOOMIA TILE";
    string public constant SYMBOL = "TILE";
    uint8 public constant DECIMALS = 18;

    uint256 public totalSupply = 1046 * 1e24; // Supply is 1,046,000,000 plus the conversion to wei

    /**
    * @dev Constructor
    */
    function TileToken() public {
        balances[msg.sender] = totalSupply;
    }
}
