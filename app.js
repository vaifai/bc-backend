const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { createUserCredentialsTable } = require('./models/userCredentials');
const app = express();
const port = process.env.PORT || 8080;
dotenv.config();

const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.access_key,
  secretAccessKey: process.env.secret_key
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//create table
createUserCredentialsTable();

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const params = {
    TableName: 'UserCredentials',
    Item: {
      email,
      password // Note: In a real application, you should hash the password before storing
    },
    ConditionExpression: 'attribute_not_exists(email)'
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      res.status(409).json({ error: 'User already exists' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Could not create user' });
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Request received', email, password);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const params = {
    TableName: 'UserCredentials',
    Key: { email }
  };

  try {
    const { Item } = await dynamodb.get(params).promise();
    if (Item && Item.password === password) { // Note: In a real app, you'd compare hashed passwords
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Could not process login', errorDetails: error });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});