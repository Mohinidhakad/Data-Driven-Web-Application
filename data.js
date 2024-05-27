const fs = require('fs');
const csv = require('csv-parser');

app.post('/upload', upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      await CsvData.insertMany(results);
      res.send('File uploaded and data processed.');
    });
});
