import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import * as d3 from "d3";

import Options from "./Options";
import AccountsUIWrapper from './AccountsUIWrapper.js';
import { CommentsDB } from "../api/comments";

export default class Schedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      busSchedule: {
      },
      routeList: [],
      route: 0,
      agency: "AC Transit",
      agencyTag: "actransit",
      routeTag: "B",
    }
  }

  componentDidMount() {
    console.log("Did mount");
    d3.json("http://webservices.nextbus.com/service/publicJSONFeed?command=schedule&a=" + this.state.agencyTag + "&r=" + this.state.routeTag)
      .then((json) => {
        this.setState({busSchedule: json});
      })
      .then(() => {
        this.drawSchedule(this.state.route);  
      });

      d3.json("http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=" + this.state.agencyTag)
      .then((json) => {
        this.setState({routeList: json.route});
      });
  }

  drawSchedule(route) {
    console.log("Draw");
    let selectedRoute = this.state.busSchedule.route[route];
    let buses = [];
    let busIterator;
    for (let i = 0; i < selectedRoute.tr.length; i++) { 
      let route = selectedRoute.tr[i].stop[0] ? selectedRoute.tr[i].stop.filter((d) => d.content!=="--") : selectedRoute.tr[i].stop;
      let auxArray = [];
      if (route[0]) {
        route.forEach((d) => d.date = new Date(+d.epochTime));
        buses.push(route);
      }  
      else {
        route.date = new Date(+route.epochTime)
        auxArray.push(route);
        buses.push(auxArray);
      }
    }
    const svg = d3.select(this.svg);
    const margin = ({top: 20, right: 30, bottom: 30, left: 150});
    const height = svg.attr("height") - margin.top - margin.bottom;
    const width = svg.attr("width") ;//- margin.left - margin.right;
    const minDate =  d3.min(buses[1], d => d.date);
    const maxDate = new Date(minDate.getTime() + 22*60*60*1000); // minDate + 24 hours
    const x = d3.scaleTime()
      .domain([ minDate, maxDate ])
      .range([margin.left, width - margin.right]);
    const y = d3.scaleBand()
      .domain(d3.range(buses[1].length))
      .rangeRound([height - margin.bottom, margin.top]);
    
    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
    // .call(g => g.select(".domain").remove());
    let stop;
    if (selectedRoute.header.stop[0]) stop = selectedRoute.header.stop;
    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
      .tickFormat((d) => selectedRoute.header.stop[0] ? selectedRoute.header.stop[d].content : selectedRoute.header.stop.content));  

    const line = d3.line()
      .x(d => x(d.date))
      .y((d,i) => y(i) + y.bandwidth()/2);

    svg.selectAll(".axis").remove();

    svg.append("g")
      .attr("class", "axis")
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis")
      .call(yAxis);
  
    svg.selectAll(".routes")
      .data(buses)
      .enter()
      .append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .attr("class", "routes");
    
    svg.selectAll(".routes")
      .data(buses)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .attr("class", "routes");
        
    svg.selectAll(".routes")
      .data(buses)
      .exit()
      .remove();

    return svg.node();  
  }

  clearRoutes() {
    let svg = d3.select(this.svg);
    svg.selectAll(".routes")
      .remove();

    return svg.node(); 
  }

  _onSelectA(option) {
    console.log(option);
    d3.json("http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=" + option.value)
      .then((json) => {
        let tagAccess;
        if (json.route[0]) tagAccess = json.route[0];
        else tagAccess = json;
        this.setState({routeList: json.route, agencyTag: option.value, agency: option.label, route: 0, routeTag: tagAccess.tag});
      })
      .then(() => {
        d3.json("http://webservices.nextbus.com/service/publicJSONFeed?command=schedule&a=" + this.state.agencyTag + "&r=" + this.state.routeTag)
          .then((json) => {
            if (!json.route) this.setState({busSchedule: {}});
            else this.setState({busSchedule: json});
          })
          .then(() => {
            if (this.state.busSchedule.route) this.drawSchedule(this.state.route);
            else this.clearRoutes();
          });
      });
  }

  _onSelectR(option) {
    console.log(option);
    d3.json("http://webservices.nextbus.com/service/publicJSONFeed?command=schedule&a=" + this.state.agencyTag + "&r=" + option.value)
    .then((json) => {
      this.setState({busSchedule: json, route: 0, routeTag: option.value});
    })
    .then(() => {
      this.drawSchedule(this.state.route);  
    });
  }

  _onSelectD(option) {
    console.log(option);
    this.setState({route: option.value});
    this.drawSchedule(option.value);
  }

  renderInfo(route) {
    return (
      <div className="information container">
        <h1>{this.state.agency} Schedule</h1>
        <h2>Route: {this.state.busSchedule.route[route].title}</h2>
        <h3>Service Class: {this.state.busSchedule.route[route].serviceClass}</h3>
        <h4>Direction: {this.state.busSchedule.route[route].direction}</h4>
      </div>
    );
  }

  handleSubmit(e) {
    console.log(e);
    e.preventDefault();

    // Find the text field via the React ref
    const comment = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Meteor.call('comments.insert', comment, this.props.currentUser, this.state.agency, this.state.busSchedule.route[this.state.route].title, this.state.busSchedule.route[this.state.route].serviceClass, new Date());

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  render() {
    console.log("Render");
    let info = this.state.busSchedule.route && this.state.busSchedule.route.length > 0 ? this.renderInfo(this.state.route) : <div></div>;
    let routes = this.state.busSchedule.route && this.state.busSchedule.route.length > 0 ? this.state.busSchedule.route : [];
    return (
      <div className="schedule container-fluid">
        <div className="row">
          <div className="col-md-8">
            {info}
          </div>
          <div className="col-md-4">
            <AccountsUIWrapper />
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <svg viewBox="0,0,964,600" width="964" height="600" ref={(svg) => this.svg = svg}></svg>
          </div>
          <Options routes={routes} routeList={this.state.routeList}  _onSelectA={this._onSelectA.bind(this)} _onSelectR={this._onSelectR.bind(this)} _onSelectD={this._onSelectD.bind(this)} history={this.props.history} /> 
        </div>
        <div className="row">
          <div className="comments">
            <div className="col-md-12">
              <h3>Comment: </h3>
            </div>
            <div className="col-md-12">
            { this.props.currentUser ?
              <form className="new-comment" onSubmit={this.handleSubmit.bind(this)} >
                <input
                  className="new-comment-input"
                  type="text"
                  ref="textInput"
                  placeholder="Type to add new comments on this route"
                />
              </form> : <h6>Log In/Register to comment</h6>
            }
            </div>
          </div>
        </div>
      </div>
    );
  }
};
