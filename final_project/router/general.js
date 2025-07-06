const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
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
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
