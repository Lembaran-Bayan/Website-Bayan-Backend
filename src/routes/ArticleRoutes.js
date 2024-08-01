const { createArticle, deleteArticle, toggleArticleVerification, getArticle, getImage, getAllArticle } = require("../controllers/ArticleControllers");

const articleRoutes = require("express").Router();

articleRoutes.post("/", createArticle);
articleRoutes.delete("/:id", deleteArticle);
articleRoutes.patch("/:id", toggleArticleVerification);
articleRoutes.get("/:id", getArticle);
articleRoutes.get("/image/:id", getImage);
articleRoutes.get("/", getAllArticle);

module.exports = articleRoutes;