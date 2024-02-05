const express = require('express');
const cors = require('cors');
const { json } = require('express');
const { connectToMongoDB, getDB } = require('./db');
const { ObjectId } = require('mongodb');
const apiRouter = require('./routes/api');


const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());
app.use(json());

let db; // Declare db globally

async function main() {
  try {
     await connectToMongoDB();
     db = getDB();
    console.log('Connected to MongoDB');

    // Define the books collection
    const booksCollection = db.collection('books');

    app.get('/', (req, res) => {
      res.send('Hello, world!');
      // You can use the `db` object here to interact with MongoDB
    });

    app.get('/books/:id', async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        console.log('Book ID:', id);
    
        const book = await booksCollection.findOne({ _id: id });
        console.log('Found Book:', book);
    
        if (book) {
          res.json(book);
        } else {
          res.status(404).json({ message: 'Book not found' });
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Error fetching book', error: error.message });
      }
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
        console.log('Result:', result); // Add this line for logging
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

    app.put('/books/:id', async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const { title, genre, authors, year, rating } = req.body;
    
        // Validation
        if (!title || !genre || !Array.isArray(authors) || authors.length === 0 || !year || !rating) {
          return res.status(400).json({ message: 'Title, genre, authors, year, and rating are required fields, and authors should be a non-empty array.' });
        }
    
        // Additional validation can be added as necessary
    
        // Assuming genre is an object with _id and name properties
        const { _id: genreId, name: genreName } = genre || {};
    
        const updateData = {
          title,
          genre: { _id: genreId, name: genreName },
          authors,
          year,
          rating
        };
    
        const result = await booksCollection.updateOne(
          { _id: id },
          { $set: updateData }
        );
    
        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'No book found with this ID, or no new data provided' });
        }
    
        res.json({ message: 'Book updated successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error updating book', error: error.message });
      }
    });

    app.delete('/books/:id', async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        
        // Assuming `booksCollection` is your MongoDB collection for books
        const result = await booksCollection.deleteOne({ _id: id });
    
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'No book found with this ID' });
        }
    
        res.json({ message: 'Book deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
      }
    });

    app.use('/users', require('./users'));
    app.use('/api', apiRouter);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

main();
