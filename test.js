const { Rarity, Network } = require('./lib');

const rarity = new Rarity({
  network: Network.ETH_MAINNET,
  alchemyApiKey: 'hokuxFqMdR-3dsEE2nOy6WvJ26Y27hnR',
});

rarity.getNftsRarityScore("0x9ada21A8bc6c33B49a089CFC1c24545d2a27cD81", {
  showRank: true
}).then(res => {
  console.log(res);
});
