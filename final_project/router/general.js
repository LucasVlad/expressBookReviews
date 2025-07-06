const express = require("express");
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
public_users.get("/", function (req, res) {
  try {
    if (Object.keys(books).length === 0) {
      return res.status(404).json({ message: "No books available" });
    }

    return res.status(200).json(books);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  try {
    const isbn = req.params.isbn;

    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
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

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  try {
    const author = req.params.author;

    const authorBooks = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase(),
    );

    if (authorBooks.length > 0) {
      return res.status(200).json(authorBooks);
    } else {
      return res
        .status(404)
        .json({ message: `No books found for author: ${author}` });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  try {
    const title = req.params.title;

    const titleBooks = Object.values(books).filter((book) =>
      book.title.toLowerCase().includes(title.toLowerCase()),
    );

    if (titleBooks.length > 0) {
      return res.status(200).json(titleBooks);
    } else {
      return res
        .status(404)
        .json({ message: `No books found with title containing: ${title}` });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
