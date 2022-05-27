import { PubSub } from 'graphql-subscriptions';

import { authors, books } from './simpleData.js'

const pubsub = new PubSub();

export const resolvers = {
    Query: {
        books() {
            return books;
        },
        authors() {
            return authors;
        },
        book(_, args) {
            return books.find(el => el.id === args.id)
        },
        author(_, args, {cont}) {
            console.log(cont);
            return authors.find(el => el.id === args.id)
        }
    },
    Book: {
        author(parrent) {
            return authors.find(el => el.booksId.includes(parrent.id));
        }
    },
    Author: {
        books(parrent) {
            return books.filter(el => parrent.booksId.includes(el.id));
        },
    },
    Mutation: {
        addAuthor(_, args) {
            const nextId = authors[authors.length - 1].id + 1;
            const newLength = authors.push({
                id: nextId,
                name: args.name,
            });
            const addedAuthor = authors[newLength - 1];

            addedAuthor.booksId = [];    
            let nextBookId = books[books.length - 1].id + 1;
            for(let book of args.books) {
                books.push({
                    id: nextBookId,
                    title: book.title,
                });
                addedAuthor.booksId.push(nextBookId);
                nextBookId++;
            }

            return authors;
        },
        addBook(_, args) {
            const nextBookId = books[books.length - 1].id + 1;
            const newBook = {
                id: nextBookId,
                title: args.title,
            };
            books.push(newBook);

            let author = authors.find(el => el.name === args?.author.name);
            if(!author) {
                const nextAuthorId = authors[authors.length - 1].id + 1;
                const newLength = authors.push({
                    id: nextAuthorId,
                    name: args.author.name,
                    booksId: [],
                });
                author = authors[newLength - 1];
            }
            author.booksId.push(nextBookId);

            pubsub.publish('BOOK_INSERT', {
                bookInsert: newBook
            });
            return books;
        }
    },
    Subscription: {
        bookInsert: {
            subscribe: () => pubsub.asyncIterator(['BOOK_INSERT']),
        }
    }
};
