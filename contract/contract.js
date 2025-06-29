import {Contract} from 'trac-peer'

class HypertokensContract extends Contract {
    constructor(protocol, options = {}) {
        super(protocol, options);

        this.tap_token = 'tap';
        this.graduation_authority = '527a0d51a6122a43995cf5cb211abaf2aaef9d5b8cbb0de356769e6746f844eb';

        this.addSchema('deploy', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                supply : { type : "string", numeric : true, min: 1, max: 38 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                dec : { type : "string", numeric : true, min: 1, max: 2 },
                signed : { type : "boolean" },
                dta : { type : "string", min: 1, max: 512, nullable : true },
                fun : {
                    $$strict : true,
                    $$type : "object",
                    target_price : { type : "string", numeric : true, min: 1, max: 38, nullable : true },
                    blocks : { type : "string", numeric : true, min: 1, max: 3, nullable : true }
                }
            }
        });

        this.addSchema('mint', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                sig : { type : "is_hex", nullable : true },
                nonce : { type : "string", min: 1, max: 512, nullable : true },
                dta : { type : "string", min: 1, max: 512, nullable : true }
            }
        });

        this.addSchema('refun', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 }
            }
        });

        this.addSchema('burnfun', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
            }
        });

        this.addSchema('mintfun', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                sig : { type : "is_hex", nullable : true },
                nonce : { type : "string", min: 1, max: 512, nullable : true },
                dta : { type : "string", min: 1, max: 512, nullable : true }
            }
        });

        this.addSchema('transfer', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                addr : { type : "is_hex" },
                dta : { type : "string", min: 1, max: 512, nullable : true },
                from : { type : "is_hex", nullable : true },
                sig : { type : "is_hex", nullable : true },
                nonce : { type : "string", min: 1, max: 512, nullable : true }
            }
        });

        this.addSchema('setMinLiquidity', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                minliq : { type : "string", numeric : true, min: 1, max: 38 }
            }
        });

        this.addSchema('setGas', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                gas : { type : "string", numeric : true, min: 1, max: 38 }
            }
        });

        this.addSchema('transferFeature', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                addr : { type : "is_hex" },
                dta : { type : "string", min: 1, max: 512, nullable : true },
                from : { type : "is_hex", nullable : true },
                sig : { type : "is_hex", nullable : true },
                nonce : { type : "string", min: 1, max: 512, nullable : true }
            }
        });

        this.addSchema('withdrawRequestFeature', {
            value : {
                $$type: "object",
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                addr : { type : "bitcoin_address" }
            }
        });

        this.addSchema('feature_entry', {
            key : { type : "string", min : 1, max: 256 },
            value : { type : "any" }
        });

        this.addSchema('tap_hypertokens_feature_deposit', {
            value : {
                $$type: "object",
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                addr : { type : "is_hex" }
            }
        });

        this.addSchema('tap_hypertokens_feature_withdraw', {
            value : {
                $$type: "object",
                tx : { type : "is_hex" },
                ins : { type : "string", min : 1, max: 4096 }
            }
        });

        this.addSchema('tap_hypertokens_feature_deploy', {
            value : {
                $$type: "object",
                tick : { type : "string", min : 1, max: 128 },
                max : { type : "string", numeric : true, min: 1, max: 38 },
                lim : { type : "string", numeric : true, min: 1, max: 38 },
                dec : { type : "number", integer : true, min : 0, max : 18 }
            }
        });

        this.addFeature('tap_hypertokens_feature', async function(){
            if(false === _this.validateSchema('feature_entry', _this.op)) return;
            if(_this.op.key === 'currentBlock' ||
                _this.op.key === 'cwl' ||
                _this.op.key.startsWith('processed_block_') ||
                _this.op.key.startsWith('vo_') ||
                _this.op.key.startsWith('wdp/') ) {
                console.log(_this.op.key, _this.op.value);
                await _this.put(_this.op.key, _this.op.value);
            } else if(_this.op.key === 'deposit') {
                if(false === _this.validateSchema('tap_hypertokens_feature_deposit', _this.op)) return;
                await _this.depositFeature();
            } else if(_this.op.key === 'withdraw') {
                if(false === _this.validateSchema('tap_hypertokens_feature_withdraw', _this.op)) return;
                await _this.withdrawFeature();
            }  else if(_this.op.key === 'deploy') {
                if(false === _this.validateSchema('tap_hypertokens_feature_deploy', _this.op)) return;
                await _this.deployFeature();
            }
        });

        const _this = this;
        this.addFeature('migration_feature', async function(){
            if(false === _this.validateSchema('feature_entry', _this.op)) return;
            if(true === await _this.get('migration1')) return;
            if(_this.op.key.startsWith('deploy_')) {
                _this.address = _this.op.value.initiator;
                delete _this.op.value.initiator;
                _this.value = _this.op.value;
                await _this.deploy();
            } else if(_this.op.key.startsWith('mint_')) {
                _this.address = _this.op.value.initiator;
                delete _this.op.value.initiator;
                _this.value = _this.op.value;
                await _this.mint();
            } else if(_this.op.key.startsWith('transfer_')) {
                _this.address = _this.op.value.initiator;
                delete _this.op.value.initiator;
                _this.value = _this.op.value;
                await _this.transfer();
            } else if(_this.op.key === 'migration1') {
                console.log('migration finished.');
                await _this.put('migration1', true);
            }
        });

        this.messageHandler(async function(){ });
    }

    async deploy(){
        if(false === await this.hasGas(this.address)) return new Error('No gas funds. Get some TAP.');
        const tick = this.value.tick.trim().toLowerCase();
        if(['tap', 'trac', 'pipe', 'gib', 'dmt-nat', 'nat', 'hypermall'].includes(tick)) return new Error('This token is not mintable');
        const _dec = parseInt(this.value.dec);
        const _amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, this.value.dec));
        const _supply = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.supply, this.value.dec));
        if(isNaN(_dec) || _dec < 0 || _dec > 18) return new Error('Invalid decimals');
        if(null === _supply || _supply <= 0n) return new Error('Invalid supply');
        if(null === _amt || _amt <= 0n || _amt > _supply || _supply <= 0n) return new Error('Invalid amount');
        const key = 'd/'+this.protocol.safeJsonStringify(tick);
        const deployment = await this.get(key);
        if(null !== deployment) return new Error('Token exists already');
        const _deployment = this.protocol.safeClone(this.value);
        const current_block = await this.get('currentBlock');
        let is_fun = false;
        if(null !== _deployment.fun && null !== _deployment.fun.target_price && null !== _deployment.fun.blocks){
            let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
            if(null === tap_deployment) return new Error('TAP token not found');
            if(_dec !== 18 || tap_deployment.dec !== 18) return new Error('Need 18 dec for fun');
            const price = this.protocol.safeBigInt(this.protocol.toBigIntString(_deployment.fun.target_price, tap_deployment.dec));
            if(null === price || price <= 0n) return new Error('Invalid tap token price');
            if(null === current_block) return new Error('No blocks registered yet');
            const blocks = parseInt(_deployment.fun.blocks);
            if(null === blocks || isNaN(blocks) || blocks < 1 || blocks > 300) return new Error('Invalid blocks');
            _deployment.fun['target_price'] = price.toString();
            _deployment.fun['rem'] = _supply.toString();
            _deployment.fun['curr_price'] = '0';
            _deployment.fun['liq'] = '0';
            _deployment.fun['res'] = '0';
            _deployment.fun['blocks'] = blocks;
            _deployment.fun['last_block'] = current_block + blocks;
            is_fun = true;
        }
        _deployment.amt = _amt.toString();
        _deployment.supply = _supply.toString();
        _deployment.dec = _dec;
        _deployment.com = '0';
        _deployment.signed = this.value.signed !== undefined && true === this.value.signed;
        _deployment.addr = this.address;
        _deployment.dta = this.value.dta !== undefined ? this.value.dta : null;
        const length_key = 'dl';
        const hf_length_key = 'hdl';
        let length = await this.get(length_key);
        if(null === length){
            length = 0;
        }
        let hf_length = await this.get(hf_length_key);
        if(null === hf_length){
            hf_length = 0;
        }
        if(true === is_fun){
            await this.put('strtblck/'+this.protocol.safeJsonStringify(this.value.tick.trim().toLowerCase()), current_block);
        }
        await this.put('dli/'+length, key);
        if(true === is_fun) await this.put('hdli/'+hf_length, key);
        await this.put(length_key, length + 1);
        if(true === is_fun) await this.put(hf_length_key, hf_length + 1);
        await this.put(key, _deployment);
        await this.collectGas(this.address, this.validator_address);
        if(true === this.protocol.peer.options.enable_logs){
            console.log('Deployed ticker', tick,
                ',',
                'supply:', this.protocol.fromBigIntString(_deployment.supply, _deployment.dec),
                ',',
                'amount:', this.protocol.fromBigIntString(_deployment.amt, _deployment.dec),
                'by',
                this.address)
        }
    }

    async mint(){
        if(false === await this.hasGas(this.address)) return new Error('No gas funds. Get some TAP.');
        const tick = this.protocol.safeJsonStringify(this.value.tick.trim().toLowerCase());
        const deployment = await this.get('d/'+tick);
        if(null === deployment) return new Error('Token does not exist.');
        if(null !== deployment.fun.target_price || null !== deployment.fun.blocks) return new Error('No fun');
        if(deployment.signed !== undefined && deployment.addr !== undefined &&
            true === deployment.signed){
            if(null === this.value.nonce) return new Error('No nonce given');
            if(null === this.value.sig) return new Error('No sig given');
            if(null !== await this.get('s/'+this.value.sig)) return new Error('Sig exists');
            let sig_value = this.value.tick.trim().toLowerCase() + this.address + this.protocol.peer.bootstrap;
            if(null !== this.value.dta) {
                sig_value += this.value.dta;
            }
            const verified = this.protocol.peer.wallet.verify(
                this.value.sig, sig_value + this.value.nonce, deployment.addr);
            if(false === verified) return new Error('Not authorized');
            await this.put('s/'+this.value.sig, '');
        }
        const supply = this.protocol.safeBigInt(deployment.supply);
        let amt = this.protocol.safeBigInt(deployment.amt);
        let com = this.protocol.safeBigInt(deployment.com);
        if(null === supply || null === amt || null === com) return new Error('Invalid bigint');
        let left = supply - com;
        if(left > 0n){
            if(amt > left) amt = left;
            let balance = await this.get('b/'+this.address+'/'+tick);
            if(null === balance){
                balance = 0n;
            } else {
                balance = this.protocol.safeBigInt(balance);
                if(null === balance) return new Error('Invalid balance');
            }
            balance += amt;
            com += amt;
            deployment.com = com.toString();
            await this.put('d/'+tick, deployment);
            await this.put('b/'+this.address+'/'+tick, balance.toString());
            const token_exists = await this.get('te/'+this.address+'/'+tick);
            if(null === token_exists){
                let tokens_length = await this.get('tl/'+this.address);
                if(null === tokens_length){
                    tokens_length = 0;
                }
                await this.put('ti/'+this.address+'/'+tokens_length, this.value.tick.trim().toLowerCase());
                await this.put('tl/'+this.address, tokens_length + 1);
                await this.put('te/'+this.address+'/'+tick, true);
            }
            await this.collectGas(this.address, this.validator_address);
            if(true === this.protocol.peer.options.enable_logs){
                console.log('Minting ticker', this.value.tick.trim().toLowerCase(),
                    ',',
                    'completed ', this.protocol.fromBigIntString(deployment.com, deployment.dec),
                    '/',
                    this.protocol.fromBigIntString(deployment.supply, deployment.dec),
                    'by',
                    this.address)
            }
        } else {
            return new Error('Invalid amount or minted out');
        }
    }

    pow(x, n, scale) {
        let result = scale;
        for (let i = 0; i < n; i++) {
            result = (result * x) / scale;
        }
        return result;
    }

    async mintfun(){
        const tick = this.protocol.safeJsonStringify(this.value.tick.trim().toLowerCase());
        const deployment = await this.get('d/'+tick);
        if(null === deployment) return new Error('Token does not exist.');
        if(null === deployment.fun || null === deployment.fun.target_price || null === deployment.fun.blocks) return new Error('Only fun');
        const current_block = await this.get('currentBlock');
        if(null === current_block) return new Error('No blocks registered yet');
        const blocks = parseInt(deployment.fun.blocks);
        const start_block = await this.get('strtblck/'+tick);
        if(null === start_block) return new Error('Invalid start block');
        if(current_block - start_block > blocks) return new Error('Fun expired');
        if(deployment.signed !== undefined && deployment.addr !== undefined &&
            true === deployment.signed){
            if(null === this.value.nonce) return new Error('No nonce given');
            if(null === this.value.sig) return new Error('No sig given');
            if(null !== await this.get('s/'+this.value.sig)) return new Error('Sig exists');
            let sig_value = this.value.tick.trim().toLowerCase() + this.value.amt + this.address + this.protocol.peer.bootstrap;
            if(null !== this.value.dta) {
                sig_value += this.value.dta;
            }
            const verified = this.protocol.peer.wallet.verify(
                this.value.sig, sig_value + this.value.nonce, deployment.addr);
            if(false === verified) return new Error('Not authorized');
            await this.put('s/'+this.value.sig, '');
        }
        if(this.address === this.graduation_authority) return new Error('Authority cannot take part.');
        const supply = this.protocol.safeBigInt(deployment.supply);
        let amt = this.protocol.safeBigInt(deployment.amt);
        let burned = this.protocol.safeBigInt(deployment.com);
        if(null === supply || null === amt || null === burned) return new Error('Invalid bigint');
        let left = supply - burned;
        if(left > 0n){
            let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
            if(null === tap_deployment) return new Error('TAP token not found');
            let mint_amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));
            if(null === mint_amt || mint_amt <= 0 || mint_amt > amt) return new Error('Invalid amount');
            const ratio = (burned * 10n**18n) / supply;
            const ratioCubed = this.pow(ratio, 3, 10n**18n);
            const target_price = this.protocol.safeBigInt(deployment.fun.target_price, tap_deployment.dec);
            if(null === target_price) return new Error('Invalid target price');
            let price = (ratioCubed * target_price) / 10n**18n;
            if (price < 1000n) price = 1000n;
            deployment.fun.curr_price = price.toString();
            const spent = (mint_amt * price) / 10n**18n;
            if(spent <= 0n) return new Error('Invalid spent amount');
            let tap_balance = await this.get(this.protocol.getBalanceKey(this.address, tap_deployment.tick))
            if(null === tap_balance){
                tap_balance = 0n;
            } else {
                tap_balance = this.protocol.safeBigInt(tap_balance);
                if(null === tap_balance) return new Error('Invalid balance');
            }
            tap_balance -= spent;
            let gas = await this.protocol.safeBigInt(await this.get('gas'));
            if(null === gas || gas < 0n) gas = 0n;
            if(tap_balance < 0n) return new Error('Insufficient funds');
            if(tap_balance - gas < 0n) return new Error('No gas funds. Get some TAP.');
            const liq_key = 'liq/'+tick;
            let liquidity = await this.get(liq_key);
            if(null === liquidity){
                liquidity = 0n;
            } else {
                liquidity = this.protocol.safeBigInt(liquidity);
                if(null === liquidity) return new Error('Invalid liquidity amount');
            }
            liquidity += spent;
            burned += mint_amt;
            if (burned > supply) return new Error('Trying to mint too much');
            let balance = await this.get('b/'+this.address+'/'+tick);
            if(null === balance){
                balance = 0n;
            } else {
                balance = this.protocol.safeBigInt(balance);
                if(null === balance) return new Error('Invalid balance');
            }
            balance += mint_amt;
            deployment.com = burned.toString();
            const total_spent_key = 'spnt/'+this.address+'/'+tick;
            let total_spent = await this.get(total_spent_key);
            if(null === total_spent){
                total_spent = 0n;
            } else {
                total_spent = this.protocol.safeBigInt(total_spent);
                if(null === total_spent) return new Error('Invalid total spent');
            }
            total_spent += spent;
            let reserve = 0n;
            let min_liq = await this.get('minliq');
            if(null === min_liq){
                min_liq = 0n;
            } else {
                min_liq = this.protocol.safeBigInt(min_liq);
                if(null === min_liq) return new Error('Invalid min liquidity');
            }
            if(burned === supply && liquidity >= min_liq){
                reserve = liquidity / 3n;
                liquidity -= reserve;
                if(reserve <= 0n || liquidity <= 0n) return new Error('Invalid graduation');
                let length = await this.get('grd');
                if(null === length){
                    length = 0;
                }
                let grad_tap_balance = await this.get(this.protocol.getBalanceKey(this.graduation_authority, tap_deployment.tick))
                if(null === grad_tap_balance){
                    grad_tap_balance = 0n;
                } else {
                    grad_tap_balance = this.protocol.safeBigInt(grad_tap_balance);
                    if(null === grad_tap_balance) return new Error('Invalid balance');
                }
                grad_tap_balance += liquidity;
                deployment.fun.liq = liquidity.toString();
                deployment.fun.res = reserve.toString();
                await this.put('rsrv/'+tick, reserve.toString());
                await this.put(this.protocol.getBalanceKey(this.graduation_authority, tap_deployment.tick), grad_tap_balance.toString());
                await this.put('grdi/'+length, {
                    tick : this.value.tick.trim().toLowerCase(),
                    dec : deployment.dec,
                    liquidity : liquidity.toString(),
                    liq_tick : tap_deployment.tick,
                    liq_dec : tap_deployment.dec,
                    tx : this.tx,
                    block : current_block,
                    auth : this.graduation_authority
                });
                await this.put('grdtx/'+this.tx, length);
                await this.put('grd', length + 1);
            }
            await this.put(total_spent_key, total_spent.toString());
            await this.put(this.protocol.getBalanceKey(this.address, tap_deployment.tick), tap_balance.toString());
            await this.put(liq_key, liquidity.toString());
            await this.put('d/'+tick, deployment);
            await this.put('b/'+this.address+'/'+tick, balance.toString());
            const token_exists = await this.get('te/'+this.address+'/'+tick);
            if(null === token_exists){
                let tokens_length = await this.get('tl/'+this.address);
                if(null === tokens_length){
                    tokens_length = 0;
                }
                await this.put('ti/'+this.address+'/'+tokens_length, this.value.tick.trim().toLowerCase());
                await this.put('tl/'+this.address, tokens_length + 1);
                await this.put('te/'+this.address+'/'+tick, true);
            }
            await this.collectGas(this.address, this.validator_address);
            if(true === this.protocol.peer.options.enable_logs){
                console.log('Minting ticker', this.value.tick.trim().toLowerCase(),
                    ',',
                    'completed ', this.protocol.fromBigIntString(deployment.com, deployment.dec),
                    '/',
                    this.protocol.fromBigIntString(deployment.supply, deployment.dec),
                    ' Liquidity',
                    this.protocol.fromBigIntString(liquidity.toString(), tap_deployment.dec),
                    ' Reserve',
                    this.protocol.fromBigIntString(reserve.toString(), tap_deployment.dec),
                    'by',
                    this.address)
            }
        } else {
            return new Error('Invalid amount or minted out');
        }
    }

    async burnfun(){
        const tick = this.protocol.safeJsonStringify(this.value.tick.trim().toLowerCase());
        const deployment = await this.get('d/'+tick);
        let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
        if(null === tap_deployment) return new Error('TAP token not found');
        if(null === deployment) return new Error('Token does not exist.');
        if(null === deployment.fun || null === deployment.fun.target_price || null === deployment.fun.blocks) return new Error('Only fun');
        let reserve = await this.get('rsrv/'+tick);
        if(null === reserve){
            reserve = 0n;
        } else {
            reserve = this.protocol.safeBigInt(reserve);
            if(null === reserve) return new Error('Invalid reserve');
        }
        if(reserve <= 0n) return new Error('Invalid reserve');
        let from_balance = await this.get('b/'+this.address+'/'+tick);
        if(null === from_balance){
            from_balance = 0n;
        } else {
            from_balance = this.protocol.safeBigInt(from_balance);
            if(null === from_balance) return new Error('Invalid from balance');
        }
        let return_amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));
        if(null === return_amt || return_amt <= 0n || return_amt > from_balance) return new Error('Invalid return');
        let remaining = this.protocol.safeBigInt(deployment.fun.rem);
        if(null === remaining || remaining <= 0n) return new Error('Invalid remaining');
        const price = (reserve * 10n**18n) / remaining;
        const _return = (return_amt * price) / 10n**18n;
        reserve -= _return;
        if(reserve < 0n) return new Error('Invalid reserve amount');
        remaining = remaining - return_amt;
        if(remaining < 0n) return new Error('Invalid remaining amount');
        from_balance -= return_amt;
        if(from_balance < 0n) return new Error('Invalid balance');
        deployment.fun.rem = remaining.toString();
        deployment.fun.res = reserve.toString();
        let tap_balance = await this.get(this.protocol.getBalanceKey(this.address, tap_deployment.tick))
        if(null === tap_balance){
            tap_balance = 0n;
        } else {
            tap_balance = this.protocol.safeBigInt(tap_balance);
            if(null === tap_balance) return new Error('Invalid balance');
        }
        tap_balance += _return;
        let gas = await this.protocol.safeBigInt(await this.get('gas'));
        if(null === gas || gas < 0n) gas = 0n;
        if(tap_balance - gas < 0n) return new Error('No gas funds. Get some TAP.');
        await this.put(this.protocol.getBalanceKey(this.address, tap_deployment.tick), tap_balance.toString());
        await this.put('b/'+this.address+'/'+tick, from_balance.toString());
        await this.put('rsrv/'+tick, reserve.toString());
        await this.put('d/'+tick, deployment);
        await this.collectGas(this.address, this.validator_address);
        if(true === this.protocol.peer.options.enable_logs){
            console.log('Burn returned',
                this.address,
                this.value.tick.trim().toLowerCase(),
                'price', this.protocol.fromBigIntString(price.toString(), tap_deployment.dec),
                'return', this.protocol.fromBigIntString(_return.toString(), tap_deployment.dec),
                'reserve', this.protocol.fromBigIntString(reserve.toString(), tap_deployment.dec),
                'return amount', this.protocol.fromBigIntString(return_amt.toString(), deployment.dec),
                'remaining amount', this.protocol.fromBigIntString(remaining.toString(), deployment.dec)
            );
        }
    }

    async refun(){
        let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
        if(null === tap_deployment) return new Error('TAP token not found');
        const tick = this.protocol.safeJsonStringify(this.value.tick.trim().toLowerCase());
        const deployment = await this.get('d/'+tick);
        if(null === deployment) return new Error('Token does not exist.');
        if(null === deployment.fun || null === deployment.fun.target_price || null === deployment.fun.blocks) return new Error('Only fun');
        const current_block = await this.get('currentBlock');
        if(null === current_block) return new Error('No blocks registered yet');
        const blocks = parseInt(deployment.fun.blocks);
        const start_block = await this.get('strtblck/'+tick);
        if(null === start_block) return new Error('Invalid start block');
        if(current_block - start_block > blocks && deployment.fun.liq === '0') {
            const total_spent_key = 'spnt/'+this.address+'/'+tick;
            let total_spent = await this.get(total_spent_key);
            if(null === total_spent){
                total_spent = 0n;
            } else {
                total_spent = this.protocol.safeBigInt(total_spent);
                if(null === total_spent) return new Error('Invalid total spent');
            }
            if(total_spent <= 0) return new Error('Nothing to refun');
            let tap_balance = await this.get(this.protocol.getBalanceKey(this.address, tap_deployment.tick))
            if(null === tap_balance){
                tap_balance = 0n;
            } else {
                tap_balance = this.protocol.safeBigInt(tap_balance);
                if(null === tap_balance) return new Error('Invalid balance');
            }
            tap_balance += total_spent;
            let gas = await this.protocol.safeBigInt(await this.get('gas'));
            if(null === gas || gas < 0n) gas = 0n;
            if(tap_balance - gas < 0n) return new Error('Invalid gas balance');
            await this.put(this.protocol.getBalanceKey(this.address, tap_deployment.tick), tap_balance.toString())
            await this.put(total_spent_key, '0');
            await this.collectGas(this.address, this.validator_address);
            if(true === this.protocol.peer.options.enable_logs){
                console.log('Refun', this.address, tap_deployment.tick, this.protocol.fromBigIntString(total_spent.toString(), tap_deployment.dec));
            }
        } else {
            return new Error('No refun');
        }
    }

    async transfer(){
        if(false === await this.hasGas(this.address)) return new Error('No gas funds. Get some TAP.');
        let address = this.address;
        if(null !== this.value.from && null !== this.value.sig && null !== this.value.nonce){
            if(null !== await this.get('s/'+this.value.sig)) return new Error('Sig exists');
            let sig_value = this.value.tick.trim().toLowerCase() + this.value.addr + this.value.amt + this.value.from + this.protocol.peer.bootstrap;
            if(null !== this.value.dta) {
                sig_value += this.value.dta;
            }
            const verified = this.protocol.peer.wallet.verify(
                this.value.sig, sig_value + this.value.nonce, this.value.from);
            if(false === verified) return new Error('Not authorized');
            await this.put('s/'+this.value.sig, '');
            address = this.value.from;
        }
        if((address+'').trim().toLowerCase() === (this.value.addr+'').trim().toLowerCase()) return new Error('Cannot send to yourself');
        const tick = this.protocol.safeJsonStringify(this.value.tick.trim().toLowerCase());
        const deployment = await this.get('d/'+tick);
        if(null === deployment) return new Error('Token does not exist.');
        if(this.value.addr.length !== 64) return new Error('Invalid address');
        if(address.length !== 64) return new Error('Invalid address');
        const amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));
        if(null === amt || amt <= 0n) return new Error('Invalid amount');
        let from_balance = await this.get('b/'+address+'/'+tick);
        if(null === from_balance){
            from_balance = 0n;
        } else {
            from_balance = this.protocol.safeBigInt(from_balance);
            if(null === from_balance) return new Error('Invalid from balance');
        }
        from_balance -= amt;
        if(from_balance < 0n) return new Error('Insufficient funds');
        let to_balance = await this.get('b/'+this.value.addr+'/'+tick);
        if(null === to_balance){
            to_balance = 0n;
        } else {
            to_balance = this.protocol.safeBigInt(to_balance);
            if(null === to_balance) return new Error('Invalid to balance');
        }
        to_balance += amt;

        const token_exists = await this.get('te/'+this.value.addr+'/'+tick);
        if(null === token_exists){
            let tokens_length = await this.get('tl/'+this.value.addr);
            if(null === tokens_length){
                tokens_length = 0;
            }
            await this.put('ti/'+this.value.addr+'/'+tokens_length, this.value.tick.trim().toLowerCase());
            await this.put('tl/'+this.value.addr, tokens_length + 1);
            await this.put('te/'+this.value.addr+'/'+tick, true);
        }

        // global transfer list
        let length = await this.get('tfl');
        if(null === length){
            length = 0;
        }
        await this.put('tfi/'+length, {
            tick : this.value.tick.trim().toLowerCase(),
            from : address,
            to : this.value.addr,
            amt : amt.toString(),
            dta : this.value.dta,
            tx : this.tx
        });
        await this.put('tfl', length + 1);

        // receiver transfer list, referencing global list
        let to_length = await this.get('tflt/'+this.value.addr);
        if(null === to_length){
            to_length = 0;
        }
        await this.put('tflti/'+this.value.addr+'/'+to_length, length);
        await this.put('tflt/'+this.value.addr, to_length + 1);

        // sender transfer list, referencing global list
        let from_length = await this.get('tflf/'+address);
        if(null === from_length){
            from_length = 0;
        }

        await this.put('tflfi/'+address+'/'+from_length, length);
        await this.put('tflf/'+address, from_length + 1);

        await this.put('b/'+address+'/'+tick, from_balance.toString());
        await this.put('b/'+this.value.addr+'/'+tick, to_balance.toString());
        await this.collectGas(this.address, this.validator_address);
        if(true === this.protocol.peer.options.enable_logs){
            console.log('Transferred ticker', this.value.tick.trim().toLowerCase(),
                ',',
                'amount', this.protocol.fromBigIntString(amt.toString(), deployment.dec),
                ',',
                'from',address,
                ',',
                'to', this.value.addr
            )
        }
    }

    async hasGas(address){
        let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
        if(null === tap_deployment) return false;
        const gas = await this.protocol.safeBigInt(await this.get('gas'));
        if(null === gas || gas <= 0n) return true;
        let tap_balance = await this.get(this.protocol.getBalanceKey(address, tap_deployment.tick))
        if(null === tap_balance){
            tap_balance = 0n;
        } else {
            tap_balance = this.protocol.safeBigInt(tap_balance);
            if(null === tap_balance) return false;
        }
        tap_balance -= gas;
        if(tap_balance < 0n) return false;
        return true;
    }

    async collectGas(address, validator){
        let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
        if(null === tap_deployment) return new Error('TAP token not found');
        const gas = await this.protocol.safeBigInt(await this.get('gas'));
        if(null === gas || gas <= 0n) return true;
        let tap_balance = await this.get(this.protocol.getBalanceKey(address, tap_deployment.tick))
        if(null === tap_balance){
            tap_balance = 0n;
        } else {
            tap_balance = this.protocol.safeBigInt(tap_balance);
            if(null === tap_balance) return new Error('Invalid balance');
        }
        let tap_balance_validator = await this.get(this.protocol.getBalanceKey(validator, tap_deployment.tick))
        if(null === tap_balance_validator){
            tap_balance_validator = 0n;
        } else {
            tap_balance_validator = this.protocol.safeBigInt(tap_balance_validator);
            if(null === tap_balance_validator) return new Error('Invalid balance');
        }
        tap_balance -= gas;
        tap_balance_validator += gas;
        if(tap_balance < 0n) return new Error('Insufficient funds');
        await this.put(this.protocol.getBalanceKey(address, tap_deployment.tick), tap_balance.toString());
        if(address !== validator){
            await this.put(this.protocol.getBalanceKey(validator, tap_deployment.tick), tap_balance_validator.toString());
        }
        return true;
    }

    async setMinLiquidity() {
        if(this.address !== await this.get('admin')) return false;
        let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
        if(null === tap_deployment) return new Error('TAP token not found');
        const min_liquidity = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.minliq, tap_deployment.dec));
        if(null === min_liquidity || min_liquidity < 0n) return new Error('Invalid min liquidity');
        await this.put('minliq', min_liquidity.toString());
    }

    async setGas() {
        if(this.address !== await this.get('admin')) return false;
        let tap_deployment = await this.get(this.protocol.getDeploymentKey(this.tap_token));
        if(null === tap_deployment) return new Error('TAP token not found');
        const gas = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.gas, tap_deployment.dec));
        if(null === gas || gas < 0n || gas > 1000000000000000000n) return new Error('Invalid gas');
        await this.put('gas', gas.toString());
    }

    async transferFeature(){
        let address = this.address;
        if(this.value.addr.length !== 64) return new Error('Invalid address');
        if(address.length !== 64) return new Error('Invalid address');
        if(null !== this.value.from && null !== this.value.sig && null !== this.value.nonce){
            if(null !== await this.get('s/'+this.value.sig)) return new Error('Sig exists');
            let sig_value = this.value.tick.trim().toLowerCase() + this.value.addr + this.value.amt + this.value.from + this.protocol.peer.bootstrap;
            if(null !== this.value.dta) {
                sig_value += this.value.dta;
            }
            const verified = this.protocol.peer.wallet.verify(
                this.value.sig, sig_value + this.value.nonce, this.value.from);
            if(false === verified) return new Error('Not authorized');
            await this.put('s/'+this.value.sig, '');
            address = this.value.from;
        }
        if((address+'').trim().toLowerCase() === (this.value.addr+'').trim().toLowerCase()) return new Error('Cannot send to yourself');
        let balance = await this.get(this.protocol.getBalanceKey(address, this.value.tick));
        if(null === balance) return new Error('No transferable balance');
        balance = this.protocol.safeBigInt(balance);
        if(null === balance) return new Error('Invalid balance');

        let deployment = await this.get(this.protocol.getDeploymentKey(this.value.tick));
        if(null === deployment) return new Error('Not deployed');

        const amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));
        if(null === amt) return new Error('Invalid amount');
        let gas = await this.protocol.safeBigInt(await this.get('gas'));
        if(null === gas || gas < 0n) gas = 0n;
        if(balance - amt - gas < 0n) return new Error('Insufficient balance');

        let rec_balance = await this.get(this.protocol.getBalanceKey(this.value.addr, this.value.tick));

        if(null === rec_balance){
            rec_balance = 0n;
        } else {
            rec_balance = this.protocol.safeBigInt(rec_balance);
            if(null === rec_balance) return new Error('Invalid rec balance');
        }

        rec_balance += amt;
        balance -= amt;

        // global transfer list
        let length = await this.get('ttfl');
        if(null === length){
            length = 0;
        }
        await this.put('ttfi/'+length, {
            tick : this.value.tick.trim().toLowerCase(),
            from : address,
            to : this.value.addr,
            amt : amt.toString(),
            dta : this.value.dta,
            tx : this.tx
        });
        await this.put('ttfl', length + 1);

        // receiver transfer list, referencing global list
        let to_length = await this.get('ttflt/'+this.value.addr);
        if(null === to_length){
            to_length = 0;
        }
        await this.put('ttflti/'+this.value.addr+'/'+to_length, length);
        await this.put('ttflt/'+this.value.addr, to_length + 1);

        // sender transfer list, referencing global list
        let from_length = await this.get('ttflf/'+address);
        if(null === from_length){
            from_length = 0;
        }

        await this.put('ttflfi/'+address+'/'+from_length, length);
        await this.put('ttflf/'+address, from_length + 1);

        await this.put(this.protocol.getBalanceKey(address, this.value.tick), balance.toString());
        await this.put(this.protocol.getBalanceKey(this.value.addr, this.value.tick), rec_balance.toString());
        await this.collectGas(this.address, this.validator_address);
        return true;
    }

    async deployFeature() {
        if(this.address !== await this.get('admin')) return false;
        if(null === await this.get(this.protocol.getDeploymentKey(this.value.tick))) {
            const cloned = this.protocol.safeClone(this.op.value);
            if(cloned === null) return new Error('Invalid clone');
            cloned.max = this.protocol.toBigIntString(this.value.max, this.value.dec);
            cloned.lim = this.protocol.toBigIntString(this.value.lim, this.value.dec);
            const big_max = this.protocol.safeBigInt(cloned.max);
            const big_lim = this.protocol.safeBigInt(cloned.lim);
            if(null === big_max || null == big_lim || big_max < 0n || big_lim < 0n) return new Error('Invalid max');
            await this.put(this.protocol.getDeploymentKey(this.value.tick), cloned);
            console.log(`Deployment added: ${cloned.tick}`);
            return true;
        }
        return false;
    }

    async withdrawRequestFeature() {
        let address = this.address;

        let deployment = await this.get(this.protocol.getDeploymentKey(this.value.tick));

        if(null === deployment) return new Error('Invalid ticker');

        let balance = await this.get(this.protocol.getBalanceKey(address, this.value.tick))

        if(null === balance) {
            balance = 0n;
        } else {
            balance = this.protocol.safeBigInt(balance);
            if(null === balance) return new Error('Invalid balance');
        }

        let amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));

        if(null === amt || amt <= 0n || balance - amt < 0n) return new Error('Invalid amount');

        balance -= amt;

        let length = await this.get(this.protocol.getWithdrawRequestLengthKey());
        if(null === length){
            length = 0;
        }
        let user_request_length = await this.get(this.protocol.getUserWithdrawRequestLengthKey(address));
        if(null === user_request_length){
            user_request_length = 0;
        }
        await this.put(this.protocol.getWithdrawRequestKey(length), {
            addr : this.value.addr,
            tick : this.value.tick,
            amt: amt.toString(),
            dec : deployment.dec,
            tx : this.tx
        });
        await this.put(this.protocol.getWithdrawRequestLengthKey(), length + 1);
        await this.put(this.protocol.getUserWithdrawRequestKey(address, user_request_length), this.protocol.getWithdrawRequestKey(length));
        await this.put(this.protocol.getUserWithdrawRequestLengthKey(address), user_request_length + 1);
        await this.put(this.protocol.getBalanceKey(address, this.value.tick), balance.toString());
        console.log('Withdraw request placed', address, this.op.value);
    }

    async withdrawFeature() {
        if(this.address !== await this.get('admin')) return false;
        if(null !== await this.get(this.protocol.getRedeemKey(this.value.tx))) return new Error('Invalid redeem');
        await this.put(this.protocol.getRedeemKey(this.value.tx), this.value.ins);
        console.log('Withdraw granted', this.value.tx, this.value.ins);
    }

    async depositFeature() {
        if(this.address !== await this.get('admin')) return false;
        let address = this.value.addr;
        let deployment = await this.get(this.protocol.getDeploymentKey(this.value.tick));

        if(null === deployment) return new Error('Invalid deployment');

        let balance = await this.get(this.protocol.getBalanceKey(address, this.value.tick))

        if(null === balance) {
            balance = 0n;
        } else {
            balance = this.protocol.safeBigInt(balance);
            if(null === balance) return new Error('Invalid balance');
        }

        let amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));

        if(null === amt || amt <= 0n) return new Error('Invalid amount');

        balance += amt;

        if(balance < 0n) return new Error('Balance too low');

        await this.put(this.protocol.getBalanceKey(address, this.value.tick), balance.toString());
        console.log(`Deposit added:`, this.op.value);
    }
}

export default HypertokensContract;
