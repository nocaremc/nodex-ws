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


    get assetsMap() {
        return map.get(this).assetsMap
    }

    get assets() {
        return map.get(this).assets
    }

    getAsset(key) {
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

        return false
    }

    storeAssets(data) {
        log.info('Adding/updating some assets')
        // Iterate assets. If key does not exist, store it.
        data.map((asset) => {
            asset = Object.assign(new Asset, asset)
            // Check if asset id or symbol is mapped
            if(!this.assetsMap.has(asset.id) && !this.assetsMap.has(asset.symbol)) {
                this.assetsMap.set(asset.id, asset.id)
                this.assetsMap.set(asset.symbol, asset.id)
                this.assets.set(asset.id, asset)
                this.emit('store.assets.stored')
            }
        })
    }

    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
}

module.exports = DataStore