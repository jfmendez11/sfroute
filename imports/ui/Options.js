import React, { Component } from 'react';
import Dropdown from "react-dropdown";
import * as d3 from "d3";

import History from "./History";

import 'react-dropdown/style.css';

export default class Options extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agencyList: [],
      placeholderA: "AC Transit",
      placeholderR: "B",
      placeholderD: "wkd - East",
    };
  }
  
  componentDidMount() {
    console.log("Did mount");
    d3.json("http://webservices.nextbus.com/service/publicJSONFeed?command=agencyList")
      .then((json) => {
        this.setState({agencyList: json.agency});
      });
  }

  _onSelectA(option) {
    this.setState({placeholderA: option.label});
    return this.props._onSelectA(option);
  }

  _onSelectR(option) {
    this.setState({placeholderR: option.label});
    return this.props._onSelectR(option);
  }

  _onSelectD(option) {
    this.setState({placeholderD: option.label});
    return this.props._onSelectD(option);
  }

  render() {
    let optionsA = [];
    for (let i = 0; i < this.state.agencyList.length; i++) optionsA.push({value: this.state.agencyList[i].tag, label: this.state.agencyList[i].title});
    let defaultOptionA = optionsA[0];

    let optionsR = [];
    for (let i = 0; i < this.props.routeList.length; i++) optionsR.push({value: this.props.routeList[i].tag, label: this.props.routeList[i].title});
    let defaultOptionR = optionsR[0];

    let optionsD = [];
    for (let i = 0; i < this.props.routes.length; i++) optionsD.push({value: i, label: this.props.routes[i].serviceClass + " - " + this.props.routes[i].direction});
    let defaultOptionD = optionsD[0];

    return (
      <div className="options col-md-4">
        <div className="row">
          <div className="col-md-12">
            <p>Choose an Agency</p>
            <Dropdown options={optionsA} onChange={this._onSelectA.bind(this)} value={this.state.placeholderA} placeholder="Select an agency..." />
          </div>
          <div className="col-md-12">
            <p>Choose a Route</p>
            <Dropdown options={optionsR} onChange={this._onSelectR.bind(this)} value={this.state.placeholderR} placeholder="Select a route..." />
          </div>
          <div className="col-md-12">
            <p>Select Service Class</p>
            <Dropdown options={optionsD} onChange={this._onSelectD.bind(this)} value={this.state.placeholderD} placeholder="Select day an direction of interest..." />
          </div>
          <div className="col-md-12">
            <p>History</p>
            {<History history={this.props.history} />}
          </div>
        </div>
      </div>
    )
  }
};
