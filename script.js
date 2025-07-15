// import d3
import * as d3 from "d3";

// import nodejs modules for reading csv file
import { readFile, writeFIle } from 'fs/promises';


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
        if (geoJson.features[i].properties.admin == "Afghanistan") {
            console.log(path.centroid(geoJson.features[i]));
            country = path.centroid(geoJson.features[i]);
            break;
        }
    }

    // array of country centroids
    var centroids = [

    ];

    // calculate centroids for every country
    for (var i = 0; i < geoJson.features.length; i++) {
        centroids.push({
            coordinates: path.centroid(geoJson.features[i]),
            name: geoJson.features[i].properties.admin,
            flag: `/assets/flags/${geoJson.features[i].properties.admin.replace(" ", "_").toLowerCase()}.png`
        })
        if (i == geoJson.features.length - 1) {
            console.log(centroids);
        }
    }
    console.log(geoJson.features[0])
    console.log(geoJson);

    // appends a path including all features (boundaries) (works with countries & provinces)
    svg.selectAll("path")
        .data(geoJson.features)
        .join("path")
            .attr("d", path)
            .attr("fill", "rgba(72, 153, 210, 1)")
            .attr("stroke", "rgba(72, 153, 210, 1)");


for (var i = 0; i < geoJson.features.length; i++) {
    svg.append("image")
    .attr("href", centroids[i].flag) // or your own flag path
    .attr("x", centroids[i].coordinates[0] - 10)
    .attr("y", centroids[i].coordinates[1] - 7.5)
    .attr("width", 20)
    .attr("height", 15);
}

};

dataPoints();




// append svg to #map div
map.append(svg.node());
