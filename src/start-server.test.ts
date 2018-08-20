import axios from 'axios';
import { AddressInfo, Server } from 'net';
import { startServer } from './start-server';

let server: Server;
beforeAll(async () => {
  server = await startServer();
});

afterAll(async () => {
  await server.close();
});

describe('start-server', () => {
  it('should start', async () => {
    const { port } = server.address() as AddressInfo;
    const { data } = await axios.get(`http://localhost:${port}/ping`);
    expect(data).toEqual({ message: 'pong' });
  });
});
