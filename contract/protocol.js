import {Protocol} from "trac-peer";
import {tx} from "trac-peer/src/functions.js";

class Trac20Protocol extends Protocol{
    constructor(peer, base, options = {}) {
        super(peer, base, options);
    }

    txMaxBytes(){
        return 2_048;
    }

    async extendApi(){
        // nothing here yet
    }

    mapTxCommand(command){
        let obj = { type : '', value : null };
        const json = command;
        if(json.op !== undefined){
            switch(json.op){
                case 'deploy':
                    obj.type = 'deploy';
                    obj.value = json;
                    break;
                case 'mint':
                    obj.type = 'mint';
                    obj.value = json;
                    break;
                case 'transfer':
                    obj.type = 'transfer';
                    obj.value = json;
                    break;
            }
            if(null !== obj.value){
                return obj;
            }
        }
        return null;
    }

    async printOptions(){
        console.log(' ');
        console.log('- Trac20 Commands:');
        console.log("- /deploy | specify a token ticker, supply and max amount per mint: '/deploy --ticker \"gen\" --supply \"30000000\" --amount \"1000\" --decimals 18' | Optionally use '--signed 1' to only allow mints that you approved");
        console.log("- /mint | mint a token: '/mint --ticker \"gen\"'. If this is a signed mint, add the signature and the nonce and optional data: --sig \"<signature>\" --nonce \"<nonce>\" --data \"<data>\" ");
        console.log("- /sign_mint | sign a mint for a specific address (if signed is enabled in deploy): '/sign_mint --ticker \"<ticker>\" --address \"<address>\"'. If the mint contains a data field, it needs to be signed, too: --data \"<data>\"");
        console.log("- /transfer | transfer to another address from your token balance: '/transfer --ticker \"gen\" --amount \"32.555\" --to \"7618eb9ca22ddd9cc740559af65598608d81725db2fb30ebfd83cf474984938b\"'");
        console.log("- /token | check the status of a token (completion, supply, limits, etc): '/token --ticker \"gen\"'");
        console.log("- /whats_minting | Check the latest 10 tokens that are minting.");
        console.log("- /balance | check your token balance (append --address <address> to check other balances): '/balance --ticker \"gen\"'");
    }

    async _transact(command, args){
        let res = false;
        let sim = false;
        if(args.sim !== undefined && parseInt(args.sim) === 1){
            sim = true;
        }
        res = await this.peer.protocol_instance.tx({command:command}, sim);
        if(res !== false){
            const err = this.peer.protocol_instance.getError(res);
            if(null !== err){
                console.log(err.message);
            }
        }
    }

    async customCommand(input) {
        try{
            if (input.startsWith("/deploy")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.supply === undefined) throw new Error('Please specify supply');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.decimals === undefined) throw new Error('Please specify decimals (0 to 18)');
                const command = {
                    op : 'deploy',
                    tick : args.ticker.trim().toLowerCase(),
                    supply : args.supply,
                    amt : args.amount,
                    dec : args.decimals,
                    signed : args.signed !== undefined && 1 === parseInt(args.signed),
                    dta : null
                };
                await this._transact(command, args);
            } else if (input.startsWith("/token")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(null !== deployment){
                    deployment.amt = this.fromBigIntString(deployment.amt, deployment.dec);
                    deployment.supply = this.fromBigIntString(deployment.supply, deployment.dec);
                    deployment.com = this.fromBigIntString(deployment.com, deployment.dec);
                    console.log(deployment);
                } else {
                    console.log('Token does not exist')
                }
            } else if (input.startsWith("/mint")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const command = {
                    op : 'mint',
                    tick : args.ticker.trim().toLowerCase(),
                    sig : args.sig !== undefined ? args.sig.trim() : null,
                    nonce : args.nonce !== undefined ? args.nonce.trim() : null,
                    dta : args.data !== undefined ? args.data.trim() : null
                };
                await this._transact(command, args);
            } else if (input.startsWith("/sign_mint")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.address === undefined) throw new Error('Please specify an address');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(null === deployment) {
                    console.log('Invalid token');
                } else{
                    if(deployment.addr !== undefined && deployment.addr === this.peer.wallet.publicKey){
                        const nonce = this.generateNonce();
                        const sig = this.peer.wallet.sign(args.ticker.trim().toLowerCase() + args.address.trim() + (args.data !== undefined ? args.data.trim() : '') + nonce);
                        console.log('Send the following command to the minter:');
                        console.log('');
                        console.log('/mint --ticker "'+args.ticker.trim().toLowerCase()+'" --sig "'+sig+'" --nonce "'+nonce+'"' + (args.data !== undefined ? ' --data "'+args.data.trim()+'"' : ''));
                    }else{
                        console.log('You are not the deployer of this token and cannot sign mints');
                    }
                }
            } else if (input.startsWith("/whats_minting")) {
                const length = await this.api.getTxLength(false);
                let cnt = 0;
                const out = {};
                for(let i = 0; i < length; i++){
                    if(cnt >= 10) break;
                    const tx = await this.api.getTx(i, false);
                    if(null === tx.err && tx.val.type === 'mint'){
                        const key = 'd/'+this.safeJsonStringify(tx.val.value.tick);
                        const deployment = await this.get(key);
                        if(null !== deployment && out[tx.val.value.tick] === undefined){
                            deployment.amt = this.fromBigIntString(deployment.amt, deployment.dec);
                            deployment.supply = this.fromBigIntString(deployment.supply, deployment.dec);
                            deployment.com = this.fromBigIntString(deployment.com, deployment.dec);
                            out[tx.val.value.tick] = deployment
                            cnt += 1;
                        }
                    }
                }
                console.log(out);
            } else if (input.startsWith("/transfer")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.to === undefined) throw new Error('Please specify a to address');
                const command = {
                    op : 'transfer',
                    tick : args.ticker.trim().toLowerCase(),
                    amt : args.amount,
                    addr : args.to,
                    dta : null
                };
                await this._transact(command, args);
            } else if (input.startsWith("/balance")) {
                const args = this.parseArgs(input);
                let address = this.peer.wallet.publicKey;
                if(args.address !== undefined){
                    address = args.address;
                }
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const tick = this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.getSigned('d/'+tick);
                if(null === deployment) return new Error('Token does not exist.');
                const balance = await this.getSigned('b/'+address+'/'+tick);
                if(null !== balance){
                    console.log(this.fromBigIntString(balance, deployment.dec));
                } else {
                    console.log('0');
                }
            }
        }catch(e){
            console.log(e.message);
        }
    }
}

export default Trac20Protocol;