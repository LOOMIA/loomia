/**
 * Truffle configuration
 *
 * @see https://github.com/trufflesuite/truffle-config/blob/master/index.js
 * @see https://github.com/trufflesuite/truffle/releases
 */
const HDWalletProvider = require('truffle-hdwallet-provider');
const cnf = require('./cnf.json');

const network   = process.env.NETWORK;
let secrets = '';

if (network === 'rinkebyInfura') {
    secrets = require('./.secrets.json');
}

require('babel-register');
require('babel-polyfill');

const path      = require('path');
const basePath  = process.cwd();

const buildDir          = path.join(basePath, 'build');
const buildDirContracts = path.join(basePath, 'build/contracts');
const srcDir            = path.join(basePath, 'src/contracts');
const testDir           = path.join(basePath, 'test/contracts');
const migrationsDir     = path.join(basePath, 'migrations/contracts');

module.exports = {
    mocha: {
        useColors: true,
        reporter: 'eth-gas-reporter',
        reporterOptions : {
            currency: 'USD',
            gasPrice: 21
        }
    },
    solc: {
        optimizer: {
            enabled:    true,
            runs:       200
        }
    },
    networks: {
        develop: {
            host:       cnf.networks.develop.host,
            port:       cnf.networks.develop.port,
            network_id: cnf.networks.develop.chainId,   // eslint-disable-line
            gas:        cnf.networks.develop.gas,
            gasPrice:   cnf.networks.develop.gasPrice
        },
        coverage: {
            host:       cnf.networks.coverage.host,
            network_id: cnf.networks.coverage.port, // eslint-disable-line
            port:       cnf.networks.coverage.chainId,
            gasPrice:   cnf.networks.coverage.gasPrice,
            gas:        cnf.networks.coverage.gas
        },
        rinkeby: getRinkebyConfig()
    },
    build_directory:            buildDir,           // eslint-disable-line
    contracts_build_directory:  buildDirContracts,  // eslint-disable-line
    migrations_directory:       migrationsDir,      // eslint-disable-line
    contracts_directory:        srcDir,             // eslint-disable-line
    test_directory:             testDir             // eslint-disable-line
};

function getRinkebyConfig() {
    let rinkebyProvider;

    if (network === 'rinkebyInfura') {
        rinkebyProvider = new HDWalletProvider(secrets.rinkeby.mnemonic, secrets.rinkeby.host);

        return {
            network_id: 3, // eslint-disable-line
            provider: rinkebyProvider,
            from: rinkebyProvider.getAddress(),
            gas: 7000000
        };
    }
}
