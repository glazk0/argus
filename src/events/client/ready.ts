import ArgusClient from '../../structures/ArgusClient';

export default class {
  client: ArgusClient;
  constructor(client: ArgusClient) {
    this.client = client;
  }
  async run() {
    console.log('helo');
  }
}
