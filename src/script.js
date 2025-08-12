// import d3
import * as d3 from "d3";
import * as htmlToImage from 'html-to-image';

// check for h.264 support
// const isSupported = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E"');
// console.log("MP4 with H.264 support:", isSupported);

// add variable for MediaRecorder
var mediaRecorder;

// event listener to start MediaRecorder
window.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        // capture video
        navigator.mediaDevices.getDisplayMedia({ 
            video: {
                frameRate: { ideal: 30, max: 60 },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }, 
            preferCurrentTab: true,
            audio: false
        })
            .then(function (stream) {

                const options = {
                    videoBitsPerSecond: 500000000,
                    mimeType: 'video/webm; codecs=vp9'
                };

                mediaRecorder = new MediaRecorder(stream, options);

                let chunks = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        chunks.push(e.data);
                    }
                }

                mediaRecorder.onstop = function () {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'canvas-recording.webm';
                    if (window.confirm("Download video?")) {
                        a.click();
                    }
                }

                mediaRecorder.start();

            })
            .catch(function (err) {
                console.log("Error accessing display media:", err);
            });
    }
})



// testing screen recording frames to png
// const start = async () => {
//     const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
// }

// start();

// svg dimensions
const height = 2160;
const width = 3840;

// svg container
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "testing");

// d3 projection
var projection;
var backgroundProjection;

// d3 path generator
var path;
var backgroundPath;

//variables for json files
var geoJson;
var background;
var commitments;

// array of country centroids
var centroids = [];

// array of commitment types
var types = [
    {name: "GRA", color: "rgba(255, 255, 255, 0.77)"}, 
    {name: "PRGT", color: "rgb(183, 47, 49)"}, 
    {name: "RST", color: "rgb(76, 123, 58)"}
];

// fetch geoJson file
const dataPoints = async () => {
    var getData = await fetch('/data/countries.json');
    geoJson = await getData.json();
    console.log("geoJson")
    console.log(geoJson);
    var getBackground = await fetch('/data/land.json');
    background = await getBackground.json();
    console.log("background")
    console.log(background);

    var getCommmitments = await fetch(`/data/output.json`);
    commitments = await getCommmitments.json();

    // assign projection and path values
    projection = d3.geoNaturalEarth1().fitSize([width, 2860], geoJson).rotate([-10, 0]);
    path = d3.geoPath().projection(projection);
    backgroundProjection = d3.geoNaturalEarth1().fitSize([width, 2860], background).rotate([-10, 0]);
    backgroundPath = d3.geoPath().projection(backgroundProjection);

    // calculate centroids for every country
    for (var i = 0; i < geoJson.features.length; i++) {
        for (var a = 0; a < commitments.length; a++) {
            if (geoJson.features[i].properties.ADMIN == commitments[a].Member) {
                centroids.push({
                    coordinates: path.centroid(geoJson.features[i]),
                    name: geoJson.features[i].properties.ADMIN,
                    flag: `flags/${geoJson.features[i].properties.ADMIN.replaceAll(/[- ]/g, "_").toLowerCase()}.png`
                });
                console.log(geoJson.features[i].properties.ADMIN.replaceAll(/[- ]/g, "_").toLowerCase());
                break;
            }
        }
        if (i == geoJson.features.length - 1) {
            console.log(centroids);
        }
    }
    console.log(geoJson);

    // appends the path landmass geojson
    svg.selectAll("path")
    .data(background.features)
    .join("path")
        .attr("d", backgroundPath)
        .attr("fill", "rgba(72, 153, 210, 1)");
};

dataPoints();

// convert svg to png
const convertSvgToPng = () => {
    const svgElement = document.getElementById('map');

    htmlToImage.toPng(svgElement, {
        width: 3840,
        height: 2160,
        pixelRatio: 1
    })
        .then(function (dataUrl) {
            const img = new Image();
            img.src = dataUrl;
            document.body.appendChild(img);
            console.log(img);

            const link = document.createElement('a');
            link.download = `Year_${year}.png`;
            link.href = dataUrl;
            link.click();
            year++;
        })
        .catch(function (error) {
            console.error(error);
        });
}


// year ticker
var year = 1952;

