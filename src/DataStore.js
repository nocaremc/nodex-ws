const Dict = require('collections/dict')
const log = require('./Log.js')
const Asset = require('./graphene/Asset.js')
let map = new WeakMap()

class DataStore {

    constructor(eventEmitter) {
        map.set(this, {
            assetsMap: new Dict(),
            assets: new Dict(),
            events: eventEmitter
        })

        this.on('store.assets', (data) => {
            this.storeAssets(data)
        })
    }

    /**
     * @return assets map collection
     */
    get assetsMap() {
        return map.get(this).assetsMap
    }

    /**
     * @return assets collection
     */
    get assets() {
        return map.get(this).assets
    }

    /**
     * Get an Asset by key
     * @param {string} key Asset symbol or ID
     * @return Asset | false
     */
    getAsset(key) {
        if(key) {
            if(this.assetsMap.has(key)) {

                let asset_id = this.assetsMap.get(key)
                
                if(this.assets.has(asset_id)) {
                    return this.assets.get(asset_id)
                } else {
                    log.error("Could not find asset with asset_id: " + asset_id)
                }
            } else {
                log.error("Could not find asset with key: " + key)
            }
        } else {
            log.error("Key in getAsset undefined")
        }

        return false
    }

    /**
     * Get Assets corresponding to keys array
     * @param {Array} keys array containing asset symbols and/or IDs
     * 
     * @return Array of Assets or false
     */
    getAssets(keys) {
        if(!Array.isArray(keys)) {
            log.error("keys in getAssets MUST be an array")
            return false
        }

        return keys.map(key => this.getAsset(key))
    }

    /**
     * 
     * @param {array} data array of asset objects (literals only?)
     */
    storeAssets(data) {
        log.info('Adding/updating some assets')
        // Iterate assets. If key does not exist, store it.
        let saved_assets = data.map((asset) => {
            asset = Object.assign(new Asset, asset)
            // Check if asset id or symbol is mapped
            if(!this.assetsMap.has(asset.id) && !this.assetsMap.has(asset.symbol)) {
                // Store potential keys in asset map
                this.assetsMap.set(asset.id, asset.id)
                this.assetsMap.set(asset.symbol, asset.id)
                
                // Store asset
                this.assets.set(asset.id, asset)
            }
            return asset
        })
        
        // Notify 
        this.emit('store.assets.stored', saved_assets)
    }

    /**
     * Attach an event to EventEmitter 
     * @param {string} event event name
     * @param {function} callback 
     */
    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    /**
     * Emit an event using EventEmitter
     * @param {string} event event name
     * @param {anything} data 
     */
    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
}

module.exports = DataStore