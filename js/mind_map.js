var margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    },
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var root = {
    "content": "flare flare flare flare flare flare flare flare",
    "children": [{
        "content": "analytics",
        "children": [{
            "content": "cluster",
            "children": [{
                "content": "AgglomerativeCluster",
                "size": 3938
            }, {
                "content": "CommunityStructure",
                "size": 3812
            }, {
                "content": "HierarchicalCluster",
                "size": 6714
            }, {
                "content": "MergeEdge",
                "size": 743
            }]
        }, {
            "content": "graph",
            "children": [{
                "content": "BetweennessCentrality",
                "size": 3534
            }, {
                "content": "LinkDistance",
                "size": 5731
            }, {
                "content": "MaxFlowMinCut",
                "size": 7840
            }, {
                "content": "ShortestPaths",
                "size": 5914
            }, {
                "content": "SpanningTree",
                "size": 3416
            }]
        }, {
            "content": "optimization",
            "children": [{
                "content": "AspectRatioBanker",
                "size": 7074
            }]
        }]
    }, {
        "content": "animate",
        "children": [{
            "content": "Easing",
            "size": 17010
        }, {
            "content": "FunctionSequence",
            "size": 5842
        }, {
            "content": "interpolate",
            "children": [{
                "content": "ArrayInterpolator",
                "size": 1983
            }, {
                "content": "ColorInterpolator",
                "size": 2047
            }, {
                "content": "DateInterpolator",
                "size": 1375
            }, {
                "content": "Interpolator",
                "size": 8746
            }, {
                "content": "MatrixInterpolator",
                "size": 2202
            }, {
                "content": "NumberInterpolator",
                "size": 1382
            }, {
                "content": "ObjectInterpolator",
                "size": 1629
            }, {
                "content": "PointInterpolator",
                "size": 1675
            }, {
                "content": "RectangleInterpolator",
                "size": 2042
            }]
        }, {
            "content": "ISchedulable",
            "size": 1041
        }, {
            "content": "Parallel",
            "size": 5176
        }, {
            "content": "Pause",
            "size": 449
        }, {
            "content": "Scheduler",
            "size": 5593
        }]
    }]
};

var i = 0,
    duration = 750,
    rectW = 60,
    rectH = 30;

var tree = d3.layout.tree().nodeSize([70, 40]).separation(function(a, b){
    return 1
});
var diagonal = d3.svg.diagonal()
    .projection(function (d) {
        var h = d.height ? d.height : rectH;
        return [d.y + rectW / 2, d.x + rectH / 2];
    });
var client_width = document.documentElement.clientWidth,
    client_height = document.documentElement.clientHeight;

var svg = d3.select("#body").append("svg").attr("width", client_width).attr("height", client_height)
    .call(zm = d3.behavior.zoom().scaleExtent([0.5,3]).on("zoom", redraw)).append("g")
    .attr("transform", "translate(" + 20 + "," + client_height/2 + ")");

//necessary so that zoom knows where to zoom and unzoom from
zm.translate([20, client_height/2]);

root.x0 = 0;
root.y0 = height / 2;

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.width = 30;
        console.log(d._children.width);
        d._children.forEach(collapse);
        d.children = null;
    }
}

root.children.forEach(collapse);
update(root);

d3.select("#body").style("height", "800px");

function update(source) {
    console.log(source);

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 180;
    });

    // Update the nodes��
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);

    nodeEnter.append("rect")
        .attr("width", function(){
            return rectW
        })
        .attr("height", function(d){
            d.height = 30;
            return d.height
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", function (d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    var text = nodeEnter.append("text")
        .attr("x", 2)
        .attr("y", 10)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .attr("content", function(d){
            return d.content;
        })

    wrap(text, 55);
    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });
    /*Delete by whale start*/
    //nodeUpdate.select("rect")
    //    .attr("width", rectW)
    //    .attr("height", rectH)
    //    .attr("stroke", "black")
    //    .attr("stroke-width", 1)
    //    .style("fill", function (d) {
    //        return d._children ? "lightsteelblue" : "#fff";
    //    });

    //nodeUpdate.select("text")
    //    .style("fill-opacity", 1);
    /*Delete by whale end*/
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    /*Delete by whale start*/
    //nodeExit.select("rect")
    //    .attr("width", rectW)
    //    .attr("height", rectH)
    //    //.attr("width", bbox.getBBox().width)""
    //    //.attr("height", bbox.getBBox().height)
    //    .attr("stroke", "black")
    //    .attr("stroke-width", 1);
    //
    //nodeExit.select("text");
    /*Delete by whale end*/

    // Update the links��
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        /*Delete by whale start*/
        //.attr("x", rectW / 2)
        //.attr("y", rectH / 2)
        /*Delete by whale end*/
        .attr("d", function (d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d._children.width = 30;
        d.children = null;
    } else {
        d.children = d._children;
        d.children.width = 30;
        d._children = null;
    }
    update(d);
}

//Redraw for zoom
function redraw() {
    //console.log("here", d3.event.translate, d3.event.scale);
    svg.attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
}
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.attr('content').split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}