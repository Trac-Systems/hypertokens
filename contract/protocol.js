import {Protocol} from "trac-peer";
import b4a from 'b4a';

class HypertokensProtocol extends Protocol{
    constructor(peer, base, options = {}) {
        super(peer, base, options);

        this.DEPLOYMENT = 'df/';
        this.REDEEM = 'rdmf/';
        this.BALANCE = 'bf/';
        this.WITHDRAW_REQUEST_LENGTH = 'wdrlf';
        this.USER_WITHDRAW_REQUEST_LENGTH_KEY = 'uwdrlf/';
        this.WITHDRAW_REQUEST = 'wdrf/';
        this.USER_WITHDRAW_REQUEST = 'uwdrf/';
    }

    txMaxBytes(){
        return 2_048;
    }

    async extendApi(){
        const _this = this;
        this.api.getUserTokensLength = async function(address, signed = true) {
            try {
                const length_key = 'tl/'+address;
                let length = null;
                if (true === signed) length = await _this.getSigned(length_key);
                if (false === signed) length = await _this.get(length_key);
                if (length !== null) {
                    return length;
                }
            } catch (e) { }
            return 0;
        };
        this.api.getUserToken = async function(address, index, signed = true) {
            try {
                const key = 'ti/'+address+'/'+index;
                let token = null;
                if (true === signed) token = await _this.getSigned(key);
                if (false === signed) token = await _this.get(key);
                if (token !== null) {
                    return await token;
                }
            } catch (e) { }
            return null;
        };
        this.api.getBalance = async function(address, ticker, signed = true){
            try {
                const key = 'b/'+address+'/'+_this.safeJsonStringify(ticker);
                const dep_key = 'd/'+_this.safeJsonStringify(ticker);
                let balance = null;
                if(true === signed) balance = await _this.getSigned(key);
                if(false === signed) balance = await _this.get(key);
                console.log('balance', key, balance)
                if (balance !== null) {
                    let deployment = null;
                    if(true === signed) deployment = await _this.getSigned(dep_key);
                    if(false === signed) deployment = await _this.get(dep_key);
                    console.log('deployment', dep_key, deployment)
                    if (deployment !== null) {
                        return _this.fromBigIntString(balance, deployment.dec);
                    }
                }
            } catch (e) { }
            return '0';
        };
        this.api.getDeploymentLength = async function(hyperfun = true, signed = true) {
            try {
                const length_key = (hyperfun ? 'h' : '') + 'dl';
                let length = null;
                if (true === signed) length = await _this.getSigned(length_key);
                if (false === signed) length = await _this.get(length_key);
                if (length !== null) {
                    return length;
                }
            } catch (e) { }
            return 0;
        };
        this.api.getDeploymentByIndex = async function(index, signed = true, hyperfun = true) {
            try {
                const key = (hyperfun ? 'h' : '') + 'dli/'+index;

                let deployment = null;
                if (true === signed) deployment = await _this.getSigned(key);
                if (false === signed) deployment = await _this.get(key);
                if (deployment !== null) {
                   return await _this.api.getDeployment(deployment, true, signed);
                }
            } catch (e) { }
            return null;
        };
        /**
         *
         * @param tick
         * @param is_stringified
         * @param signed
         * @returns {Promise<number|null>}
         */
        this.api.getDeployment = async function(tick, is_stringified = false, signed = true) {
            try {
                let key;
                if(is_stringified){
                    key = tick;
                } else {
                    key = 'd/'+_this.safeJsonStringify(tick);
                }
                let deployment = null;
                if (true === signed) deployment = await _this.getSigned(key);
                if (false === signed) deployment = await _this.get(key);
                if (deployment !== null) {
                    return deployment;
                }
            } catch (e) { console.log(e) }
            return null;
        };
        /**
         *
         * @param address
         * @param ticker
         * @param signed
         * @returns {Promise<string>}
         */
        this.api.getBalanceFeature = async function(address, ticker, signed = true){
            try {
                let balance = null;
                if(true === signed) balance = await _this.getSigned(_this.getBalanceKey(address, ticker));
                if(false === signed) balance = await _this.get(_this.getBalanceKey(address, ticker));
                if (balance !== null) {
                    let deployment = null;
                    if(true === signed) deployment = await _this.getSigned(_this.getDeploymentKey(ticker));
                    if(false === signed) deployment = await _this.get(_this.getDeploymentKey(ticker));
                    if (deployment !== null) {
                        return _this.fromBigIntString(balance, deployment.dec);
                    }
                }
            } catch (e) { }
            return '0';
        };
        /**
         *
         * @param ticker
         * @param amount
         * @param address
         * @returns {Promise<{link: string, text: string}|null>}
         */
        this.api.getDepositInfoFeature = async function(ticker, amount, address){
            const to_address = 'bc1pnqn66qhldwys4e5neyh8vqunat6jwng457f0h39rxyc0r90vwucq5t4pdd';
            try {
                const transfer_inscription = `{ 
"p": "tap",
"op": "token-transfer",
"tick": "${ticker}",
"amt": "${amount}",
"dta" : "{\\"op\\":\\"deposit\\",\\"addr\\":\\"${address}\\"}",
"addr" : "${to_address}"
}`;
                const text = b4a.toString(b4a.from(transfer_inscription), 'base64');
                const link = "https://inscribe.taparooswap.com/tap/transfer?text="+text;
                const howto = 'Use the button below to deposit (_ALWAYS_ use the button, never send directly!).'+"\n\n"+
                    'Two more steps IF you did not enable 1-TX Transfers in your TAP Wallet:'+"\n\n"+
                    '1) Send the transfer inscription using the button below to the Hypertokens address: '+to_address+"\n\n"+
                    '2) Once confirmed, you will have access to your funds in Hypertokens.'+"\n";
                const res = {
                    link : link,
                    text : howto
                }
                return res;
            } catch (e) { }
            return null;
        };
        /**
         *
         * @param tx
         * @param signed
         * @returns {Promise<{link: string, text: string}|null>}
         */
        this.api.getWithdrawInfoFeature = async function(tx, signed = true){
            try {
                let voucher = null;
                if(true === signed) voucher = await _this.getSigned(_this.getRedeemKey(tx));
                if(false === signed) voucher = await _this.get(_this.getRedeemKey(tx));
                if (voucher !== null) {
                    const text = b4a.toString(b4a.from(voucher), 'base64');
                    const link = "https://inscribe.taparooswap.com/text?data="+text;
                    const howto = '1) To receive your funds, use the button below and follow the instructions.'+"\n\n"+
                        '2) Once confirmed, you will have access to your funds on Bitcoin.';
                    const res = {
                        link : link,
                        text : howto
                    }
                    return res;
                }
            } catch (e) { }
            return null;
        };
        /**
         *
         * @param address
         * @param signed
         * @returns {Promise<number>}
         */
        this.api.getUserWithdrawRequestsLengthFeature = async function(address, signed = true){
            try {
                let my_length = null;
                if(true === signed) my_length = await _this.getSigned(_this.getUserWithdrawRequestLengthKey(address));
                if(false === signed) my_length = await _this.get(_this.getUserWithdrawRequestLengthKey(address));
                if (my_length !== null) {
                    return my_length;
                }
            } catch (e) { }
            return 0;
        };
        /**
         *
         * @param address
         * @param index
         * @param signed
         * @returns {Promise<object|null>}
         */
        this.api.getUserWithdrawRequestFeature = async function(address, index, signed = true){
            try {
                let withdraw = null;
                if(true === signed) withdraw = await _this.getSigned(_this.getUserWithdrawRequestKey(address, index));
                if(false === signed) withdraw = await _this.get(_this.getUserWithdrawRequestKey(address, index));
                if (null !== withdraw) {
                    if(true === signed) withdraw = await _this.getSigned(_this.getWithdrawRequestKey(withdraw.split('/')[1]));
                    if(false === signed) withdraw = await _this.get(_this.getWithdrawRequestKey(withdraw.split('/')[1]));
                    if (null !== withdraw) {
                        return withdraw;
                    }
                }
            } catch (e) { }
            return null;
        };
        /**
         *
         * @param tick
         * @param signed
         * @returns {Promise<number|null>}
         */
        this.api.getDeploymentFeature = async function(tick, signed = true) {
            try {
                let deployment = null;
                if (true === signed) deployment = await _this.getSigned(_this.getDeploymentKey(tick));
                if (false === signed) deployment = await _this.get(_this.getDeploymentKey(tick));
                if (deployment !== null && deployment.dec !== undefined) {
                    return deployment.dec;
                }
            } catch (e) { }
            return null;
        };
    }

