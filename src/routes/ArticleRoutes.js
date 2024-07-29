const { createArticle, deleteArticle, verifyArticle } = require("../controllers/ArticleControllers");

const articleRoutes = require("express").Router();

articleRoutes.post("/", createArticle);
articleRoutes.delete("/:id", deleteArticle);
articleRoutes.patch("/:id", verifyArticle);

module.exports = articleRoutes;