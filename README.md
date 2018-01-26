nodex-ws will be a Node.js + Websockets library for the bitshares dex allowing developers who do not want to use python to jump into writing trading applications.
Disclaimer: Nobody has taught me node or websockets. Should be some ugly fun but that is why we iterate.

While I do want to learn, I'm writing this on fumes. R&D on my end will be limited to just getting things to a functional state.

# Things I want in this library

- [x] authenticate with any account (web)
- [x] list the balances of accounts
- [ ] send money to other accounts
- [ ] obtain a list of all assets
- [ ] obtain a list of all asset pairs
- [ ] check the ticker price of any asset pair
- [ ] check the buys and sells of any asset pair
- [ ] check the buys and sells of accounts
- [ ] manage buys and sells for any asset pair

# wishlist (and maybe not belonging in this library)

- [ ] authenticate with other methods
- [ ] check the state of margins for accounts
- [ ] manage margins for accounts
- [ ] a hookable/actionable event system for all actions (eg. monitoring margins and taking action)
- [ ] use the first public working or configured (and working) dex rpc node.
- [ ] Structure and organization of code meeting an actually specified standard.
- [ ]  I will not put up crap-looking code but also am not a psr-nazi. Technical standards and consistency are still important to me.


# Libraries used
- websockets/ws - https://github.com/websockets/ws
- dotenv - https://github.com/motdotla/dotenv