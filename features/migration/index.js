import {Feature} from 'trac-peer';
import fs from 'fs'
import readline from 'readline'

export class Migration extends Feature {

    constructor(peer, options = {}) {
        super(peer, options);
    }

    async start(options = {}) {
        // migration1 (fork) from first version, executed once.
        // the reason for the migration was due to a bug in the transfer function, leading to mint beyond supply.
        // the migration data can be found in the root folder of this project and represents a cleaned version of
        // balances and deployments.
        const _this = this;

        async function migration1(){
            if(_this.peer.wallet.publicKey !== await _this.get('admin') ||
                false === _this.peer.base.writable) return;
            if(true === await _this.get('migration1')) return;

            const fileStream = fs.createReadStream('migration1.txt');

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            for await (const line of rl) {
                const _line = JSON.parse(line);
                switch(_line.val.type){
                    case 'deploy':
                        const tick = _line.val.value.tick;
                        const amt = _line.val.value.amt;
                        const supply = _line.val.value.supply;
                        const dec = _line.val.value.dec;
                        const value = {};
                        value.op = 'deploy';
                        value.tick = tick;
                        value.amt = amt;
                        value.supply = supply;
                        value.dec = dec;
                        value.signed = false;
                        value.dta = null;
                        value.initiator = _line.ipk;
                        await _this.append('deploy_'+JSON.stringify(tick), value);
                        break;
                    case 'mint':
                        const mint_tick = _line.val.value.tick;
                        const mint_value = {};
                        mint_value.op = 'mint';
                        mint_value.tick = mint_tick;
                        mint_value.sig = null;
                        mint_value.nonce = null;
                        mint_value.dta = null;
                        mint_value.initiator = _line.ipk;
                        await _this.append('mint_'+JSON.stringify(mint_tick), mint_value);
                        break;
                    case 'transfer':
                        const transfer_tick = _line.val.value.tick;
                        const transfer_value = {};
                        transfer_value.op = 'transfer';
                        transfer_value.tick = transfer_tick;
                        transfer_value.amt = _line.val.value.amt;
                        transfer_value.addr = _line.val.value.addr;
                        transfer_value.dta = null;
                        transfer_value.initiator = _line.ipk;
                        await _this.append('transfer_'+JSON.stringify(transfer_tick), transfer_value);
                        break;
                }
            }

            await _this.append('migration1', true);
        }
        migration1();
    }

    async stop(options = {}) { }
}

export default Migration;