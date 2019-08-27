const routes = require("express").Router();
const User = require("../models/User");
const Article = require("../models/Article");
var ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
var multer = require("multer");

var upload = multer({ dest: "uploads/" }); //setting the default

/**
 *  Get all articles
 */
routes.get("/all", (req, res) => {
  if (req.user) {
    Article.find({ isPublished: true })
      .lean()
      .exec((err, articles) => {
        if (err) {
          res.status(404).json({ message: "Error getting articles" });
        } else {
          // Note: returned articles will be in form of array
          if (articles && articles.length > 0) {
            // get image buffer from uploads folder (if an article has one)
            for (var i = 0; i < articles.length; i++) {
              if (articles[i].image != undefined) {
                try {
                  articles[i].data = fs.readFileSync("." + articles[i].image);
                } catch (err) {
                  console.log("Couldn't read the file error:" + err);
                }
              }
            }

            res.contentType("json");
            res.status(200).json({
              message: "Successfully retrieved all the articles",
              data: articles
            });
          } else {
            res.status(200).json({
              message: "No articles found",
              data: []
            });
          }
        }
      });
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 *  Save a new article
 */
routes.post("/save", upload.single("image"), (req, res) => {
  if (req.user) {
    if (req.user.role == "writer") {
      let articleReq;
      if (typeof req.body.article === "string")
        articleReq = JSON.parse(req.body.article);
      else articleReq = req.body.article;

      if (articleReq) {
        // Check for char limit
        if (articleReq.articleText.length >= 2000) {
          return res
            .status(406)
            .json({ message: "Article must be less than 2000 char" });
        }

        const article = new Article(articleReq);
        article.userId = req.user._id;
        article.username = req.user.username;

        // save image uri if sent
        if (req.file) article.image = "/uploads/" + req.file.filename;

        article.save(err => {
          if (err) {
            console.log(err);
            if (err.code == "11000") {
              res.status(422).json({ message: "Article id already exists!! " });
            } else {
              res.status(404).json({ message: "Error saving article" });
            }
          } else {
            res.status(200).json({
              message: "Article Saved Successfully",
              data: { id: article._id.toString() }
            });
          }
        });
      } else {
        res.status(404).send({
          message: "no article data were sent"
        });
      }
    } else {
      res.status(401).send({
        message: "Unauthorized access to this api"
      });
    }
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 *  Get a specific user's articles
 */
routes.get("/user", (req, res) => {
  if (req.user) {
    Article.find({
      userId: new ObjectId(req.user._id)
    })
      .lean()
      .exec((err, articles) => {
        if (err) {
          res
            .status(404)
            .json({ message: "Error getting the user's articles" });
        } else {
          // Note: returned article will be in form of document
          if (articles && articles.length > 0) {
            // get image buffer from uploads folder (if an article has one)
            for (var i = 0; i < articles.length; i++) {
              if (articles[i].image != undefined) {
                try {
                  articles[i].data = fs.readFileSync("." + articles[i].image);
                } catch (err) {
                  console.log("Couldn't read the file error:" + err);
                }
              }
            }

            res.contentType("json");
            res.status(200).json({
              message: "Successfully retrieved the user's articles",
              data: articles
            });
          } else {
            res.status(404).json({
              message: "No article found for this user"
            });
          }
        }
      });
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 *  Update an existing article (article's text, image or isPublished)
 * todo add role checker
 */
routes.put("/update/:articleId", upload.single("image"), (req, res) => {
  let articleReq;
  if (typeof req.body.updatedArticle === "string")
    articleReq = JSON.parse(req.body.updatedArticle);
  else articleReq = req.body.updatedArticle;

  if (req.user) {
    if (req.user.role == "writer") {
      if (articleReq) {
        // if image file was sent
        if (req.file) articleReq.image = "/uploads/" + req.file.filename;

        Article.updateOne(
          { _id: ObjectId(req.params.articleId) },
          articleReq,
          (err, result) => {
            if (err) {
              res.status(404).send({
                message:
                  "An error occured updating the article please try again"
              });
            } else if (result.nModified == 0) {
              res.status(404).send({
                message: "No article have been updated"
              });
            } else {
              //
              res.status(200).send({ message: "Article Updated Successfully" });
            }
          }
        );
      } else {
        res.status(404).send({
          message: "no Article data were sent"
        });
      }
    } else {
      res.status(401).send({
        message: "Unauthorized access to this api"
      });
    }
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 * Delete one article
 * to do add role checker
 */
routes.delete("/delete/:articleId", (req, res) => {
  if (req.user) {
    Article.deleteOne(
      { _id: ObjectId(req.params.articleId) },
      (err, result) => {
        if (err) {
          res.status(404).send({
            message: "An error occured deleting the article please try again"
          });
        } else if (result.deletedCount == 0) {
          res.status(404).send({
            message: "No article have been deleted"
          });
        } else {
          // Successfully Deleted
          res.status(200).send({ message: "Article Deleted Successfully" });
        }
      }
    );
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

module.exports = routes;
