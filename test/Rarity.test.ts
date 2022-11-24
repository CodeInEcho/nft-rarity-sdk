import { Rarity, RaritySettings } from '../src/index';
import { Network } from '../src/types/types';
import { DEFAULT_NETWORK, DEFAULT_ALCHEMY_API_KEY } from '../src/util/const';

describe('Alchemy class', () => {
  it('preserves settings', () => {
    const config: RaritySettings = {
      alchemyApiKey: 'api-key-here',
      network: Network.ETH_GOERLI,
    };
    const rarity = new Rarity(config);
    config.alchemyApiKey = 'new-api-key';
    config.network = Network.OPT_MAINNET;

    expect(rarity.config.alchemyApiKey).toEqual('api-key-here');
    expect(rarity.config.network).toEqual(Network.ETH_GOERLI);
  });

  it('initializes to default values', () => {
    const rarity = new Rarity();
    expect(rarity.config.alchemyApiKey).toEqual(DEFAULT_ALCHEMY_API_KEY);
    expect(rarity.config.network).toEqual(DEFAULT_NETWORK);
  });

  // it('creates a request url based on the api type', () => {
  //   const alchemy = new Rarity({
  //     network: Network.OPT_MAINNET,
  //     alchemyApiKey: 'demo-key'
  //   });
  // });
})