const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    if (users.find((user) => user.username === username)) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    users.push({ username, password });

    return res.status(201).json({
      message: "User registered successfully",
      username: username,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const getAllBooks = async () => {
      return new Promise((resolve, reject) => {
        if (Object.keys(books).length === 0) {
          reject("No books available");
        }
        resolve(books);
      });
    };

    const booksList = await getAllBooks();
    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;

    const getBookByISBN = async (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(`Book with ISBN ${isbn} not found`);
        }
      });
    };

    const bookDetails = await getBookByISBN(isbn);
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;

    const getBooksByAuthor = async (authorName) => {
      return new Promise((resolve, reject) => {
        const authorBooks = Object.values(books).filter(
          (book) => book.author.toLowerCase() === authorName.toLowerCase(),
        );

        if (authorBooks.length > 0) {
          resolve(authorBooks);
        } else {
          reject(`No books found for author: ${authorName}`);
        }
      });
    };

    const bookDetails = await getBooksByAuthor(author);
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;

    const getBooksByTitle = async (searchTitle) => {
      return new Promise((resolve, reject) => {
        const titleBooks = Object.values(books).filter((book) =>
          book.title.toLowerCase().includes(searchTitle.toLowerCase()),
        );

        if (titleBooks.length > 0) {
          resolve(titleBooks);
        } else {
          reject(`No books found with title containing: ${searchTitle}`);
        }
      });
    };

    const bookDetails = await getBooksByTitle(title);
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  try {
    // Get the ISBN from request parameters
    const isbn = req.params.isbn;

    if (books[isbn]) {
      if (books[isbn].reviews) {
        return res.status(200).json({
          isbn: isbn,
          reviews: books[isbn].reviews,
        });
      } else {
        return res
          .status(404)
          .json({ message: `No reviews found for book with ISBN ${isbn}` });
      }
    } else {
      return res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found` });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports.general = public_users;
