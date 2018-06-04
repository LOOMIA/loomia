/**
 * @title TILE Token Distribution - LOOMIA
 * @author Pactum IO <dev@pactum.io>
 */
pragma solidity ^0.4.19;

import "../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/TokenVesting.sol";
import "./TileToken.sol";

contract TileDistribution is Ownable {
    using SafeMath for uint256;

    /*** CONSTANTS ***/
    uint256 public constant VESTING_DURATION = 2 years;
    uint256 public constant VESTING_TKN_AMOUNT =  1046 * 1e6 * 1e18 * 0.15; // 15% of total tokens will be vested
    uint256 public constant VESTING_START_TIME = 1504224000; // Friday, September 1, 2017 12:00:00 AM
    uint256 public constant VESTING_CLIFF = 26 weeks; // 6 month cliff-- 52 weeks/2
    uint256 public constant TIMELOCK_DURATION = 1 years;
    uint256 public constant TIMELOCK_TKN_AMOUNT = 1046 * 1e6 * 1e18 * 0.05; // 5% of total tokens will be timelocked

    /*** VARIABLES ***/
    ERC20Basic public token; // The token being distributed
    address[5] public tokenVestingAddresses; // address array for easy of access
    address public tokenTimelockAddress;

    /*** EVENTS ***/
    event AirDrop(address indexed _beneficiaryAddress, uint256 _amount);

    /*** MODIFIERS ***/
    modifier validAddressAmount(address _beneficiaryWallet, uint256 _amount) {
        require(_beneficiaryWallet != address(0));
        require(_amount != 0);
        _;
    }

    /**
     * @dev Constructor
     * @param _vestingAddress list of beneficiary addresses of the vesting account
     * @param _timelockAddress the beneficiary address for the timelock account
     */
    function TileDistribution(address[] _vestingAddress, address _timelockAddress) public {
        token = createTokenContract();
        createVestingContract(_vestingAddress);
        createTimeLockContract(_timelockAddress);
    }

    /**
    * @dev fallback function - do not accept payment
    */
    function () external payable {
        revert();
    }

    /*** PUBLIC || EXTERNAL ***/

    /**
     * @dev This function is the batch send function for Token distribution. It accepts an array of addresses and amounts
     * @param _beneficiaryWallets the address where tokens will be deposited into
     * @param _amounts the token amount in wei to send to the associated beneficiary
     */
    function batchDistributeTokens(address[] _beneficiaryWallets, uint256[] _amounts) external onlyOwner {
        require(_beneficiaryWallets.length == _amounts.length);
        for (uint i = 0; i < _beneficiaryWallets.length; i++) {
            distributeTokens(_beneficiaryWallets[i], _amounts[i]);
        }
    }

    /**
     * @dev Single token airdrop function. It is for a single transfer of tokens to beneficiary
     * @param _beneficiaryWallet the address where tokens will be deposited into
     * @param _amount the token amount in wei to send to the associated beneficiary
     */
    function distributeTokens(address _beneficiaryWallet, uint256 _amount) public onlyOwner validAddressAmount(_beneficiaryWallet, _amount) {
        token.transfer(_beneficiaryWallet, _amount);
        emit AirDrop(_beneficiaryWallet, _amount);
    }

    /**
     * @dev returns number of elements in the tokenVestingAddresses array
     */
    function getTokenVestingAddressesLength() external view returns (uint256) {
        return tokenVestingAddresses.length;
    }

    /*** INTERNAL || PRIVATE ***/

    /**
     * @dev Creates the Vesting contracts to secure a percentage of tokens to be redistributed incrementally over time.
     * @param _beneficiaryWallet address[] to distribute tokens.
     */
    function createVestingContract(address[] _beneficiaryWallet) private {
        require(_beneficiaryWallet.length == 5);
        uint256 balance = VESTING_TKN_AMOUNT.div(_beneficiaryWallet.length);
        for (uint i = 0; i < _beneficiaryWallet.length; i++)
        {
            TokenVesting newVault = new TokenVesting(_beneficiaryWallet[i], VESTING_START_TIME, VESTING_CLIFF, VESTING_DURATION, false);
            tokenVestingAddresses[i] = address(newVault);
            token.transfer(address(newVault), balance);
        }
    }

     /**
     * @dev Creates the Timelock contract to secure a precentage of tokens for the predefined duration.
     * @param _beneficiaryWallet address to release locked tokens
     */
    function createTimeLockContract(address _beneficiaryWallet) private {
        require(_beneficiaryWallet != address(0));
        TokenTimelock timelock = new TokenTimelock(token, _beneficiaryWallet, now.add(TIMELOCK_DURATION));
        tokenTimelockAddress = address(timelock);
        token.transfer(tokenTimelockAddress, TIMELOCK_TKN_AMOUNT);
    }

    /**
     * Creates the Tile token contract
     * Called by the constructor
     */
    function createTokenContract() private returns (ERC20Basic) {
        return new TileToken();
    }
}
