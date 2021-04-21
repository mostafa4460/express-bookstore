process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let book;

beforeEach(async () => {
    const data = {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    };
    book = await Book.create(data);
})
afterEach(async () => {
    await db.query("DELETE FROM books");
})

describe("GET /books", () => {
    test("Returns all books", async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({books: [book]});
    })
})

describe("GET /books/:isbn", () => {
    test("Returns a book by isbn", async () => {
        const res = await request(app).get(`/books/${book.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book});
    })
})

describe("POST /books SUCCESS", () => {
    test("Creates a new book", async () => {
        const book = {
            isbn: "1234567890",
            amazon_url: "http://site",
            author: "Test",
            language: "english",
            pages: 100,
            publisher: "Test",
            title: "Test",
            year: 2021
        };
        const res = await request(app)
            .post('/books')
            .send(book);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({book});
    })
})

describe("POST /books FAIL", () => {
    test("Returns 400 status code for missing author field", async () => {
        const book = {
            isbn: "1234567890",
            amazon_url: "http://site",
            language: "english",
            pages: 100,
            publisher: "Test",
            title: "Test",
            year: 2021
        };
        const res = await request(app)
            .post('/books')
            .send(book);
        expect(res.statusCode).toBe(400);
    })

    test("Returns 400 status code for missing isbn field", async () => {
        const book = {
            amazon_url: "http://site",
            author: "Test",
            language: "english",
            pages: 100,
            publisher: "Test",
            title: "Test",
            year: 2021
        };
        const res = await request(app)
            .post('/books')
            .send(book);
        expect(res.statusCode).toBe(400);
    })
})

describe("PUT /books/:id SUCCESS", () => {
    test("Updates an existing book", async () => {
        // Change book author
        book.author = "Moose";

        const res = await request(app)
            .put(`/books/${book.isbn}`)
            .send(book);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: expect.objectContaining({author: "Moose"})});
    })
})

describe("PUT /books/:id FAIL", () => {
    test("Returns 404 status code for invalid isbn", async () => {
        const res = await request(app)
            .put('/books/1234567890')
            .send(book);
        expect(res.statusCode).toBe(404);
    })

    test("Returns 400 status code for missing title field", async () => {
        // Remove the title property from book
        delete book.title

        const res = await request(app)
            .put(`/books/${book.isbn}`)
            .send(book);
        expect(res.statusCode).toBe(400);
    })
})

describe("DELETE /books/:isbn", () => {
    test("Deletes a book", async () => {
        const res = await request(app).delete(`/books/${book.isbn}`);
        expect(res.statusCode).toBe(200);
    })
})

afterAll(async () => {
    await db.end();
})