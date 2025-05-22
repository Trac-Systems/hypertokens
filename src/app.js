import ReadyResource from "ready-resource";
import {Peer, Wallet} from "trac-peer";
import {MainSettlementBus} from 'trac-msb/src/index.js';

export class App extends ReadyResource {
    constructor(msb_opts, peer_opts, features = []) {
        super();
        this.msb = null;
        this.peer = null;
        this.features = features;
        this.msb_opts = msb_opts;
        this.peer_opts = peer_opts;
    }

    async start(){
        this.msb_opts.stores_directory = '';
        this.msb_opts.enable_wallet = false;
        this.msb_opts.enable_updater = false;
        this.msb_opts.enable_interactive_mode = false;
        console.log('=============== STARTING MSB ===============');
        this.msb = new MainSettlementBus(this.msb_opts);
        const _this = this;
        await this.msb.ready();
        console.log('=============== STARTING PEER ===============');
        this.peer_opts.stores_directory = '';
        this.peer_opts.msb = this.msb;
        this.peer_opts.wallet = new Wallet();
        this.peer = new Peer(this.peer_opts);
        await this.peer.ready();
        console.log('Peer is ready.');
        const admin = await this.peer.base.view.get('admin');
        if(null !== admin && this.peer.wallet.publicKey === admin.value && this.peer.base.writable) {
            for(let i = 0; i < this.features.length; i++){
                const name = this.features[i].name;
                const _class = this.features[i].class;
                const opts = this.features[i].opts;
                const obj = new _class(this.peer, opts);
                await this.peer.protocol_instance.addFeature(name, obj);
                obj.start();
            }
        }
        this.peer.interactiveMode();
        _this.ready().catch(function(){});
    }

    getPeer(){
        return this.peer;
    }
}