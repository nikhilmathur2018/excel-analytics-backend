// server.js
require('dotenv').config(); // <--- MOVE THIS LINE TO BE THE VERY FIRST LINE

const express = require('express');
// const dotenv = require('dotenv'); // <--- You can remove this line since you're calling config directly now
const connectDB = require('./config/db');
const cors = require('cors');
const analysisRoutes = require('./routes/analysisRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

// dotenv.config(); // <--- REMOVE THIS LINE (it's now at the top)
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY); // Keep this for debugging, you can remove it later

connectDB();

const app = express();
app.use(express.json()); //Enable body parsing
app.use(cors());
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);


//Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));