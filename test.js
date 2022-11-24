const { Rarity, Network } = require('./lib/index');

const rarity = new Rarity({
  network: Network.ETH_MAINNET,
  alchemyApiKey: 'hokuxFqMdR-3dsEE2nOy6WvJ26Y27hnR',
});

rarity.getNftsForContract("0x60bb1e2aa1c9acafb4d34f71585d7e959f387769").then(res => {
  console.log(res);
});
