import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const CommentsDB = new Mongo.Collection("comments");

if (Meteor.isServer) {
    Meteor.publish('allComments', function commentsPublication() {
      return CommentsDB.find();
    });
}

Meteor.methods({
  'comments.insert'(comment, owner, agency, route, serviceClass, date) {
    check(comment, String);
    check(agency, String);
    check(route, String);
    check(serviceClass, String);
    check(date, Date);

    if (!this.userId) throw new Meteor.Error("You must Sign In/Register in order to comment");

    CommentsDB.insert({
      comment,
      owner,
      agency,
      route,
      serviceClass,
    });
  }
});