/** @typedef {import('pear-interface')} */
export function getStorePath(){
    let store_path = '';
    if(typeof process !== "undefined" ) {
        if(process.argv[27] !== undefined){
            const args = JSON.parse(process.argv[27]);
            if(args.flags.store !== undefined){
                store_path = args.flags.store;
            }
        }
        if(store_path === '' &&
            process.argv[2] !== undefined &&
            process.argv[2].startsWith('--user-data-dir=')){
            store_path = process.argv[2].split('=')[1];
        }
        if(store_path === ''){
            store_path = process.argv[2];
        }
    } else if(global.Pear !== undefined){
        if(global.Pear.config.args[0] !== undefined){
            store_path = global.Pear.config.args[0];
        } else {
            store_path = global.Pear.config.storage;
        }
    }
    if(store_path === ''){
        throw new Error('No store path given.');
    }
    return store_path;
}