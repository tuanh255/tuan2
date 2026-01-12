const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.config'); 
const { errorHandler } = require('./middleware/error.middleware');
const todoRoutes = require('./routes/todo.routes');

const app = express();
connectDB(); // Gọi hàm kết nối database

app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));