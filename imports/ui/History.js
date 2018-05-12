import React, { Component } from 'react';

export default class History extends Component {
  constructor(props) {
    super(props);
    this.setState = {
    };
  }

  render() {
    const history = this.props.history;
    return (
      <div className="col-md-4 history">
        <div className="row" >
            <div className="col-md-12">
                <table className="table">
                  <thead>
                    <tr><th>User</th><th>Comment</th><th>Agency</th><th className="textCenter">Route</th><th className="textCenter">Service class</th><th className="textCenter">Date</th></tr>
                  </thead>
                  <tbody>
                    {history.map((hist) => <tr key={hist.comment}>
                        <td>{hist.owner}</td>
                        <td>{hist.comment}</td>
                        <td>{hist.agency}</td>
                        <td>{hist.route}</td>
                        <td>{hist.serviceClass}</td>
                        <td>{hist.date}</td>
                        </tr>)
                    }
                  </tbody>
                </table>
            </div>
        </div>
      </div>
    )
  }
};
