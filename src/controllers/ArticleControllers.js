// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Article = require("../models/ArticleModel");

// Initialize Express app
const app = express();

// MongoDB URI
const mongoURI = process.env.MONGO_URI;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize GridFS
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `file_${Date.now()}`
    };
  }
});

const upload = multer({ storage }).single('image'); // Specify 'image' as the field name

// Create Article Endpoint
exports.createArticle = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const { title, paragraphs, writer, links, desa, status } = req.body;
    const image = req.file.id; // Store the file ID in the image field

    const newArticle = new Article({
      title,
      paragraphs,
      image,
      writer,
      links,
      desa,
      status: "Draft"
    });

    try {
      const savedArticle = await newArticle.save();
      return res.status(201).json(savedArticle);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

// Delete Article Endpoint
exports.deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    await Article.findByIdAndDelete(id);
    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