// svg pin shape
const pinHeight = 50;
const pinWidth = 30;

const pin = svg.append("g")
    .attr("transform", `translate`);

    let lines = [];

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

                                //collision detection method
                                // Array to store all drawn lines

                                // Function to check if two lines intersect
                                function linesIntersect(l1, l2) {
                                    function ccw(A, B, C) {
                                        return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
                                    }
                                    return (
                                        ccw([l1.x1, l1.y1], [l2.x1, l2.y1], [l2.x2, l2.y2]) !==
                                        ccw([l1.x2, l1.y2], [l2.x1, l2.y1], [l2.x2, l2.y2]) &&
                                        ccw([l1.x1, l1.y1], [l1.x2, l1.y2], [l2.x1, l2.y1]) !==
                                        ccw([l1.x1, l1.y1], [l1.x2, l1.y2], [l2.x2, l2.y2])
                                    );
                                }

                                // Function to draw a line without intersections
                                function drawNonIntersectingLine(startX, startY) {
                                    let attempts = 0;
                                    while (attempts < 1000) {
                                        let length = 50 + Math.random() * 100; // random length
                                        let angle = Math.random() * 2 * Math.PI; // random direction
                                        let endX = startX + Math.cos(angle) * length;
                                        let endY = startY + Math.sin(angle) * length;

                                        let newLine = { x1: startX, y1: startY, x2: endX, y2: endY };

                                        let intersects = lines.some(line => linesIntersect(line, newLine));

                                        if (!intersects) {
                                            // Store the line
                                            lines.push(newLine);

                                            // Make the circle...
                                            svg.append("circle")
                                                .attr("cx", (centroids[a].coordinates[0] - 33.5) + (67 / 2))
                                                .attr("cy", (centroids[a].coordinates[1] - 24.5) + (49 / 2))
                                                .attr("r", 10)
                                                .attr("fill", types[b].color)
                                                .attr("class", "flagImage");

                                            // Draw the line
                                            svg.append("line")
                                                .attr("x1", newLine.x1)
                                                .attr("y1", newLine.y1)
                                                .attr("x2", newLine.x2)
                                                .attr("y2", newLine.y2)
                                                .attr("stroke", "black")
                                                .attr("stroke-width", 2)
                                                .attr("class", "flagImage");

                                            // append box shadow and then image
                                            const defs = svg.append("defs");

                                            const filter = defs.append("filter")
                                                .attr("id", "boxShadow")
                                                .attr("x", "-20%")
                                                .attr("y", "-20%")
                                                .attr("width", "140%")
                                                .attr("height", "140%");

                                            filter.append("feDropShadow")
                                                .attr("dx", 0)
                                                .attr("dy", 4)
                                                .attr("stdDeviation", 6)
                                                .attr("flood-color", "black")
                                                .attr("flood-opacity", 0.3);

                                            svg.append("image")
                                                .attr("href", centroids[a].flag)
                                                .attr("x", newLine.x2 - 67 /2)
                                                .attr("y", newLine.y2 - 49 /2)
                                                .attr("width", 67)
                                                .attr("height", 49)
                                                .attr("id", centroids[a].name)
                                                .attr("class", "flagImage")
                                                .attr("filter", "url(#boxShadow");

                                            return; // done
                                        }
                                        attempts++;
                                    }
                                    console.warn("Could not place a non-intersecting line after many tries.");
                                }
  
                                // for (let i = 0; i < 20; i++) {
                                //     let startX = Math.random() * 500;
                                //     let startY = Math.random() * 500;
                                    drawNonIntersectingLine(centroids[a].coordinates[0], centroids[a].coordinates[1]);
                                // }

                                //circle with line to flag option
                                // svg.append("circle")
                                //     .attr("cx", (centroids[a].coordinates[0] - 33.5) + (67 / 2))
                                //     .attr("cy", (centroids[a].coordinates[1] - 24.5) + (49 / 2))
                                //     .attr("r", 10)
                                //     .attr("fill", types[b].color)
                                //     .attr("class", "flagImage");
                                // svg.append("line")
                                //     .attr("x1", centroids[a].coordinates[0])
                                //     .attr("y1", centroids[a].coordinates[1])
                                //     .attr("x2", centroids[a].coordinates[0] + Math.random() * 100)
                                //     .attr("y2", centroids[a].coordinates[1] + Math.random() * 100)
                                //     .attr("stroke", "black")
                                //     .attr("stroke-width", 2)
                                //     .attr("class", "flagImage");

                                // pin + line option
                                // svg.append("line")
                                //     .attr("x1", centroids[a].coordinates[0])
                                //     .attr("y1", centroids[a].coordinates[1])
                                //     .attr("x2", centroids[a].coordinates[0])
                                //     .attr("y2", centroids[a].coordinates[1] + 50)
                                //     .attr("stroke", "white")
                                //     .attr("stroke-width", 4)
                                //     .attr("class", "flagImage");
                                // svg.append("circle")
                                //     .attr("cx", (centroids[a].coordinates[0] - 33.5) + (67 / 2))
                                //     .attr("cy", (centroids[a].coordinates[1] - 24.5) + (49 / 2))
                                //     .attr("r", 10)
                                //     .attr("fill", types[b].color)
                                //     .attr("class", "flagImage");

                                // pin option
                                // const defs = svg.append("defs");

                                // const filter = defs.append("filter")
                                //     .attr("id", "markerShadow")
                                //     .attr("x", "-50%")
                                //     .attr("y", "-20%")
                                //     .attr("width", "540%")
                                //     .attr("height", "440%");

                                // filter.append("feDropShadow")
                                //     .attr("dx", 0)
                                //     .attr("dy", 4)
                                //     .attr("stdDeviation", 6)
                                //     .attr("flood-color", "black")
                                //     .attr("flood-opacity", 0.3);

                                // const cx = centroids[a].coordinates[0];
                                // const cy = centroids[a].coordinates[1];
                                // const pinHeight = 45;
                                // const pinWidth = 35;

                                // const pin = svg.append("g")
                                //     .attr("transform", `translate(${cx}, ${cy})`)
                                //     .attr("class", "flagImage")
                                //     .attr("filter", "url(#markerShadow");


                                // pin.append("path")
                                //     .attr("d", `
                                //         M 0 ${-pinHeight / 2} 
                                //         C ${pinWidth / 2} ${-pinHeight / 2}, ${pinWidth / 2} ${-pinHeight / 6}, 0 ${pinHeight / 2}
                                //         C ${-pinWidth / 2} ${-pinHeight / 6}, ${-pinWidth / 2} ${-pinHeight / 2}, 0 ${-pinHeight / 2}
                                //         Z
                                //     `)
                                //     .attr("fill", types[b].color)
                                //     .attr("stroke", "black")
                                //     .attr("stroke-width", 2);

                                // pin.append("circle")
                                //     .attr("cx", 0)
                                //     .attr("cy", -pinHeight / 4)
                                //     .attr("r", pinWidth / 4)
                                //     .attr("fill", "white");
                            }
                        }

                    // // append box shadow and then image
                    // const defs = svg.append("defs");

                    // const filter = defs.append("filter")
                    //     .attr("id", "boxShadow")
                    //     .attr("x", "-20%")
                    //     .attr("y", "-20%")
                    //     .attr("width", "140%")
                    //     .attr("height", "140%");
                    
                    // filter.append("feDropShadow")
                    //     .attr("dx", 0)
                    //     .attr("dy", 4)
                    //     .attr("stdDeviation", 6)
                    //     .attr("flood-color", "black")
                    //     .attr("flood-opacity", 0.3);

                    // svg.append("image")
                    //     .attr("href", centroids[a].flag)
                    //     .attr("x", centroids[a].coordinates[0] - 33.5 + 50)
                    //     .attr("y", centroids[a].coordinates[1] - 24.5)
                    //     .attr("width", 67)
                    //     .attr("height", 49)
                    //     .attr("id", centroids[a].name)
                    //     .attr("class", "flagImage")
                    //     .attr("filter", "url(#boxShadow");
                    } 
                }
            }
        }
        // convertSvgToPng();
        year++;
    } else {
        // mediaRecorder.stop();
    }
}, 2000, year);


// append svg to #map div
map.append(svg.node());
