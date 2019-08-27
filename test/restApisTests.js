var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const User = require("../models/User");

let should = chai.should();
chai.use(chaiHttp);

/**
 * User Tests
 */
describe("Users", () => {
  describe("User registeration and loggin in", () => {
    it("should be able to sign up as a writer", done => {
      chai
        .request(server)
        .post("/signup")
        .send({
          email: "ahmedashrafsafwat@gmail.com",
          password: "12345678",
          confirmPassword: "12345678",
          username: "Ahmed Ashraf",
          role: "writer"
        })
        .end((err, res) => {
          if (err) console.log(err);

          res.should.have.status(200);

          // Check role
          User.findOne({ email: "ahmedashrafsafwat@gmail.com" }, (err, doc) => {
            if (err) console.log(err);

            // check the role
            chai.expect(doc.role).to.equal("writer");
          });
          done();
        });
    });

    it("should be able to sign up as a reader", done => {
      chai
        .request(server)
        .post("/signup")
        .send({
          email: "ahmedashrafsafwat2@gmail.com",
          password: "12345678",
          confirmPassword: "12345678",
          username: "Ahmed Ashraf the reader",
          role: "reader"
        })
        .end((err, res) => {
          if (err) console.log(err);

          res.should.have.status(200);

          // Check role
          User.findOne(
            { email: "ahmedashrafsafwat2@gmail.com" },
            (err, doc) => {
              if (err) console.log(err);

              // check the role
              chai.expect(doc.role).to.equal("reader");
            }
          );
          done();
        });
    });

    it("Sends back error if email was registered before", done => {
      chai
        .request(server)
        .post("/signup")
        .send({
          email: "ahmedashrafsafwat@gmail.com",
          password: "12345678",
          confirmPassword: "12345678",
          username: "Blablabla",
          role: "reader"
        })
        .end((err, res) => {
          if (err) console.log(err);

          res.should.have.status(500);

          done();
        });
    });

    it("Should Sign in", done => {
      chai
        .request(server)
        .post("/login")
        .send({
          email: "ahmedashrafsafwat@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          res.should.have.status(200);

          done();
        });
    });
  });
});

/**
 * Article Tests
 */
describe("Articles", function() {
  describe("Get ALL", function() {
    it("Should be able to write articles if user is writer", done => {
      // Login first to get access token
      chai
        .request(server)
        .post("/login")
        .send({
          email: "ahmedashrafsafwat2@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;

          // write an article
          chai
            .request(server)
            .post("/article/save")
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .send({
              article: {
                articleText: "this is my article and it is just for testing"
              }
            })
            .end((err, res) => {
              //console.log (res)
              // console.log("err",err);
              res.should.have.status(401);

              // console.log (result);
              done();
            });
        });
    });

    // Reader shouldnt be able to write articles
    it("Should be not able to write articles if user is reader", done => {
      // Login first to get access token
      chai
        .request(server)
        .post("/login")
        .send({
          email: "ahmedashrafsafwat@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;

          // write an article
          chai
            .request(server)
            .post("/article/save")
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .send({
              article: {
                articleText: "this is my article and it is just for testing"
              }
            })
            .end((err, res) => {
              //console.log (res)
              // console.log("err",err);
              res.should.have.status(200);

              // console.log (result);
              done();
            });
        });
    });

    it("should get all articles", done => {
      // Login first to get access token
      chai
        .request(server)
        .post("/login")
        .send({
          email: "ahmedashrafsafwat@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;

          chai
            .request(server)
            .get("/article/all")
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .end((err, res) => {
              //console.log (res)
              // console.log("err",err);
              res.should.have.status(200);

              // console.log (result);
              done();
            });
        });
    });

    it("should get all user's articles", done => {
      // Login first to get access token
      chai
        .request(server)
        .post("/login")
        .send({
          email: "ahmedashrafsafwat@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;

          chai
            .request(server)
            .get("/article/user")
            .send({})
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .end((err, res) => {
              //console.log (res)
              // console.log("err",err);
              res.should.have.status(200);

              // console.log (result);
              done();
            });
        });
    });
  });
  /// some other tests we will write here
});
/**
 * Comment tests
 */
describe("Comment", function() {
  // Reader shouldnt be able to write articles
  it("Should be  able to write comments if user is writer", done => {
    // Login first to get access token
    chai
      .request(server)
      .post("/login")
      .send({
        email: "ahmedashrafsafwat@gmail.com",
        password: "12345678"
      })
      .end((err, res) => {
        if (err) console.log(err);

        const token = res.body.user.token;

        // write an article
        chai
          .request(server)
          .post("/comment/save")
          .set("x-access-token", token)
          .set("Content-Type", "application/json")
          .send({
            comment: {
              commentText: "this is my comment and it is just for testing"
            }
          })
          .end((err, res) => {
            //console.log (res)
            // console.log("err",err);
            res.should.have.status(200);

            // console.log (result);
            done();
          });
      });
  });

  // Reader shouldnt be able to write articles
  it("Should be  able to write comments if user is reader", done => {
    // Login first to get access token
    chai
      .request(server)
      .post("/login")
      .send({
        email: "ahmedashrafsafwat2@gmail.com",
        password: "12345678"
      })
      .end((err, res) => {
        if (err) console.log(err);

        const token = res.body.user.token;

        // write an article
        chai
          .request(server)
          .post("/comment/save")
          .set("x-access-token", token)
          .set("Content-Type", "application/json")
          .send({
            comment: {
              commentText: "this is my comment and it is just for testing"
            }
          })
          .end((err, res) => {
            //console.log (res)
            // console.log("err",err);
            res.should.have.status(200);

            // console.log (result);
            done();
          });
      });
  });
});

// delete test users for restart tests
after(done => {
  // delete writer
  User.deleteOne(
    {
      email: "ahmedashrafsafwat@gmail.com"
    },
    err => {
      if (err) console.log(err);

      // delete reader
      User.deleteOne(
        {
          email: "ahmedashrafsafwat2@gmail.com"
        },
        err => {
          if (err) console.log(err);

          // finish the test when deleting finishes
          done();
        }
      );
    }
  );
});
