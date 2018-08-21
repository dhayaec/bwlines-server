import { startServer } from './start-server';

process.on('uncaughtException', e => console.log(e));

process.on('unhandledRejection', e => console.log(e));

startServer();

// TODO Category resolver
// * crud
// TODO Book resolver
// * add
// * edit
// * delete
// * list (year,category,paginate)
// * search (book title)
