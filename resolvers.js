import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const authors =[
    { id: 5, name: 'Lev', booksId:[1,3] },
    { id: 6, name: 'Gorky', booksId:[2] }
]
const books = [
    { id: 1, title: 'First' },
    { id: 2, title: 'Second' },
    { id: 3, title: 'Third' }
];

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
        author(_, args) {
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

            const author = authors.find(el => el.name === args?.author.name);
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
