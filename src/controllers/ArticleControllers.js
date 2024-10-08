const mongoose = require('mongoose');
const Article = require("../models/ArticleModel");
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');
const dotenv = require("dotenv");
dotenv.config();

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `file_${Date.now()}`
    };
  }
});

const upload = multer({ storage }).single('image');

// Create Article Endpoint
exports.createArticle = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload Error: ", err);
      return res.status(500).json({ error: err.message });
    }

    // Check if the file was uploaded successfully
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Check the file size
    // if (req.file.size > 1 * 1024 * 1024) { // 1MB limit
    //   return res.status(400).json({ error: 'File size is too large. Maximum limit is 1MB.' });
    // }

    const { title, paragraphs, writer, links, desa, category } = req.body;
    const image = req.file.id; // Store the file ID in the image field

    const newArticle = new Article({
      title,
      paragraphs: JSON.parse(paragraphs),
      image,
      writer,
      links,
      desa,
      category,
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

    const imageId = article.image;
    await Article.findByIdAndDelete(id);

    const db = mongoose.connection.db;
    const gfsBucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // Delete the associated image from GridFS
    gfsBucket.delete(new mongoose.Types.ObjectId(imageId), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting image", error: err.message });
      }
    });
    return res.status(200).json({ message: "Article and image deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Verify Article Endpoint
exports.toggleArticleVerification = async (req, res) => {
  const { id } = req.params;
  const article = await Article.findById(id);
  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }
  if (article.status === "Verified") {
    article.status = "Draft";
    await article.save();
    return res.json({ message: "Article verification cancelled", article });
  } else {
    article.status = "Verified";
    await article.save();
    return res.json({
      message: "Article verified successfully",
      article
    });
  }
};

// Get Article Endpoint
exports.getArticle = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the article by ID
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json(article);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Image Endpoint
exports.getImage = async (req, res) => {
  const { id } = req.params;

  try {
    const db = mongoose.connection.db;
    const gfsBucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });
    const readStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(id));
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'image/jpeg');

    readStream.on('error', (err) => {
      return res.status(500).json({ message: "Error retrieving image", error: err.message });
    });

    readStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get All Articles
exports.getAllArticle = async (req, res) => {
  const articles = await Article.find();
  res.status(200).json(articles);
}
