import {Contract} from 'trac-peer'

class Trac20Contract extends Contract {
    constructor(protocol, options = {}) {
        super(protocol, options);

        this.addSchema('deploy', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                supply : { type : "string", numeric : true, min: 1, max: 38 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                dec : { type : "string", numeric : true, min: 1, max: 2 }
            }
        });

        this.addSchema('mint', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 }
            }
        });

        this.addSchema('transfer', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                tick : { type : "string", min : 1, max: 128 },
                amt : { type : "string", numeric : true, min: 1, max: 38 },
                addr : { type : "is_hex" }
            }
        });

        this.messageHandler(async function(){

        });
    }

    async deploy(){
        const _dec = parseInt(this.value.dec);
        const _amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, this.value.dec));
        const _supply = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.supply, this.value.dec));
        if(isNaN(_dec) || _dec <= 0 || _dec > 18) return new Error('Invalid decimals');
        if(null === _amt || _amt <= 0n || _amt > _supply) return new Error('Invalid amount');
        if(null === _supply || _supply <= 0n) return new Error('Invalid supply');
        const key = 'd/'+this.protocol.safeJsonStringify(this.value.tick);
        const deployment = await this.get(key);
        if(null !== deployment) return new Error('Token exists already');
        const _deployment = this.protocol.safeClone(this.value);
        _deployment.amt = _amt.toString();
        _deployment.supply = _supply.toString();
        _deployment.dec = _dec;
        _deployment.com = '0';
        const length_key = 'dl/'+this.protocol.safeJsonStringify(this.value.tick);
        let length = await this.get(length_key);
        if(null === length){
            length = 0;
        }
        await this.put('dli/'+length, key);
        await this.put(length_key, length + 1);
        await this.put(key, _deployment);
        if(true === this.protocol.peer.options.enable_logs){
            console.log('Deployed ticker', this.value.tick,
                ',',
                'supply:', this.protocol.fromBigIntString(_deployment.supply, _deployment.dec),
                ',',
                'amount:', this.protocol.fromBigIntString(_deployment.amt, _deployment.dec),
                'by',
                this.address)
        }
    }

    async mint(){
        const tick = this.protocol.safeJsonStringify(this.value.tick);
        const deployment = await this.get('d/'+tick);
        if(null === deployment) return new Error('Token does not exist.');
        const supply = this.protocol.safeBigInt(deployment.supply);
        let amt = this.protocol.safeBigInt(deployment.amt);
        let com = this.protocol.safeBigInt(deployment.com);
        let left = supply - com;
        if(left > 0n){
            if(amt > left) amt = left;
            let balance = await this.get('b/'+this.address+'/'+tick);
            if(null === balance){
                balance = 0n;
            } else {
                balance = this.protocol.safeBigInt(balance);
            }
            balance += amt;
            com += amt;
            deployment.com = com.toString();
            await this.put('d/'+tick, deployment);
            await this.put('b/'+this.address+'/'+tick, balance.toString());
            if(true === this.protocol.peer.options.enable_logs){
                console.log('Minting ticker', this.value.tick,
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

    async transfer(){
        if((this.address+'').trim().toLowerCase() === (this.value.addr+'').trim().toLowerCase()) return new Error('Cannot send to yourself');
        const tick = this.protocol.safeJsonStringify(this.value.tick);
        const deployment = await this.get('d/'+tick);
        if(null === deployment) return new Error('Token does not exist.');
        if(this.value.addr.length < 64) return new Error('Invalid address');
        const amt = this.protocol.safeBigInt(this.protocol.toBigIntString(this.value.amt, deployment.dec));
        if(null === amt || amt <= 0n) return new Error('Invalid amount');
        let from_balance = await this.get('b/'+this.address+'/'+tick);
        if(null === from_balance){
            from_balance = 0n;
        } else {
            from_balance = this.protocol.safeBigInt(from_balance);
        }
        from_balance -= amt;
        if(from_balance < 0n) return new Error('Insufficient funds');
        let to_balance = await this.get('b/'+this.value.addr+'/'+tick);
        if(null === to_balance){
            to_balance = 0n;
        } else {
            to_balance = this.protocol.safeBigInt(to_balance);
        }
        to_balance += amt;
        await this.put('b/'+this.address+'/'+tick, from_balance.toString());
        await this.put('b/'+this.value.addr+'/'+tick, to_balance.toString());
        if(true === this.protocol.peer.options.enable_logs){
            console.log('Transferred ticker', this.value.tick,
                ',',
                'amount', this.protocol.fromBigIntString(amt.toString(), deployment.dec),
                ',',
                'from',this.address,
                ',',
                'to', this.value.addr
            )
        }
    }
}

export default Trac20Contract;
