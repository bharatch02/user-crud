const express = require('express');
const path = require('path');
const userModel = require('./models/user');
const bodyParser = require('body-parser'); // For additional parsing needs
const { body, validationResult } = require('express-validator'); // For input validation

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // Additional parsing if needed

// Route: Home
app.get('/', (req, res) => {
    res.render("index");
});

// Route: Read Users
app.get('/read', async (req, res) => {
    try {
        let users = await userModel.find();
        res.render("read", { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Edit User
app.get('/edit/:userid', async (req, res) => {
    try {
        let user = await userModel.findOne({ _id: req.params.userid });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render("edit", { user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Update User
app.post('/update/:id', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('image').optional().isURL().withMessage('Image URL must be valid')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('edit', { user: req.body, errors: errors.array() });
    }

    try {
        let { name, email, image } = req.body;
        let user = await userModel.findOneAndUpdate(
            { _id: req.params.id },
            { image, name, email },
            { new: true }
        );
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.redirect("/read");
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Delete User
app.get('/delete/:id', async (req, res) => {
    try {
        let user = await userModel.findOneAndDelete({ _id: req.params.id });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.redirect("/read");
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Create User
app.post('/create', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('image').optional().isURL().withMessage('Image URL must be valid')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('index', { errors: errors.array() });
    }

    try {
        let { name, email, image } = req.body;
        let createdUser = await userModel.create({ name, email, image });
        res.redirect("/read");
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
