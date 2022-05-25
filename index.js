import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import {readFileSync} from 'fs';
import * as path from 'path';

import { resolvers } from './resolvers.js';

const typeDefs = readFileSync(path.resolve('schema.graphql'), 'utf8');

const startApolloServer = async (typeDefs, resolvers) => {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
    });

    await server.start();
    server.applyMiddleware({
        app,
        path: '/',
    });

    await new Promise(res => httpServer.listen({port: 4000}, res));
    console.log(`http://localhost:4000${server.graphqlPath}`)
};

startApolloServer(typeDefs, resolvers);