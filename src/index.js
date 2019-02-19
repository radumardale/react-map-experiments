import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { pluck, map, xprod, compose, min, pick, reduce, max } from "ramda";
import data from "./map.json";
import centers from "./countries-centres.json";
import { darken } from "polished";
import styled, { css } from "styled-components";
import AppMarker from "./marker";

import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Markers,
  Lines,
  Line,
  Marker,
  Annotations,
  Annotation,
  Geography
} from "react-simple-maps";

import density from "./population-density.json";

const MapWrapper = styled.div`
  position: relative;
`;
const SettingsPanel = styled.div`
  max-width: 160px;
  font-size: 12px;
  position: absolute;
  left: 8px;
  top: 8px;
  background: white;

  fieldset {
    display: flex;
    flex-direction: row;

    > div {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      label {
        cursor: pointer;
        text-align: left;
        margin-left: 8px;
      }
    }
  }
`;

const GeographyStyled = styled(Geography)``;
const GeographiesStyled = styled(Geographies)``;

const pinPathCubicBezier = (width, height) => {
  const deltaX = width * Math.sqrt(3);
  const deltaY = (height * 4) / 3;
  return `M 0,0 C ${-deltaX},${-deltaY} 
        ${deltaX},${-deltaY} 0,0 z`;
};

const [minDensity, maxDensity] = compose(
  reduce(
    ([minA, maxA], num) => {
      return [min(num, minA), max(num, maxA)];
    },
    [Infinity, -Infinity]
  ),
  map(v => (v ? parseFloat(v) : 0)),
  pluck("density")
)(density);

const normalize = val => {
  return (val - minDensity) / (maxDensity - minDensity);
};

const cities = [
  {
    location: "Brasov",
    lat: 45.64861,
    lng: 25.60613
  },

  {
    location: "Cluj",
    lat: 46.76667,
    lng: 23.6
  },

  {
    location: "Belfast",
    lat: 54.59682,
    lng: -5.92541
  },

  {
    location: "London",
    lat: 51.504331316,
    lng: -0.123166174
  },

  {
    location: "Auckland",
    lat: -36.86667,
    lng: 174.76667
  }
];

const betweenCities = xprod(cities, cities)
  .filter(c => {
    return c[0].location !== c[1].location;
  })
  .map(c => {
    const newLine = {
      curveStyle: "forceDown",
      coordinates: {
        start: [c[0].lng, c[0].lat],
        end: [c[1].lng, c[1].lat]
      }
    };

    return newLine;
  });

