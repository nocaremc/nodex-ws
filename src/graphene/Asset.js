/**
 * string - id
 * string - symbol
 * integer - precision
 * string - issuer
 * AssetOptions - options {
 *      string? - max_supply,
 *      float/int - market_fee_percent
 *      string - max_market_fee
 *      integer - issuer_permissions
 *      integer - flags
 *      Object - core_exchange_rate {
 *          Object - base {amount, asset_id}
 *          Object - quote {amount, asset_id}
 *      }
 *      array - whitelist_authorities
 *      array - blacklist_authorities
 *      array - whitelist_markets
 *      array - blacklist_markets
 *      string - description
 *      array - extensions
 * }
 * string - dynamic_asset_data_id
 * string - bitasset_data_id
 */
class Asset {

}

module.exports = Asset