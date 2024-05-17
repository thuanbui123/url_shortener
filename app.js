const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const app = express();
const port = 3000;

// Kết nối đến cơ sở dữ liệu SQLite
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE urls (id INTEGER PRIMARY KEY, original_url TEXT, short_id TEXT)');
});

// Middleware để phân tích các yêu cầu POST
app.use(express.urlencoded({ extended: true }));

// Trang chủ
app.get('/', (req, res) => {
  res.send(`
    <h1>URL Shortener</h1>
    <form method="POST" action="/shorten">
      <label for="original_url">Enter URL to shorten:</label>
      <input type="url" id="original_url" name="original_url" required>
      <button type="submit">Shorten</button>
    </form>
  `);
});

// Xử lý việc rút gọn URL
app.post('/shorten', (req, res) => {
  const originalUrl = req.body.original_url;
  const shortId = crypto.randomBytes(3).toString('hex');

  db.run('INSERT INTO urls (original_url, short_id) VALUES (?, ?)', [originalUrl, shortId], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.send(`Short URL is: <a href="/${shortId}">/${shortId}</a>`);
  });
});

// Chuyển hướng URL rút gọn đến URL gốc
app.get('/:shortId', (req, res) => {
  const shortId = req.params.shortId;

  db.get('SELECT original_url FROM urls WHERE short_id = ?', [shortId], (err, row) => {
    if (err) {
      return console.log(err.message);
    }
    if (row) {
      res.redirect(row.original_url);
    } else {
      res.send('URL not found');
    }
  });
});

app.listen(port, () => {
  console.log(`URL Shortener app listening at http://localhost:${port}`);
});
