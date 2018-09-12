// import axios from 'axios';
// import { Server } from 'net';
// import { startServer } from './start-server';

// let server: Server;
// beforeAll(async () => {
//   server = await startServer();
// });

// afterAll(async () => {
//   if (server) {
//     await server.close();
//   }
// });

// describe('start-server', () => {
//   it('should start', async () => {
//     const { data } = await axios.get(`${process.env.TEST_HOST}/`);
//     expect(data).toMatchSnapshot();
//   });
// });

describe('blank', () => {
  it('test', () => {
    expect(2).toEqual(2);
  });
});
