const dotenv = require('dotenv');
dotenv.config();

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const connectDB = require('./config/db');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
