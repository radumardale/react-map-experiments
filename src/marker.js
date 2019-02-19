import React from "react";

import { Marker } from "react-simple-maps";

class AppMarker extends React.Component {
  render() {
    console.log(this.props);
    return (
      <Marker
        projection={this.props.projection}
        marker={{ coordinates: this.props.coordinates }}
        preserveMarkerAspect
        style={{
          default: { stroke: "green" },
          hover: { stroke: "#FF5722" },
          pressed: { stroke: "#FF5722" }
        }}
      >
        <g transform="translate(-12, -24)">
          <path
            fill="lime"
            strokeWidth="2"
            strokeLinecap="square"
            strokeMiterlimit="10"
            strokeLinejoin="miter"
            d="M20,9c0,4.9-8,13-8,13S4,13.9,4,9c0-5.1,4.1-8,8-8S20,3.9,20,9z"
          />
          <circle
            fill="transparent"
            strokeWidth="2"
            strokeLinecap="square"
            strokeMiterlimit="10"
            strokeLinejoin="miter"
            cx="12"
            cy="9"
            r="3"
          />
        </g>
        <text
          textAnchor="middle"
          y={9}
          x={0}
          style={{
            fontFamily: "Roboto, sans-serif",
            fontSize: 12,
            fontWeight: "bold",
            stroke: "none"
          }}
        >
          {this.props.name}
        </text>
      </Marker>
    );
  }
}

export default AppMarker;
