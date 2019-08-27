const routes = require( 'express' ).Router();
const User = require( '../models/User' );
const Comment = require( '../models/Comment' );
var ObjectId = require( 'mongoose' ).Types.ObjectId;


/**
 *  Get all comments
 */
routes.get( '/all', ( req, res ) => {
  if ( req.user ) {
    Comment.find(
      {
        
      },
      ( err, comments ) => {
        if ( err ) {
          res.status( 404 ).json( { message: "Error getting comments" } )
        } else {


          // Note: returned comments will be in form of array
          if ( comments && comments.length > 0 ) {
            res.status( 200 ).json(
              {
                message: "Successfully retrieved all the comments",
                data: comments
              } )
          } else {
            res.status( 200 ).json(
              {
                message: "No comments found for this user",
                data: []
              } )
          }
        }
      } );
  } else {
    res.status( 403 ).send( {
      message: "You must be logged in"
    } )
  }
} )


/**
 *  Save a new comment
 */
routes.post( '/save', ( req, res ) => {
  if ( req.user ) {
    if ( req.body.comment ) {

      const comment = new Comment( req.body.comment );
      comment.userId = req.user._id;
      comment.username = req.user.username;

      comment.save( err => {
        if ( err ) {
          console.log( err )
          if ( err.code == "11000" ) {
            res.status( 422 ).json( { message: "Comment id already exists!! " } )

          } else {
            res.status( 404 ).json( { message: "Error saving comment" } )
          }
        } else {
          res.status( 200 ).json( { message: "Comment Saved Successfully", data: { id: comment._id.toString() } } )

        }
      } )
    } else {
      res.status( 404 ).send( {
        message: "no comment data were sent"
      } )
    }
  } else {
    res.status( 403 ).send( {
      message: "You must be logged in"
    } )
  }
} )


/**
 *  Get a specific  comment
 */
routes.get( '/get/:commentId', ( req, res ) => {
  if ( req.user ) {
    Comment.findOne(
      {
        _id: new ObjectId( req.params.commentId ),
        userId: new ObjectId( req.user._id ),
      },
      ( err, comment ) => {
        if ( err ) {
          res.status( 404 ).json( { message: "Error getting comment" } )
        } else {

          // Note: returned comment will be in form of document
          if ( comment ) {
            res.status( 200 ).json(
              {
                message: "Successfully retrieved the comment",
                data: comment
              } )
          } else {
            res.status( 404 ).json(
              {
                message: "No comment found for this user",

              } )
          }
        }
      } );
  } else {
    res.status( 403 ).send( {
      message: "You must be logged in"
    } )
  }
} )

/**
 *  Update an existing comment
 * todo add role checker
 */
routes.put( '/update/:commentId', ( req, res ) => {
  if ( req.user ) {

    if ( req.body.commentText ) {
      Comment.updateOne( { _id: ObjectId( req.params.commentId ) }, req.body.commentText,
        ( err, result ) => {

          if ( err ) {
            res.status( 404 ).send( {
              message: "An error occured updating the comment please try again"
            } )
          } else if ( result.nModified == 0 ) {
            res.status( 404 ).send( {
              message: "No comment have been updated"
            } )
          } else {
            //
            res.status( 200 ).send(
              { message: "Comment Updated Successfully" }
            )
          }
        } )
    } else {
      res.status( 404 ).send( {
        message: "no Comment data were sent"
      } )
    }
  } else {
    res.status( 403 ).send( {
      message: "You must be logged in"
    } )
  }
} )

/**
 * Delete one comment
 * to do add role checker
 */
routes.delete( "/delete/:commentId", ( req, res ) => {
  if ( req.user ) {

    Comment.deleteOne( { _id: ObjectId( req.params.commentId ) },
      ( err, result ) => {

        if ( err ) {
          res.status( 404 ).send( {
            message: "An error occured deleting the comment please try again"
          } )
        } else if ( result.deletedCount == 0 ) {
          res.status( 404 ).send( {
            message: "No comment have been deleted"
          } )
        } else {
          // Successfully Deleted
          res.status( 200 ).send(
            { message: "Comment Deleted Successfully" }
          )
        }

      } )

  } else {
    res.status( 403 ).send( {
      message: "You must be logged in"
    } )
  }
} )

module.exports = routes;
