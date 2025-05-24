import {getStorePath} from './src/functions.js';
import {App} from './src/app.js';
export * from 'trac-peer/src/functions.js'
import {default as Trac20Protocol} from "./contract/protocol.js";
import {default as Trac20Contract} from "./contract/contract.js";
import {default as Migration} from "./features/migration/index.js"
import fs from 'fs';

console.log('Storage path:', getStorePath());

const msb_opts = {};
msb_opts.bootstrap = '54c2623aa400b769b2837873653014587278fb83fd72e255428f78a4ff7bac87';
msb_opts.channel = '00000000000000000000000trac20msb';
msb_opts.store_name = getStorePath() + '/t20msb_2';

const peer_opts = {};
peer_opts.protocol = Trac20Protocol;
peer_opts.contract = Trac20Contract;
peer_opts.bootstrap = 'c8d69852fe7828709349a68c61c3d88ab9078ec4331e07ebaaf1e8b55e67a287';
peer_opts.channel = '00000000000000000000000002trac20';
peer_opts.store_name = getStorePath() + '/trac20_2';
peer_opts.enable_logs = false;
peer_opts.enable_txlogs = false;

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

export const app = new App(msb_opts, peer_opts, [
    {
        name : 'migration',
        class : Migration
    }
]);
await app.start();
