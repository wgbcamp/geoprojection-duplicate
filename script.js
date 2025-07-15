import * as d3 from "d3";

// svg dimensions
const height = 800;
const width = 1400;

// svg container
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// d3 projection
const projection = d3.geoEqualEarth();

// d3 path generator
const path = d3.geoPath().projection(projection);

// path for geoJson file
const FeatureCollection = 'custom.geo.json';

// fetch geoJson file
const dataPoints = async () => {
    var getData = await fetch(`/data/${FeatureCollection}`);
    var geoJson = await getData.json();

    // find Costa Rica
    var country = [];

    for (var i = 0; i < geoJson.features.length; i++) {
        if (geoJson.features[i].properties.admin == "") {
            console.log(path.centroid(geoJson.features[i]));
            country = path.centroid(geoJson.features[i]);
            break;
        }
    }

    // calculate centroids for every country

    console.log(geoJson.features[0])
    console.log(geoJson);

    // appends a path including all features (boundaries) (works with countries & provinces)
    svg.selectAll("path")
        .data(geoJson.features)
        .join("path")
            .attr("d", path)
            .attr("fill", "rgba(72, 153, 210, 1)")
            .attr("stroke", "black");

    // array of country centroids
    var centroids = [{
        x: 257.3951247013163,
        y: 214.33479102623212
    }]

//   svg.selectAll("path")
//     .data(centroids)
//     .enter()
//     .append("image")
//     .attr('width', 20)
//     .attr('height', 20)
//     .attr('x', centroids[0].x)
//     .attr('y', centroids[0].y)
//     .attr("href", 'assets/afghanistan.png')
//     .attr("transform", (d) => {
//         let p = projection([d.long, d.lat]);
//                 return `translate(${p[0]-10}, ${p[1]-10})`;
//     });

svg.append("image")
  .attr("href", "https://flagcdn.com/w40/af.png") // or your own flag path
  .attr("x", country[0] - 10)
  .attr("y", country[1] - 7.5)
  .attr("width", 20)
  .attr("height", 15);


};

dataPoints();




// append svg to #map div
map.append(svg.node());
