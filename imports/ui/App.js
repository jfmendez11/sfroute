import React, { Component } from 'react';

import Schedule from "./Schedule.js";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }
  render() {
    return (
      <div>
        <Schedule />
      </div>
    )
  }
};
