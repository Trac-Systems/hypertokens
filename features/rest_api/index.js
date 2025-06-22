import {Feature} from 'trac-peer';
import http from 'bare-http1';
import url from 'bare-url';

export class HypertokensRestApi extends Feature {

    constructor(peer, options = {}) {
        super(peer, options);
        this.enabled = true === options.enabled;
        this.port = options.port || 3000;
        this.host = options.host || 'localhost';
    }

    respond(res, value, status = 200){
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(value, null, 2));
    }

    async start(options = {}) {
        if(true !== this.enabled) return;
        const _this = this;
        const not_found = { err : 'Not found' };
        const port = this.port;
        const host = this.host;
        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse('http://' + host + req.url);
            const pathname = parsedUrl.pathname;
            if(pathname.startsWith('/token')){
                const pieces = pathname.split('/', 3);
                const ticker = pieces[2];
                if(ticker !== undefined) {
                    const key = 'd/'+this.peer.protocol_instance.safeJsonStringify(ticker.trim().toLowerCase());
                    const deployment = await this.getSigned(key);
                    if(null !== deployment){
                        _this.respond(res, deployment);
                    } else {
                        _this.respond(res, not_found, 404);
                    }
                } else {
                    _this.respond(res, not_found, 404);
                }
            } else if(pathname.startsWith('/graduated-length')){
                let length = await this.getSigned('grd');
                if(null === length) length = 0;
                _this.respond(res, length);
            } else if(pathname.startsWith('/graduated/')){
                const pieces = pathname.split('/', 3);
                const index = parseInt(pieces[2]);
                if(false === isNaN(index)) {
                    let graduated_entry = await this.getSigned('grdi/'+index);
                    if(null === graduated_entry) {
                        _this.respond(res, not_found, 404);
                    } else {
                        _this.respond(res, graduated_entry);
                    }
                } else {
                    _this.respond(res, not_found, 404);
                }
            } else if(pathname.startsWith('/transferred-length')){
                let length = await this.getSigned('tfl');
                if(null === length) length = 0;
                _this.respond(res, length);
            } else if(pathname.startsWith('/transferred/')){
                const pieces = pathname.split('/', 3);
                const index = parseInt(pieces[2]);
                if(false === isNaN(index)) {
                    let transferred_entry = await this.getSigned('tfi/'+index);
                    if(null === transferred_entry) {
                        _this.respond(res, not_found, 404);
                    } else {
                        _this.respond(res, transferred_entry);
                    }
                } else {
                    _this.respond(res, not_found, 404);
                }
            } else if(pathname.startsWith('/tap-transferred-length')){
                let length = await this.getSigned('ttfl');
                if(null === length) length = 0;
                _this.respond(res, length);
            } else if(pathname.startsWith('/tap-transferred/')){
                const pieces = pathname.split('/', 3);
                const index = parseInt(pieces[2]);
                if(false === isNaN(index)) {
                    let transferred_entry = await this.getSigned('ttfi/'+index);
                    if(null === transferred_entry) {
                        _this.respond(res, not_found, 404);
                    } else {
                        _this.respond(res, transferred_entry);
                    }
                } else {
                    _this.respond(res, not_found, 404);
                }
            } else {
                _this.respond(res, not_found, 404);
            }
        });
        server.listen(port, host);
    }

    async stop(options = {}) { }
}

export default HypertokensRestApi;