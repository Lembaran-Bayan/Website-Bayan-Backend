const { createArticle, deleteArticle } = require("../controllers/ArticleControllers");

const articleRoutes = require("express").Router();

articleRoutes.post("/", createArticle);
articleRoutes.delete("/:id", deleteArticle);

module.exports = articleRoutes;