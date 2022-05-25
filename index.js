import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import http from 'http';
import {readFileSync} from 'fs';
import * as path from 'path';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { resolvers } from './resolvers.js';

const typeDefs = readFileSync(path.resolve('schema.graphql'), 'utf8');
const schema = makeExecutableSchema({ typeDefs,resolvers });

const startApolloServer = async schema => {
    const app = express();
    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        plugins: [
          ApolloServerPluginDrainHttpServer({httpServer}),
          {
            async serverWillStart() {
              return {
                async drainServer() {
                    await serverCleanup.dispose();
                },
              };
            },
          },          
        ]
    });

    await server.start();
    server.applyMiddleware({
        app,
        path: '/',
    });

    await new Promise(res => httpServer.listen({port: 4000}, res));
    console.log(`http://localhost:4000${server.graphqlPath}`)
};

startApolloServer(schema);