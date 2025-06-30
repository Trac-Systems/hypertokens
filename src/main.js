import {getStorePath} from './functions.js';
import {App} from './app.js';
export * from 'trac-peer/src/functions.js'
import {default as HypertokensProtocol} from "../contract/protocol.js";
import {default as HypertokensContract} from "../contract/contract.js";
import fs from 'fs';

console.log('Storage path:', getStorePath());

const msb_opts = {};
msb_opts.bootstrap = 'a4951e5f744e2a9ceeb875a7965762481dab0a7bb0531a71568e34bf7abd2c53';
msb_opts.channel = '0002tracnetworkmainsettlementbus';
msb_opts.store_name = getStorePath() + '/hypertokens-msb';

const peer_opts = {};
peer_opts.protocol = HypertokensProtocol;
peer_opts.contract = HypertokensContract;
peer_opts.bootstrap = 'c8d69852fe7828709349a68c61c3d88ab9078ec4331e07ebaaf1e8b55e67a287';
peer_opts.channel = '000000000000000000000hypertokens';
peer_opts.store_name = getStorePath() + '/hypertokens2';
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

// upgrade 3 to 4
const __old_path = getStorePath() + "/hypertokens";
const __new_path = peer_opts.store_name;
if(false === fs.existsSync(__new_path + '/db') &&
    true === fs.existsSync(__old_path + '/db/keypair.json')){
    fs.mkdirSync(__new_path);
    fs.mkdirSync(__new_path + '/db');
    fs.copyFileSync(__old_path + '/db/keypair.json', __new_path  + '/db/keypair.json');
    fs.rmSync(__old_path, { recursive: true, force: true });
}

export const app = new App(msb_opts, peer_opts);
await app.start();