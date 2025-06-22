import {getStorePath} from './functions.js';
import {App} from './app.js';
export * from 'trac-peer/src/functions.js'
import {default as HypertokensProtocol} from "../contract/protocol.js";
import {default as HypertokensContract} from "../contract/contract.js";
import {default as Migration} from "../features/migration/index.js"
//import {default as HypertokensRestApi} from "../features/rest_api/index.js"
//import {TapHypertokens} from "trac-features";
import fs from 'fs';

console.log('Storage path:', getStorePath());

const msb_opts = {};
msb_opts.bootstrap = '54c2623aa400b769b2837873653014587278fb83fd72e255428f78a4ff7bac87';
msb_opts.channel = '00000000000000000000000trac20msb';
msb_opts.store_name = getStorePath() + '/t20msb_2';

const peer_opts = {};
peer_opts.protocol = HypertokensProtocol;
peer_opts.contract = HypertokensContract;
peer_opts.bootstrap = '57372701bfe54a1c2c09fc322b8fd7e3ac8261fd142fa088a6829b1db5c6ad3e';
peer_opts.channel = '000000000000000000000hypertokens';
peer_opts.store_name = getStorePath() + '/hypertokens';
peer_opts.enable_logs = true;
peer_opts.enable_txlogs = true;

// upgrade 1 to 2
const old_path = getStorePath() + "/trac20";
const new_path = peer_opts.store_name;
if(false === fs.existsSync(new_path + '/db') &&
    true === fs.existsSync(old_path + '/db/keypair.json')){
    fs.mkdirSync(new_path);
    fs.mkdirSync(new_path + '/db');
    fs.copyFileSync(old_path + '/db/keypair.json', new_path  + '/db/keypair.json');
    fs.rmSync(old_path, { recursive: true, force: true });
}

// upgrade 2 to 3
const _old_path = getStorePath() + "/trac20_2";
const _new_path = peer_opts.store_name;
if(false === fs.existsSync(_new_path + '/db') &&
    true === fs.existsSync(_old_path + '/db/keypair.json')){
    fs.mkdirSync(_new_path);
    fs.mkdirSync(_new_path + '/db');
    fs.copyFileSync(_old_path + '/db/keypair.json', _new_path  + '/db/keypair.json');
    fs.rmSync(_old_path, { recursive: true, force: true });
}

///// OPTIONAL FEATURE SETUP
const tap_opts = {};
tap_opts.api_host = "taprest.trac.network";
tap_opts.max_records = 100;
tap_opts.start_block = 901070;
tap_opts.block_distance = 0;
tap_opts.authority_address =
    "bc1pnqn66qhldwys4e5neyh8vqunat6jwng457f0h39rxyc0r90vwucq5t4pdd";
tap_opts.authority_inscription =
    "a497054657b33d0ee93c06f8b3ec2baac50fd01fb930788b43760a407815636ei0";
tap_opts.authority_key_path = "keys.txt";

const rest_opts = {};
rest_opts.enabled = true;
rest_opts.port = 3000;
rest_opts.host = 'localhost';

export const app = new App(msb_opts, peer_opts, [
    /*{
        name : 'tap_hypertokens',
        class : TapHypertokens,
        opts : tap_opts
    },*/
    {
        name : 'migration',
        class : Migration
    },
    /*{
        name : 'restapi',
        class : HypertokensRestApi,
        opts : rest_opts
    }*/
]);
await app.start();