const express = require('express');
const cors = require('cors');
const { json } = require('express');
const { connectToMongoDB } = require('./db');
const { ObjectId } = require("mongodb");

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());
app.use(json());

let db; // Declare db globally

async function main() {
  try {
    db = await connectToMongoDB();
    console.log('Connected to MongoDB');

    // Define the books collection
    const booksCollection = db.collection('books');

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
        // Fetching all books
        const books = await booksCollection.find({}).toArray();
    
        // Fetching all genres (Assuming 'genres' collection exists)
        const genres = await db.collection('genres').find({}).toArray();
        const genreMap = {};
    
        // Creating genre map using for loop
        for (let i = 0; i < genres.length; i++) {
          const genre = genres[i];
          genreMap[genre._id] = genre.name;
        }
    
        // Replacing genre IDs with genre names in books using for loops
        for (let j = 0; j < books.length; j++) {
          const book = books[j];
          // ensure that book.genres is an array
          if (Array.isArray(book.genres)) {
            for (let k = 0; k < book.genres.length; k++) {
              const genreId = book.genres[k];
              // if the genre id exists,
              if (genreMap[genreId]) {
                // replace the existing genre with the one from the genres map
                book.genres[k] = genreMap[genreId];
              }
            }
          }
        }
    
        res.json(books);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
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
