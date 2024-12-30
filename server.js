const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors()); // Enable CORS for all requests

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://jeremy:password1!@mob.ka2gc.mongodb.net/daily_drinks?retryWrites=true&w=majority&appName=Mob';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Schema Definition
const drinkSchema = new mongoose.Schema({
    date: { type: String, required: true },
    user: { type: String, required: true },
    drinks: {
        Beer: { type: Number, default: 0 },
        Wine: { type: Number, default: 0 },
        Cocktail: { type: Number, default: 0 },
        Other: { type: Number, default: 0 },
    },
});
const Drink = mongoose.model('Drink', drinkSchema, 'daily_drinks');


// Routes

// Add or Update Drink Data
app.post('/add-data', async (req, res) => {
    const { date, user, drinkType, quantity } = req.body;

    if (!date || !user || !drinkType || !quantity) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    try {
        let record = await Drink.findOne({ date, user });

        if (!record) {
            record = new Drink({ date, user });
        }

        // Increment drink count
        record.drinks[drinkType] = (record.drinks[drinkType] || 0) + quantity;

        await record.save();
        res.json({ message: 'Data added successfully', record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Welcome page
app.get('/', (req, res) => {
    res.send('Welcome to the Drink Tracker API!');
});

// Get All Drink Data
app.get('/get-data', async (req, res) => {
    try {
        const data = await Drink.find();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Data by Date
app.get('/get-data/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const data = await Drink.find({ date });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
