
const express = require('express');
const cors = require('cors');
const { connectToMongoDB } = require('./db');
const { ObjectId } = require("mongodb");

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

async function main() {
  try {
    const db = await connectToMongoDB();
    console.log('Connected to MongoDB');

    app.get('/', (req, res) => {
      res.send('Hello, world!');
      // You can use the `db` object here to interact with MongoDB
    });

    app.post('/books', async (req, res) => {
        try {
          const { title, genre, authors, year, rating } = req.body;
  
          // Validation
          if (!title || !genre || !authors || !year || !rating) {
            return res.status(400).json({ message: 'Missing required fields' });
          }
  
          const newBook = { title, genre, authors, year, rating };
          const result = await booksCollection.insertOne(newBook);
  
          res.status(201).json(result.ops[0]);
        } catch (error) {
          res.status(500).json({ message: 'Error adding new book', error: error.message });
        }
       });

       app.get('/books', async (req, res) => {
        try {
          const books = await booksCollection.find({}).toArray();
          res.json(books);
        } catch (error) {
          res.status(500).json({ message: 'Error fetching books', error: error.message });
        }
      });
  
      // Get a single book by ID
      app.get('/books/:id', async (req, res) => {
        try {
          const id = new ObjectId(req.params.id);
          const book = await booksCollection.findOne({ _id: id });
          if (book) {
            res.json(book);
          } else {
            res.status(404).json({ message: 'Book not found' });
          }
        } catch (error) {
          res.status(500).json({ message: 'Error fetching book', error: error.message });
        }
      });
  

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

main();