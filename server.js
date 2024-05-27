require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const csvSchema = new mongoose.Schema({
  CreditScore: Number,
  CreditLines: Number,
});

const CsvData = mongoose.model('CsvData', csvSchema);

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await CsvData.insertMany(results);
          res.send('File uploaded and data processed.');
        } catch (error) {
          res.status(500).send('Error processing data');
        }
      });
  });
  

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/data', async (req, res) => {
    try {
      const data = await CsvData.find().limit(100); // Implement pagination
      res.json(data);
    } catch (error) {
      res.status(500).send('Error fetching data');
    }
  });

  app.post('/calculate', async (req, res) => {
    const { basePrice, pricePerCreditLine, pricePerCreditScorePoint } = req.body;
    try {
      const data = await CsvData.find();
      const result = data.map(item => ({
        subscriptionPrice: basePrice + (pricePerCreditLine * item.CreditLines) + (pricePerCreditScorePoint * item.CreditScore)
      }));
      res.json(result);
    } catch (error) {
      res.status(500).send('Error calculating subscription prices');
    }
  });

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});