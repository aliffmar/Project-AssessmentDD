const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hbs = require('hbs');

const app = express();
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const dbName = 'Cluster0';
const dbUrl = 'mongodb+srv://aliffmar:aliffmar@cluster0.wiupkvf.mongodb.net/?retryWrites=true&w=majority';

let db;
MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }
  db = client.db(dbName);
  console.log('Connected to MongoDB');
});

const authenticate = (req, res, next) => {
  const token = req.header('Authorization');

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid Token' });
  }
};

app.set('views', __dirname + '/views');

app.get('/', authenticate, (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection('users').insertOne({ username, password: hashedPassword });
  res.status(201).json({ msg: 'User registered successfully', userId: result.insertedId });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username });

  if (!user) {
    return res.status(401).json({ msg: 'Invalid Credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ msg: 'Invalid Credentials' });
  }

  const token = jwt.sign({ user: { id: user._id, username: user.username } }, 'your_secret_key', {
    expiresIn: '1h',
  });

  res.json({ token });
});

app.get('/entities', authenticate, async (req, res) => {
  const entities = await db.collection('entities').find().toArray();
  res.json(entities);
});

app.post('/entities', authenticate, async (req, res) => {
  const { attribute1, attribute2, attribute3 } = req.body;
  const result = await db.collection('entities').insertOne({
    attribute1,
    attribute2,
    attribute3,
  });
  res.status(201).json({ msg: 'Entity created successfully', entityId: result.insertedId });
});

app.put('/entities/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { attribute1, attribute2, attribute3 } = req.body;
  await db.collection('entities').updateOne(
    { _id: ObjectId(id) },
    { $set: { attribute1, attribute2, attribute3 } }
  );
  res.json({ msg: 'Entity updated successfully', entityId: id });
});

app.delete('/entities/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  await db.collection('entities').deleteOne({ _id: ObjectId(id) });
  res.json({ msg: 'Entity deleted successfully', entityId: id });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
