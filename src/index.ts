import { startServer } from './start-server';

process.on('uncaughtException', e => console.log(e));

process.on('unhandledRejection', e => console.log(e));

startServer();
