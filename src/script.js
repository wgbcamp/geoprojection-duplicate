// import d3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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

//variables for json files
var geoJson;
var commitments;

// array of country centroids
var centroids = [

];

// array of commitment types
var types = [
    {name: "GRA", color: "rgb(255, 255,255)"}, 
    {name: "PRGT", color: "rgb(183, 47, 49)"}, 
    {name: "RST", color: "rgb(76, 123, 58)"}
];

// fetch geoJson file
const dataPoints = async () => {
    var getData = await fetch('data/custom.geo.json');
    geoJson = await getData.json();
    var getCommmitments = await fetch(`data/output.json`);
    commitments = await getCommmitments.json();

    // calculate centroids for every country
    for (var i = 0; i < geoJson.features.length; i++) {
        for (var a = 0; a < commitments.length; a++) {
            if (geoJson.features[i].properties.admin == commitments[a].Member) {
                centroids.push({
                    coordinates: path.centroid(geoJson.features[i]),
                    name: geoJson.features[i].properties.admin,
                    flag: `flags/${geoJson.features[i].properties.admin.replace(" ", "_").toLowerCase()}.png`
                });
                console.log(geoJson.features[i].properties.admin.replace(" ", "_").toLowerCase());
                break;
            }
        }
        if (i == geoJson.features.length - 1) {
            console.log(centroids);
        }
    }
    console.log(geoJson);

    // appends a path including all features (boundaries) (works with countries & provinces)
    svg.selectAll("path")
        .data(geoJson.features)
        .join("path")
            .attr("d", path)
            .attr("fill", "rgba(72, 153, 210, 1)")
            .attr("stroke", "rgba(72, 153, 210, 1)");

};

dataPoints();

// year ticker
var year = 1952;

setInterval(() => {
    if (year <= 2025) {

        // clear images from document
        var previousFlags;
        previousFlags = document.querySelectorAll('.flagImage');
        for (var i = 0; i < previousFlags.length; i++) {
            previousFlags[i].remove();
        }


        for (var i = 0; i < commitments.length; i++) {
            if (commitments[i].Year == year) {
                console.log(commitments[i]);

                // append the flag images to the map
                for (var a = 0; a < centroids.length; a++) {
                    if (commitments[i].Member == centroids[a].name) {
                        for (var b = 0; b < types.length; b++) {
                            if (types[b].name == commitments[i].Type) {
                                svg.append("rect")
                                .attr("x", centroids[a].coordinates[0] - 10.5)
                                .attr("y", centroids[a].coordinates[1] - 8)
                                .attr("width", 21)
                                .attr("height", 16)
                                .attr("fill", types[b].color)
                                .attr("class", "flagImage");
                            }
                        }

                    svg.append("image")
                        .attr("href", centroids[a].flag)
                        .attr("x", centroids[a].coordinates[0] - 10)
                        .attr("y", centroids[a].coordinates[1] - 7.5)
                        .attr("width", 20)
                        .attr("height", 15)
                        .attr("id", centroids[a].name)
                        .attr("class", "flagImage");
                    } 
                }
            }
        }
        year++;
    } else {
        // mediaRecorder.stop();
    }
}, 2500, year);


// append svg to #map div
map.append(svg.node());
