const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const MongodbUrl = "mongodb+srv://kumarsonu60067:Cpd0Onym7805H28T@cluster0.piahasa.mongodb.net/pizzapoint-data-base";
mongoose.connect(MongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Define the schema and model
const fileSchema = new mongoose.Schema({
  filename: String,
  filetype: String,
  document: String, // Stores the path of the document
});

const formSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  dob: Date,
  resStreet1: String,
  resStreet2: String,
  permStreet1: String,
  permStreet2: String,
  sameAsResidential: Boolean,
  files: [fileSchema],
});

const Form = mongoose.model('Form', formSchema);

// Configure Multer to use disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/formsubmit', upload.any(), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files.map(file => ({
      filename: file.originalname,
      filetype: file.mimetype,
      document: file.path,
    }));

    const newForm = new Form({
      ...formData,
      dob: new Date(formData.dob),
      files,
    });

    await newForm.save();

    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to submit form.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
