import {Protocol} from "trac-peer";
import {tx} from "trac-peer/src/functions.js";

class Trac20Protocol extends Protocol{
    constructor(peer, base, options = {}) {
        super(peer, base, options);
    }

    txMaxBytes(){
        return 1_024;
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
        console.log("- /deploy | specify a token ticker, supply and max amount per mint: /deploy --ticker \"gen\" --supply \"30000000\" --amount \"1000\" --decimals 18");
        console.log("- /mint | mint a token: /mint --ticker \"gen\"");
        console.log("- /transfer | transfer to another address from your token balance: /transfer --ticker \"gen\" --amount \"32.555\" --to \"7618eb9ca22ddd9cc740559af65598608d81725db2fb30ebfd83cf474984938b\"");
        console.log("- /balance | check your token balance (append --address <address> to check other balances): /balance --ticker \"gen\"");
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
                    tick : args.ticker,
                    supply : args.supply,
                    amt : args.amount,
                    dec : args.decimals
                };
                await this._transact(command, args);
            } else if (input.startsWith("/mint")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const command = {
                    op : 'mint',
                    tick : args.ticker
                };
                await this._transact(command, args);
            } else if (input.startsWith("/transfer")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.to === undefined) throw new Error('Please specify a to address');
                const command = {
                    op : 'transfer',
                    tick : args.ticker,
                    amt : args.amount,
                    addr : args.to
                };
                await this._transact(command, args);
            } else if (input.startsWith("/balance")) {
                const args = this.parseArgs(input);
                let address = this.peer.wallet.publicKey;
                if(args.address !== undefined){
                    address = args.address;
                }
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const tick = this.safeJsonStringify(args.ticker);
                const deployment = await this.getSigned('d/'+tick);
                if(null === deployment) return new Error('Token does not exist.');
                const balance = await this.getSigned('b/'+address+'/'+this.safeJsonStringify(args.ticker));
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