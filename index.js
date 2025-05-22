import {getStorePath} from './src/functions.js';
import {App} from './src/app.js';
export * from 'trac-peer/src/functions.js'
import {default as Trac20Protocol} from "./contract/protocol.js";
import {default as Trac20Contract} from "./contract/contract.js";

console.log('Storage path:', getStorePath());

const msb_opts = {};
msb_opts.bootstrap = '54c2623aa400b769b2837873653014587278fb83fd72e255428f78a4ff7bac87';
msb_opts.channel = '00000000000000000000000trac20msb';
msb_opts.store_name = getStorePath() + '/t20msb';

const peer_opts = {};
peer_opts.protocol = Trac20Protocol;
peer_opts.contract = Trac20Contract;
peer_opts.bootstrap = '393c7f1803d5301bab7da4cb61814b89b0934c002572a418c3c2f4645789a6e0';
peer_opts.channel = '00000000000000000000000000trac20';
peer_opts.store_name = getStorePath() + '/trac20';
peer_opts.enable_logs = true;
peer_opts.enable_txlogs = true;

export const app = new App(msb_opts, peer_opts);
await app.start();
