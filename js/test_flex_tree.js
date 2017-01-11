var test_case = {
        "name": "flare",
        "sizing": "node-size-function",
        "gap": "spacing-0"
    },
    test_case_num,
    engine;
d3.json('flextree.json', function (err, tree) {

    engine = d3.layout.tree().setNodeSizes(true);
    // gap
    if (test_case.gap == "separation-1") {
        engine.separation(function (a, b) {
            return 1;
        });
    }
    else if (test_case.gap == "spacing-0") {
        engine.spacing(function (a, b) {
            return 0;
        });
    }
    else if (test_case.gap == "spacing-custom") {
        engine.spacing(function (a, b) {
            return a.parent == b.parent ?
                0 : engine.rootXSize();
        })
    }

    // sizing
    if (test_case.sizing == "node-size-function") {
        engine.nodeSize(function (t) {
            return [t.x_size, t.y_size];
        })
    }
    else if (test_case.sizing == "node-size-fixed") {
        engine.nodeSize([50, 50]);
    }
    else if (test_case.sizing == "size") {
        engine.size([200, 100]);
    }


    // First get the bag of nodes in the right order
    var nodes = d3.layout.hierarchy()(tree);

    // Then get started drawing, including, in the case of flare,
    // the text for each node, which is needed to determine the
    // node sizes, which are used in the layout algorithm.
    var svg = d3.select("#drawing").append("div").append('svg');
    var svg_g = svg.append("g");

    var last_id = 0;
    var node = svg_g.selectAll(".node")
        .data(nodes, function (d) {
            return d.id || (d.id = ++last_id);
        })
        .enter().append("g")
        .attr("class", "node")
        ;

    // In the case of flare, create the node text now, which is used
    // in the layout.
    if (test_case.name == "flare") {
        var text_elements = node.append("text")
            .attr({
                "id": function (d) {
                    return d.id;
                },
                fill: 'black',
                dx: 5,
                dy: "0.35em"
            })
            .html(function (d) {
                return '<tspan x="2" dy="1.2em">'+ d.name +'</tspan>' +
                    '<tspan x="2" dy="1.2em">'+ d.name +'</tspan>';
            })
            ;
        engine.nodeSize(function (d) {
            return [25, document.getElementById(d.id).getBBox()["width"] + 30];
        });
    }

    // *Now* do the layout
    nodes = engine.nodes(tree);

    // Get the extents, average node area, etc.
    function node_extents(n) {
        return [n.x - n.x_size / 2, n.y,
            n.x + n.x_size / 2, n.y + n.y_size];
    }

    var root_extents = node_extents(nodes[0]);
    var xmin = root_extents[0],
        ymin = root_extents[1],
        xmax = root_extents[2],
        ymax = root_extents[3],
        area_sum = (xmax - xmin) * (ymax - ymin),
        x_size_min = nodes[0].x_size,
        y_size_min = nodes[0].y_size;

    nodes.slice(1).forEach(function (n) {
        var ne = node_extents(n);
        xmin = Math.min(xmin, ne[0]);
        ymin = Math.min(ymin, ne[1]);
        xmax = Math.max(xmax, ne[2]);
        ymax = Math.max(ymax, ne[3]);
        area_sum += (ne[2] - ne[0]) * (ne[3] - ne[1]);
        x_size_min = Math.min(x_size_min, n.x_size);
        y_size_min = Math.min(y_size_min, n.y_size);
    });
    var area_ave = area_sum / nodes.length;
    // scale such that the average node size is 400 px^2
    console.log("area_ave = " + area_ave);
    var scale = test_case.name == "flare" ? 1 : 80 / Math.sqrt(area_ave);
    console.log("extents = %o", {
        xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax
    });
    console.log("scale = " + scale);

    // Functions to get the derived svg coordinates given the tree node
    // coordinates.
    // Note that the x-y orientations between the svg and the tree drawing
    // are reversed.

    function svg_x(node_y) {
        return (node_y - ymin) * scale;
    }

    function svg_y(node_x) {
        return (node_x - xmin) * scale;
    }


    // FIXME: need to implement these -- the max value should not
    // be scaled.

    // The node box is drawn smaller than the actual node width, to
    // allow room for the diagonal. Note that these are in units of
    // svg drawing coordinates (not tree node coordinates)
    var nodebox_right_margin = Math.min(x_size_min * scale, 10);
    // And smaller than the actual node height, for spacing
    var nodebox_vertical_margin = Math.min(y_size_min * scale, 3);


    function rand() {
        return 80 + Math.floor(Math.random() * 100);
    }

    //var filler = test_case.name != "flare"
    //    ? function () {
    //    return "fill: rgb(" + rand() + "," + rand() + "," + rand() + ")";
    //}
    //    : "fill: none";
    var filler = function () {
        //return "fill: rgb(" + rand() + "," + rand() + "," + rand() + ")";
        return "fill-opacity: 0; stroke:rgb(" + rand() + "," + rand() + "," + rand() + ")"
    };
    // Reposition everything according to the layout
    node.attr("transform", function (d) {
            return "translate(" + svg_x(d.y) + "," + svg_y(d.x) + ")";
        })
        .append("rect")
        .attr("data-id", function (d) {
            return d.id;
        })
        .attr({
            x: 0,
            y: function (d) {
                return -(d.x_size * scale - nodebox_vertical_margin) / 2;
            },
            rx: 6,
            ry: 6,
            width: function (d) {
                return d.y_size * scale - nodebox_right_margin;
            },
            height: function (d) {
                return d.x_size * scale - nodebox_vertical_margin;
            },
            style: filler
        })
    ;


    // This controls the lines between the nodes; see
    // https://github.com/mbostock/d3/wiki/SVG-Shapes#diagonal_projection
    var diagonal = d3.svg.diagonal()
        .source(function (d, i) {
            var s = d.source;
            return {
                x: s.x,
                y: s.y + s.y_size - nodebox_right_margin / scale
            };
        })
        .projection(function (d) {
            return [svg_x(d.y), svg_y(d.x)];
        })
        ;

    var links = engine.links(nodes);
        links = svg_g.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);

    // Set the svg drawing size and translation

    svg.attr({
        width: (ymax - ymin) * scale,
        height: (xmax - xmin) * scale
    });
});