class App extends React.Component {
  containerRef = React.createRef();
  state = {
    zoom: 1,
    hoveredCountry: null,
    areCitiesVisible: false,
    areCityConnectionsVisible: false,
    isDensityVisible: true,
    areBordersVisible: true,
    areCentersVisbile: false,
    width: -1,
    height: -1,

    clickedCountry: null,
    mouseX: 0,
    mouseY: 0
  };
  componentDidMount() {
    window.addEventListener("wheel", this.onScroll, true);
    // console.log(document.body.clientWidth);
    // console.log(document.body.clientHeight);
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight - 10
    });
  }
  componentWillUnmount() {
    window.removeEventListener("wheel", this.onScroll, true);
  }

  buildCurves(start, end, line) {
    const x0 = start[0];
    const x1 = end[0];
    const y0 = start[1];
    const y1 = end[1];
    const curve = {
      forceUp: `${x1} ${y0}`,
      forceDown: `${x0} ${y1}`
    }[line.curveStyle];

    const path = `M ${start.join(" ")} Q ${curve} ${end.join(" ")}`;

    return path;
  }

  onScroll = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) {
      this.handleZoomOut();
    }
    if (e.deltaY > 0) {
      this.handleZoomIn();
    }
  };
  handleZoomIn = () => {
    this.setState({
      zoom: min(this.state.zoom * 1.05, 14)
    });
  };
  handleZoomOut = () => {
    this.setState({
      zoom: max(this.state.zoom / 1.05, 0.9)
    });
  };
  getCountriDensity = countryName => {
    const countryDensity = density.filter(c => {
      return c.country === countryName;
    })[0];
    const densityNum = countryDensity ? countryDensity.density : 0;
    return densityNum ? densityNum : 0;
  };

  // buildCountries = () => {
  //   data.objects.units.geometries = data.objects.units.geometries.map(c => {
  //     const countryDensity = this.getCountriDensity(c.properties.name);
  //     const fillColour = this.state.isDensityVisible
  //       ? // ? darken(normalize(countryDensity), "#C5CAE9")
  //         "lime"
  //       : "#C5CAE9";
  //     return { ...c, fillColour, countryDensity };
  //   });
  //   return data;
  // };

  onMouseEnteredCountry = e => {
    // console.log(";entered country", e);
    this.setState({
      hoveredCountry: e
    });
  };
  onMouseLeftCountry = e => {
    // console.log("left country", e);
    this.setState({
      hoveredCountry: null
    });

    // console.log(";entered country", geographyId);
  };

  onMouseMoved = (countru, evt) => {
    // console.log("m,oves mouse . ", e);
    // console.log("moved!!!");
    // console.log(evt.clientX);
    // console.log(evt.clientY);
  };

  onMouseClicked = e => {
    // console.log("e = ", e);
  };

  getMarker = (coordinates, name) => {
    return (
      <Marker
        key={name}
        marker={{ coordinates }}
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
          {name}
        </text>
      </Marker>
    );
  };

  getC = (geographies, projection) => {
    return geographies.map(geography => {
      const countryDensity = this.getCountriDensity(geography.properties.name);

      // onMouseEnter={this.onMouseEnteredCountry}
      // onMouseLeave={this.onMouseLeftCountry}
      const fillColour = this.state.isDensityVisible
        ? darken(normalize(countryDensity), "#C5CAE9")
        : "#C5CAE9";
      return (
        <GeographyStyled
          onMouseMove={this.onMouseMoved}
          onMouseLeave={() => {
            // this.setState({
            //   clickedCountry: null,
            //   mouseX: -1,
            //   mouseY: -1
            // });
          }}
          onClick={(country, evt) => {
            this.setState({
              clickedCountry: country,
              mouseX: evt.clientX,
              mouseY: evt.clientY
            });
          }}
          round={true}
          key={geography.id}
          geography={geography}
          projection={projection}
          style={{
            default: {
              fill: fillColour,
              stroke: this.state.areBordersVisible ? "white" : fillColour,
              strokeWidth: 0.1,
              outline: "none"
            },
            pressed: {
              outline: "none"
            },
            hover: {
              fill: "#F8EAF6",
              stroke: "#303F9F",
              strokeWidth: 0.1,
              outline: "none"
            }
          }}
        />
      );
    });
  };

  getCountries = () => {
    // Adding `disableOptimization` makes it possible to
    // change the geoghraphies styles. Unfortunatelly this
    // makes the map pretty unresponsive
    // disableOptimization
    return (
      <Geographies geography={data}>
        {(geographies, projection) => {
          return this.getC(geographies, projection);
        }}
      </Geographies>
    );
  };

  getLines = () => {
    const strokeWidth = 2 / this.state.zoom;
    if (!this.state.areCityConnectionsVisible) {
      return null;
    }
    return (
      <Lines>
        {betweenCities.map((l, index) => {
          return (
            <Line
              key={`line_${index}`}
              line={l}
              buildPath={this.buildCurves}
              preserveMarkerAspect={false}
              style={{
                default: {
                  opacity: 0.8,
                  stroke: "coral",
                  strokeWidth,
                  fill: "none",
                  outline: "none"
                },
                hover: {
                  stroke: "coral",
                  fill: "none",
                  strokeWidth,
                  outline: "none"
                },
                pressed: {
                  stroke: "coral",
                  fill: "none",
                  strokeWidth,
                  outline: "none"
                }
              }}
            />
          );
        })}
      </Lines>
    );
  };
  getMarkers = () => {
    if (!this.state.areCitiesVisible) {
      return null;
    }

    return (
      <Markers>
        {cities.map((city, i) => {
          return this.getMarker([city.lng, city.lat], city.location);
        })}
      </Markers>
    );
  };
  getCountriesCentres = () => {
    if (!this.state.areCentersVisbile) {
      return null;
    }

    return (
      <Markers>
        {centers.features.map((country, i) => {
          return this.getMarker(
            country.geometry.coordinates,
            country.properties.formal_en
          );
        })}
      </Markers>
    );
  };

  getPolygonCentre = arr => {
    var x = arr.map(x => x[0]);
    var y = arr.map(x => x[1]);
    var cx = (Math.min(...x) + Math.max(...x)) / 2;
    var cy = (Math.min(...y) + Math.max(...y)) / 2;
    return [cx, cy];
  };
  getAnnotations = () => {
    return null;
    return (
      <Annotations>
        {centers.features.map(country => {
          return (
            <Annotation
              zoom={this.state.zoom}
              subject={[
                country.properties.Longitude,
                country.properties.Latitude
              ]}
              strokeWidth={10}
              preserveMarkerAspect={true}
              style={{
                fontSize: 10
              }}
            >
              <text>{"miau"}</text>
            </Annotation>
          );
        })}
      </Annotations>
    );
    return null;

    if (!this.state.areCitiesVisible) {
      return null;
    }

    const fontSize = 12 / this.state.zoom;
    return (
      <Annotations>
        {cities.map(city => {
          return (
            <Annotation
              key={city.location}
              zoom={this.state.zoom}
              dx={-1}
              dy={1}
              subject={[city.lng, city.lat]}
              strokeWidth={1}
              preserveMarkerAspect={true}
              style={{
                fontSize
              }}
            >
              <text>{city.location}</text>
            </Annotation>
          );
        })}
      </Annotations>
    );
  };

  render() {
    // console.log("this.state.height ", this.state.height, this.state.width);
    if (this.state.width < 0 || this.state.height < 0) {
      return "...loading";
    }
    return (
      <MapWrapper className="App" ref={this.containerRef}>
        <SettingsPanel>
          <button onClick={this.handleZoomIn}>{"Zoom in"}</button>
          <button onClick={this.handleZoomOut}>{"Zoom out"}</button>

          <fieldset>
            <legend>Settings</legend>
            <div>
              <input
                id="cities"
                type="checkbox"
                checked={this.state.areCitiesVisible}
                onChange={() => {
                  this.setState({
                    areCitiesVisible: !this.state.areCitiesVisible
                  });
                }}
              />
              <label htmlFor="cities">Show cities</label>
            </div>
            <div>
              <input
                id="connections"
                type="checkbox"
                checked={this.state.areCityConnectionsVisible}
                onChange={() => {
                  this.setState({
                    areCityConnectionsVisible: !this.state
                      .areCityConnectionsVisible
                  });
                }}
              />
              <label htmlFor="connections">Show city connections</label>
            </div>
            <div>
              <input
                id="centres"
                type="checkbox"
                checked={this.state.areCentersVisbile}
                onChange={() => {
                  this.setState({
                    areCentersVisbile: !this.state.areCentersVisbile
                  });
                }}
              />
              <label htmlFor="centres">Show country centres</label>
            </div>
            <div>
              <input
                id="show-borders"
                type="checkbox"
                checked={this.state.areBordersVisible}
                onChange={() => {
                  this.setState({
                    areBordersVisible: !this.state.areBordersVisible
                  });
                }}
              />
              <label htmlFor="show-borders">Show country borders</label>
            </div>
            <div>
              <input
                id="show-density"
                type="checkbox"
                checked={this.state.isDensityVisible}
                onChange={() => {
                  this.setState({
                    isDensityVisible: !this.state.isDensityVisible
                  });
                }}
              />
              <label htmlFor="show-density">Show population density</label>
            </div>
          </fieldset>
        </SettingsPanel>
        <div>
          <ComposableMap
            style={{ width: "100%" }}
            height={this.state.height - 200}
            width={this.state.width}
          >
            <ZoomableGroup zoom={this.state.zoom}>
              {this.getCountries()}
              {this.getLines()}
              {this.getMarkers()}
              {this.getCountriesCentres()}
              {this.getAnnotations()}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </MapWrapper>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
