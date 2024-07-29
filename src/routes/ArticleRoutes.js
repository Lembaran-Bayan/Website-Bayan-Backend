const { createArticle } = require("../controllers/ArticleControllers");

const articleRoutes = require("express").Router();

articleRoutes.post("/", createArticle);

module.exports = articleRoutes;