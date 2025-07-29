const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bookOrdersRoute = require('./routes/bookOrders');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

// Mount the route
app.use('/api/book-orders', bookOrdersRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
