import React, { Component } from 'react';
import { withTracker } from "meteor/react-meteor-data";

import Schedule from "./Schedule.js";
import { CommentsDB } from "../api/comments";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }
  render() {
    console.log(this.props.comments);
    return (
      <div>
        <Schedule currentUser={this.props.currentUser} history={this.props.comments} />
      </div>
    )
  }
};

export default withTracker(() => {
  Meteor.subscribe('allComments');
  return {
    comments: CommentsDB.find({ sort: { date: -1 } }).fetch(),
    currentUser: Meteor.user(),
  };
})(App);