    mapTxCommand(command){
        let obj = { type : '', value : null };
        const json = typeof command === 'string' ? this.safeJsonParse(command) : command;
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
                case 'refun':
                    obj.type = 'refun';
                    obj.value = json;
                    break;
                case 'burnfun':
                    obj.type = 'burnfun';
                    obj.value = json;
                    break;
                case 'mintfun':
                    obj.type = 'mintfun';
                    obj.value = json;
                    break;
                case 'transfer':
                    obj.type = 'transfer';
                    obj.value = json;
                    break;
                case 'tap-transfer':
                    obj.type = 'transferFeature';
                    obj.value = json;
                    break;
                case 'tap-withdraw':
                    obj.type = 'withdrawRequestFeature';
                    obj.value = json;
                    break;
                case 'set-gas':
                    obj.type = 'setGas';
                    obj.value = json;
                    break;
                case 'set-min-liquidity':
                    obj.type = 'setMinLiquidity';
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
        console.log('- Hypertokens Command List:');
        console.log(' ');
        console.log("- /hyperfun | specify a token ticker to launch a Hyperfun project at default settings. (0.003 TAP target price, 100mln supply, 300000 TAP mcap and 100 Bitcoin blocks duration): '/hyperfun --ticker \"gen\"'. Use /deploy below if you need granularity over target price/supply.");
        console.log("- /deploy | specify a token ticker, supply and max amount per mint: '/deploy --ticker \"gen\" --supply \"30000000\" --amount \"1000\" --decimals 18' | Optionally use '--signed 1' to only allow mints that you approved. Use --funprice 0.003 and --funblocks 10 to make this a HyperFun mint. 18 decimals are mandatory for Hyperfun.");
        console.log("- /mint | mint a token: '/mint --ticker \"gen\"'. If this is a signed mint, add the signature and the nonce and optional data: --sig \"<signature>\" --nonce \"<nonce>\" --data \"<data>\". If this is a HyperFun mint, then you have to pass --amount and speficy how much you want to mint. The limit is specified by the deployment.");
        console.log("- /sign_mint | sign a mint for a specific address (if signed is enabled in deploy): '/sign_mint --ticker \"<ticker>\" --address \"<address>\"'. If the mint contains a data field, it needs to be signed, too: --data \"<data>\"");
        console.log("- /refun | refund TAP from an expired HyperFun token that didn't graduate: '/refun --ticker \"gen\"'");console.log(' ');
        console.log("- /burnfun | burn your tokens and return TAP from the reserve at the guaranteed floor price: '/burnfun --ticker \"gen\" --amount \"1000\"'");console.log(' ');
        console.log("- /transfer | transfer to another address from your token balance: '/transfer --ticker \"gen\" --amount \"32.555\" --to \"7618eb9ca22ddd9cc740559af65598608d81725db2fb30ebfd83cf474984938b\"'");
        console.log("- /sign_transfer | sign a transfer for a specific address: '/sign_transfer --ticker \"<ticker>\" --to \"<address>\" --amount \"32.555\"'. If the transfer contains a data field, it needs to be signed, too: --data \"<data>\"");
        console.log("- /redeem | Redeem a voucher to receive Hypertokens or TAP: '/redeem --voucher <voucher>'");
        console.log("- /token | check the status of a token (completion, supply, limits, etc): '/token --ticker \"gen\"'");
        console.log("- /whats_minting | Check the latest 10 tokens that are minting.");
        console.log("- /balance | check your token balance (append --address <address> to check other balances): '/balance --ticker \"gen\"'");
        console.log("- /hyperwarp | transfer your tokens to Hypermall for trading: '/hyperwarp --ticker \"gen\" --amount \"1000\"'");
        console.log(' ');
        console.log('- TAP Command List:');
        console.log(' ');
        console.log("- /tap_balance | check your TAP balance. TAP is a Bitcoin token and required as gas + liquidity asset: '/tap_balance'");
        console.log("- /tapwarp | transfer your TAP tokens to Hypermall for trading: '/tapwarp --amount \"10\"'");
        console.log('- /get_tap_deposit_link | enter a TAP token amount to generate a deposit link: \'/get_tap_deposit_link --amount "<amount>"\'');
        console.log('- /get_tap_withdraw_link | enter the transaction hash of your withdraw request to generate a redeem link: \'/get_tap_withdraw_link --tx "<transaction hash>"\'.');
        console.log("- /tap_transfer | transfer TAP to another Trac address from your token balance: '/transfer --amount \"10\" --to \"7618eb9ca22ddd9cc740559af65598608d81725db2fb30ebfd83cf474984938b\"'");
        console.log("- /sign_tap_transfer | sign a TAP transfer for a specific Trac address: '/sign_tap_transfer --to \"<address>\" --amount \"10\"'. If the transfer contains a data field, it needs to be signed, too: --data \"<data>\"");
        console.log('- /my_tap_withdraw_requests_length | see the amount of all of your withdraw requests ever.');
        console.log('- /my_tap_withdraw_request | enter the withdraw request index to get the request information. The index starts at zero until length - 1: \'/my_tap_withdraw_request --index <index>\'');
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
                console.log('legit', err)
                return err.message;
            }
        }
        return res;
    }

    async customCommand(input) {
        try{
            if (input.startsWith("/deploy")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.supply === undefined) throw new Error('Please specify supply');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.decimals === undefined) throw new Error('Please specify decimals (0 to 18)');
                let fun = null;
                if(args.funprice !== undefined && args.funblocks !== undefined) {
                    if(parseInt(args.decimals) !== 18) throw new Error('18 decimals required for Hyperfun deployments.');
                    fun = {
                        target_price : args.funprice,
                        blocks : args.funblocks
                    }
                } else {
                    fun = {
                        target_price : null,
                        blocks : null
                    }
                }
                const command = {
                    op : 'deploy',
                    tick : args.ticker.trim().toLowerCase(),
                    supply : args.supply,
                    amt : args.amount,
                    dec : args.decimals,
                    signed : args.signed !== undefined && 1 === parseInt(args.signed),
                    dta : null,
                    fun : fun
                };
                console.log(command)
                await this._transact(command, args);
            } else if (input.startsWith("/hyperfun")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                let fun = {
                    target_price : '0.003',
                    blocks : '100'
                }
                const command = {
                    op : 'deploy',
                    tick : args.ticker.trim().toLowerCase(),
                    supply : '100000000',
                    amt : '100000000',
                    dec : '18',
                    signed : false,
                    dta : null,
                    fun : fun
                };
                console.log(command)
                await this._transact(command, args);
            } else if (input.startsWith("/token")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(deployment !== null){
                    deployment.amt = this.fromBigIntString(deployment.amt, deployment.dec);
                    deployment.supply = this.fromBigIntString(deployment.supply, deployment.dec);
                    deployment.com = this.fromBigIntString(deployment.com, deployment.dec);
                    if(deployment.fun !== null && null !== deployment.fun.target_price && null !== deployment.fun.blocks){
                        let tap_deployment = await this.get(this.getDeploymentKey(this.peer.contract_instance.tap_token));
                        deployment.fun.target_price = this.fromBigIntString(deployment.fun.target_price, tap_deployment.dec);
                        deployment.fun.rem = this.fromBigIntString(deployment.fun.rem, deployment.dec);
                        deployment.fun.curr_price = this.fromBigIntString(deployment.fun.curr_price, tap_deployment.dec);
                        deployment.fun.liq = this.fromBigIntString(deployment.fun.liq, tap_deployment.dec);
                        deployment.fun.res = this.fromBigIntString(deployment.fun.res, tap_deployment.dec);
                    }
                    console.log(deployment);
                } else {
                    console.log('Token does not exist')
                }
            } else if (input.startsWith("/burnfun")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.amount === undefined) throw new Error('Please specify an amount to burn and return');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(deployment === null) throw new Error('Ticker does not exist');
                if(deployment.fun !== null && null !== deployment.fun.target_price && null !== deployment.fun.blocks){
                    const command = {
                        op : 'burnfun',
                        tick : args.ticker.trim().toLowerCase(),
                        amt : args.amount.trim()
                    };
                    await this._transact(command, args);
                } else {
                    throw new Error('Not a HyperFun mint.');
                }
            } else if (input.startsWith("/refun")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(deployment === null) throw new Error('Ticker does not exist');
                if(deployment.fun !== null && null !== deployment.fun.target_price && null !== deployment.fun.blocks){
                    const command = {
                        op : 'refun',
                        tick : args.ticker.trim().toLowerCase()
                    };
                    await this._transact(command, args);
                } else {
                    throw new Error('Not a HyperFun mint.');
                }
            } else if (input.startsWith("/mint")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(deployment === null) throw new Error('Ticker does not exist');
                if(deployment.fun !== null && null !== deployment.fun.target_price && null !== deployment.fun.blocks){
                    const command = {
                        op : 'mintfun',
                        tick : args.ticker.trim().toLowerCase(),
                        amt : args.amount,
                        sig : args.sig !== undefined ? args.sig.trim() : null,
                        nonce : args.nonce !== undefined ? args.nonce.trim() : null,
                        dta : args.data !== undefined ? args.data.trim() : null
                    };
                    await this._transact(command, args);
                } else {
                    const command = {
                        op : 'mint',
                        tick : args.ticker.trim().toLowerCase(),
                        sig : args.sig !== undefined ? args.sig.trim() : null,
                        nonce : args.nonce !== undefined ? args.nonce.trim() : null,
                        dta : args.data !== undefined ? args.data.trim() : null
                    };
                    await this._transact(command, args);
                }
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
                        let fun = '';
                        let fun_amt = '';
                        if(deployment.fun !== null && null !== deployment.fun.target_price && null !== deployment.fun.blocks){
                            if(args.amount === undefined) throw new Error('HyperFun mints require to specify an amount to mint.');
                            fun = ' --amount ' + args.amount.trim();
                            fun_amt = args.amount.trim();
                        }
                        const nonce = this.generateNonce();
                        const sig = this.peer.wallet.sign(args.ticker.trim().toLowerCase() + fun_amt + args.address.trim() + this.peer.bootstrap + (args.data !== undefined ? args.data.trim() : '') + nonce);
                        console.log('Send the following command to the minter:');
                        console.log('');
                        console.log('/mint --ticker "'+args.ticker.trim().toLowerCase()+fun+'" --sig "'+sig+'" --nonce "'+nonce+'"' + (args.data !== undefined ? ' --data "'+args.data.trim()+'"' : ''));
                    }else{
                        console.log('You are not the deployer of this token and cannot sign mints');
                    }
                }
            } else if (input.startsWith("/whats_minting")) {
                const length = await this.api.getTxLength(false);
                let cnt = 0;
                const out = {};
                for(let i = length - 1 ; i > 0; i--){
                    if(cnt >= 10) break;
                    const tx = await this.api.getTx(i, false);
                    if(null === tx.err && (tx.val.type === 'mint' || tx.val.type === 'mintfun')){
                        const key = 'd/'+this.safeJsonStringify(tx.val.value.tick);
                        const deployment = await this.get(key);
                        if(null !== deployment && out[tx.val.value.tick] === undefined){
                            deployment.amt = this.fromBigIntString(deployment.amt, deployment.dec);
                            deployment.supply = this.fromBigIntString(deployment.supply, deployment.dec);
                            deployment.com = this.fromBigIntString(deployment.com, deployment.dec);
                            deployment['mintfun'] = tx.val.type === 'mintfun';
                            console.log(deployment);
                            out[tx.val.value.tick] = true;
                            cnt += 1;
                        }
                    }
                }
            } else if (input.startsWith("/transfer")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.to === undefined) throw new Error('Please specify a to address');
                let from = null;
                let sig = null;
                let nonce = null;
                if(args.from !== undefined && args.sig !== undefined && args.nonce !== undefined){
                    from = args.from;
                    sig = args.sig;
                    nonce = args.nonce;
                }
                let dta = null;
                if(args.data !== undefined){
                    dta = args.data;
                }
                const command = {
                    op : 'transfer',
                    tick : args.ticker.trim().toLowerCase(),
                    amt : args.amount,
                    addr : args.to,
                    from : from,
                    sig : sig,
                    nonce : nonce,
                    dta : dta
                };
                await this._transact(command, args);
            } else if (input.startsWith("/redeem")) {
                const args = this.parseArgs(input);
                const buffer = b4a.from(args.voucher, 'base64');
                const command = this.safeJsonParse(buffer.toString('utf-8'));
                if((command.op === 'transfer' || command.op === 'tap-transfer' ) &&
                    command.addr === this.peer.wallet.publicKey){
                    await this._transact(command, args);
                } else {
                    console.log('Not a voucher');
                }
            } else if (input.startsWith("/hyperwarp")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(null !== deployment && deployment.fun !== null && null !== deployment.fun.target_price && null !== deployment.fun.blocks && deployment.fun.liq !== '0'){
                    const command = {
                        op : 'transfer',
                        tick : args.ticker.trim().toLowerCase(),
                        amt : args.amount,
                        addr : this.peer.contract_instance.graduation_authority,
                        from : null,
                        sig : null,
                        nonce : null,
                        dta : null
                    };
                    await this._transact(command, args);
                } else {
                    console.log('Token does not exist or did not graduate.');
                }
            } else if (input.startsWith("/sign_transfer")) {
                const args = this.parseArgs(input);
                if(args.ticker === undefined) throw new Error('Please specify a ticker');
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.to === undefined) throw new Error('Please specify a to address');
                const key = 'd/'+this.safeJsonStringify(args.ticker.trim().toLowerCase());
                const deployment = await this.get(key);
                if(null === deployment) {
                    console.log('Invalid token');
                } else{
                    const nonce = this.generateNonce();
                    const sig = this.peer.wallet.sign(args.ticker.trim().toLowerCase() + args.to + args.amount + this.peer.wallet.publicKey + this.peer.bootstrap + (args.data !== undefined ? args.data.trim() : '') + nonce);
                    console.log('Send the following command to the intended receiver:');
                    console.log('');
                    console.log('/transfer --ticker "'+args.ticker.trim().toLowerCase()+'" --from "'+this.peer.wallet.publicKey+'" --to "'+args.to+'" --amount "'+args.amount+'" --sig "'+sig+'" --nonce "'+nonce+'"' + (args.data !== undefined ? ' --data "'+args.data.trim()+'"' : ''));
                }
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
            } else if (input.startsWith('/get_tap_deposit_link')) {
                const splitted = this.parseArgs(input);
                console.log(this.safeJsonStringify(await this.api.getDepositInfoFeature('tap', splitted.amount, this.peer.wallet.publicKey)));
            } else if (input.startsWith('/get_tap_withdraw_link')) {
                const splitted = this.parseArgs(input);
                console.log(this.safeJsonStringify(await this.api.getWithdrawInfoFeature(splitted.tx, false)));
            } else if (input.startsWith('/tap_balance')) {
                console.log(this.safeJsonStringify(await this.api.getBalanceFeature(this.peer.wallet.publicKey, 'tap')));
            } else if (input.startsWith('/my_tap_withdraw_requests_length')) {
                console.log(this.safeJsonStringify(await this.api.getUserWithdrawRequestsLength(this.peer.wallet.publicKey)));
            } else if (input.startsWith('/my_tap_withdraw_request')) {
                const splitted = this.parseArgs(input);
                console.log(this.safeJsonStringify(await this.api.getUserWithdrawRequest(this.peer.wallet.publicKey, splitted.index)));
            } else if (input.startsWith("/tap_transfer")) {
                const args = this.parseArgs(input);
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.to === undefined) throw new Error('Please specify a to address');
                let from = null;
                let sig = null;
                let nonce = null;
                if(args.from !== undefined && args.sig !== undefined && args.nonce !== undefined){
                    from = args.from;
                    sig = args.sig;
                    nonce = args.nonce;
                }
                let dta = null;
                if(args.data !== undefined){
                    dta = args.data;
                }
                let tap_deployment = await this.get(this.getDeploymentKey(this.peer.contract_instance.tap_token));
                const command = {
                    op : 'tap-transfer',
                    tick : tap_deployment.tick,
                    amt : args.amount,
                    addr : args.to,
                    from : from,
                    sig : sig,
                    nonce : nonce,
                    dta : dta
                };
                await this._transact(command, args);
            } if (input.startsWith("/tapwarp")) {
                const args = this.parseArgs(input);
                if(args.amount === undefined) throw new Error('Please specify an amount');
                const tap_deployment = await this.get(this.getDeploymentKey(this.peer.contract_instance.tap_token));
                if(null !== tap_deployment){
                    const command = {
                        op : 'tap-transfer',
                        tick : this.peer.contract_instance.tap_token,
                        amt : args.amount,
                        addr : this.peer.contract_instance.graduation_authority,
                        from : null,
                        sig : null,
                        nonce : null,
                        dta : null
                    };
                    await this._transact(command, args);
                } else {
                    console.log('TAP Token does not exist.');
                }
            } else if (input.startsWith("/sign_tap_transfer")) {
                const args = this.parseArgs(input);
                if(args.amount === undefined) throw new Error('Please specify an amount');
                if(args.to === undefined) throw new Error('Please specify a to address');
                const nonce = this.generateNonce();
                let tap_deployment = await this.get(this.getDeploymentKey(this.peer.contract_instance.tap_token));
                const sig = this.peer.wallet.sign(tap_deployment.tick + args.to + args.amount + this.peer.wallet.publicKey + this.peer.bootstrap + (args.data !== undefined ? args.data.trim() : '') + nonce);
                console.log('Send the following command to the intended receiver:');
                console.log('');
                console.log('/tap_transfer --from "'+this.peer.wallet.publicKey+'" --to "'+args.to+'" --amount "'+args.amount+'" --sig "'+sig+'" --nonce "'+nonce+'"' + (args.data !== undefined ? ' --data "'+args.data.trim()+'"' : ''));
            }
        }catch(e){
            console.log(e.message);
        }
    }

    getDeploymentKey(tick)
    {
        return this.DEPLOYMENT + this.safeJsonStringify(tick);
    }

    getRedeemKey(tx)
    {
        return this.REDEEM + tx;
    }

    getBalanceKey(from_key, tick)
    {
        return this.BALANCE + from_key + '/' + this.safeJsonStringify(tick);
    }

    getWithdrawRequestLengthKey()
    {
        return this.WITHDRAW_REQUEST_LENGTH;
    }

    getUserWithdrawRequestLengthKey(address)
    {
        return this.USER_WITHDRAW_REQUEST_LENGTH_KEY + address;
    }

    getWithdrawRequestKey(num)
    {
        return this.WITHDRAW_REQUEST + num;
    }

    getUserWithdrawRequestKey(address, index)
    {
        return this.USER_WITHDRAW_REQUEST +  address + '/' + index;
    }
}

export default HypertokensProtocol;
