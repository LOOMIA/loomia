# LOOMIA - TILE Token - Distribution
This project is a standard ERC20 token and distribution constructed for LOOMIA and their TILE token.
There is no crowdsale as the sale was conducted privately off chain.
The `TileDistrubtion` smart contract is deployed to the mainnet which does the following:
* creates the TILE token contract
* creates the Token Vesting contract
* creates the Token Timelock contract
* provide functions, via onlyOwner, to distribute tokens to valid ETH addresses
This contract does not accept payment of any kind, and will reject any payments made to the fallback function.

## Requirements
The server side scripts requires NodeJS 8.
Go to [NodeJS](https://nodejs.org/en/download/) and install the appropriate version for your system.

Yarn is required to be installed globally to minimize the risk of dependency issues.
Go to [Yarn](https://yarnpkg.com/en/docs/install) and choose the right installer for your system.

Depending on your system the following components might be already available or have to be provided manually:
* Python 2.7
* make (on Ubuntu this is part of the commonly installed `sudo apt-get install build-essential`)
* On OSX the build tools included in XCode are required

## General
Before running the provided scripts, you have to initialize your current terminal via `source ./tools/initShell.sh` for every terminal in use. This will add the current directory to the system PATH variables and must be repeated for time you start a new terminal window from project base directory.

For Windows, use `./tools/initShell.ps1`.

__Every command must be executed from within the projects base directory!__

## Setup
Open your terminal and change into your project base directory. From here, install all needed dependencies.
```
cd <project base directory>
source ./tools/initShell.sh
yarn install
```
This will install all required dependecies in the directory _node_modules_.

For Windows

Open up Powershell and change into your project base directory. From here, install all needed dependencies.

```
cd <project base directory>
.\tools\initShell.ps1
yarn install
```
Note: Windows users may run into an error:
```
.\tools\initShell.ps1 is not digitally signed. You cannot run this script on the current system.
For more information about running scripts and setting execution policy, see about_Execution_Policies at
https:/go.microsoft.com/fwlink/?LinkID=135170. At line:1 char:1 + .\tools\initShell.ps1
```
If you get this error you have to change permissions first. Run PowerShell as admin and run:

`Set-ExecutionPolicy Unrestricted `

Enter ‘Y’ for yes and exit. You should now be able to run the previous script.



## Compile, migrate and run unit tests
To deploy the ICO smart contracts, go into the projects root directory, and change into the truffle development console.
```
cd <project base directory>
source ./tools/initShell.sh
yarn run dev
```
For Windows users: When running you may get a pop-up asking you if you really want to open the .js file. This is an issue, but we can fix it!
Search for"Advance System Settings"
When in "Advance System Settings" click on "Enviromental Variables" under the Advanced tab.
Under System variables, look for 'PATHEXT' Edit 'PATHEXT' to remove the '.JS' from the list. You should be good to run.

Now you can compile, migrate and run tests.
```
# Compile contract
compile

# Migrate contract
migrate

# Test the contract
test
```
__The development console will automatically start it's own TestRPC server for you!__


__Because the test consumes a lot of ETH, please restart the development console between each test!__

## Infura - Rinkeby Deployment Setup
Depends on the `.secrets.json` file that must be manually created when initally created.
This file name is added to the `.gitignore` file so it never get's pushed to GitHub as it contains your mnemonic key!

.secrect.json file:
```
{
    "ropsten": {
        "host": "https://ropsten.infura.io/<INFURA KEY>",
        "mnemonic": "<MNEMONIC KEY>"
    },
    "rinkeby": {
        "host": "https://rinkeby.infura.io/<INFURA KEY>",
        "mnemonic": "<MNEMONIC KEY>"
    },
    "kovan": {
        "host": "https://kovan.infura.io/<INFURA KEY>",
        "mnemonic": "<MNEMONIC KEY>"
    }
}
```
