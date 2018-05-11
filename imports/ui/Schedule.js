import React, { Component } from 'react';
import * as d3 from "d3";

export default class Schedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      busSchedule: {
      }
    }
  }

  componentDidMount() {
    d3.json("https://gist.githubusercontent.com/john-guerra/6a1716d792a20b029392501a5448479b/raw/e0cf741c90a756adeec848f245ec539e0d0cd629/sfNSchedule")
      .then((json) => {
        this.setState({busSchedule: json});
      });    
  }

  drawSchedule() {
    console.log(this.state);
    let selectedRoute = this.state.busSchedule.route[0];
    let buses = [];
    for (let bus of selectedRoute.tr) { 
      let route = bus.stop.filter((d) => d.content!=="--");
      route.forEach((d) => d.date = new Date(+d.epochTime));    
      buses.push(route);
    }

    const height = 600;
    const svg = d3.select(DOM.svg(width, height));
    const margin = ({top: 20, right: 30, bottom: 30, left: 150});
    const minDate = d3.min(buses[1], d => d.date);
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
    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
      .tickFormat((d) => selectedRoute.header.stop[d].content));  

    const line = d3.line()
      .x(d => x(d.date))
      .y((d,i) => y(i) + y.bandwidth()/2);

    svg.append("g")
      .call(xAxis);

    svg.append("g")
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
        .attr("d", line);
    return svg.node();  
  }

  render() {
    console.log(this.state);
    return (
      <div>
        {console.log("Render")}
      </div>
    )
  }
};
