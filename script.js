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
const FeatureCollections = ['provinces.json', 'countries.json', 'custom.geo.json'];
const GeometryCollection = 'world.json';

// fetch geoJson file
const dataPoints = async () => {
    var getData = await fetch(`/data/${FeatureCollections[2]}`);
    var geoJson = await getData.json();
    console.log(geoJson);

    // appends a path using the geojson GeometryCollection (only works with world.json)
    // svg.append("path")
    // .datum({type: "GeometryCollection", geometries: geoJson.geometries})
    // .attr("d", path)
    //     .attr("fill", "none")
    //     .attr("stroke", "black");

    // appends a path including all features (boundaries) (works with countries & provinces)
    svg.selectAll("path")
        .data(geoJson.features)
        .join("path")
            .attr("d", path)
            .attr("fill", "rgba(72, 153, 210, 1)")
            .attr("stroke", "rgba(72, 153, 210, 1)");

    // svg.selectAll()
    //     .data(geoJson.geometries)
    //     .join("path")
    //         .attr("d", path)
    //         .attr("fill", "none")
    //         .attr("stroke", "black");

    // array of country centroids
    var centroids = [{
        x: 257.3951247013163,
        y: 214.33479102623212
    }]

  svg.selectAll(".m")
    .data(centroids)
    .enter()
    .append("image")
    .attr('width', 20)
    .attr('height', 20)
    .attr('x', centroids[0].x)
    .attr('y', centroids[0].y)
    .attr("href", 'assets/afghanistan.png');

    // centroid of afghanistan
    console.log(path.centroid(geoJson.features[0]));


};

dataPoints();




// append svg to #map div
map.append(svg.node());
