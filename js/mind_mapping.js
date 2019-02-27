var engine,
    duration = 750;
var margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    },
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var loadingEle = document.getElementById('loading')
var loadingStatus = loadingEle.getElementsByTagName('span')[0]
var count = 0
var lodingTimer = setInterval(function () {
  loadingStatus.textContent = new Array(count).join(' .')
  count = count > 3 ? 0 : count
  count++
}, 300)

d3.json('bs_introduction/bs_introduction.json', function (err, tree) {

    engine = d3.layout.tree().setNodeSizes(true);

    // sizing
    engine.nodeSize(function (t) {
        return [t.x_size, t.y_size];
    });
    // gap
    engine.spacing(function (a, b) {
        return a.parent == b.parent ?
            5 : engine.rootXSize();
    });
    // set the original coordinates of the root node
    tree.x0 = height / 2;
    tree.y0 = 0;
    // function to collapse data
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    var $iframe_doc = document.getElementById('html_code').contentWindow.document;
    // modal event
    var $modal = d3.select('#modal'),
        $modal_cell = $modal.select('.modal-cell'),
        $modal_pre = $modal.select('.modal-code'),
        $modal_code = $modal_pre.select('code');
    $modal.on("click.mask", function(){
        if(d3.event.target.className !== 'modal-cell'){
            return false;
        }
        $modal.style('display', 'none');
        $modal.selectAll('img').style('display', 'none');
        $modal_pre.style('display', 'none')
    });

    var client_width = document.documentElement.clientWidth,
        client_height = document.documentElement.clientHeight;
    var svg = d3.select("#drawing").append('svg').attr("width", client_width).attr("height", client_height);
    var svg_g = svg.append("g");
    // add zoom event
    svg.call(d3.behavior.zoom().scaleExtent([0.5,3]).on("zoom", redraw));

    update(tree);
    tree.children.forEach(collapse);
    update(tree, function(){
        setTimeout(function(){
            clearInterval(lodingTimer)
            d3.select("#loading").style({'display': "none"});
            d3.select("#drawing").style({'visibility': "visible"});
            d3.selectAll(".node").each(function(d, i){
                i > 0 && (d3.select(this).select(".vertical-line").style('display', 'block'));
            });
        },1000);
    });

    function update(source, callback){
        // get nodes array
        var nodes = d3.layout.hierarchy()(tree);
        var last_id = 0;
        // set id for each node
        var node = svg_g.selectAll(".node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++last_id);
            });
        // append g and tansform to correct position
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                var x_size = source.x_size ? source.x_size : 0;
                return "translate(" + source.y0 + "," + (source.x0 - x_size / 2) + ")";
            });
            //.on("click", click);
        // add text
        var text_elements = nodeEnter.append("text")
            .attr({
                id: function (d) {
                    return d.id;
                },
                fill: 'black',
                dy: "0.35em"
            }).each(function(d){
                parseText(this, d);
            });
        // compute node size
        engine.nodeSize(function (d) {
            var ele = document.getElementById(d.id),
                ele_size = ele.getBBox();
            return [ele_size["height"] + 30, ele_size["width"] + 14];
        });

        // do the layout
        nodes = engine.nodes(tree);

        // get the extents, average node area, etc.
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
        var scale = 1;

        // functions to get the svg coordinates
        function svg_x(node_y) {
            return (node_y - ymin) * scale;
        }
        function svg_y(node_x) {
            return (node_x - xmin) * scale;
        }
        // compute the distance according to the node size
        var nodebox_right_margin = Math.min(x_size_min * scale, 10),
            nodebox_vertical_margin = Math.min(y_size_min * scale, 3);

        // random border color
        function rand() {
            return 80 + Math.floor(Math.random() * 100);
        }
        var filler = function () {
            return "fill-opacity: 0; stroke:rgb(" + rand() + "," + rand() + "," + rand() + ")"
        };
        // reposition everything according to the layout
        node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                if(d.parent && d.parent.y0 && d.parent.y_size){
                    d.y = d.parent.y0 + d.parent.y_size + 100;
                } else {
                    d.y = d.depth * 180;
                }
                return "translate(" + svg_x(d.y) + "," + (svg_y(d.x)-(d.x_size * scale - nodebox_vertical_margin) / 2) + ")";
            });
        nodeEnter.append("rect")
            .attr({
                x: 0,
                rx: 6,
                ry: 6,
                width: function (d) {
                    return d.y_size * scale - nodebox_right_margin;
                },
                height: function (d) {
                    return d.x_size * scale - nodebox_vertical_margin;
                },
                style: function(d){
                    return d.filler = filler();
                }
            })
            .attr('next', function(d){
                if(d.children || d._children){
                    var $g = d3.select(this.parentNode).append('g').attr({
                        transform: 'translate(' + (d.y_size - 6) +  ',' + (d.x_size/2 - 5) + ')'
                    }).on("click", click);
                    $g.append('circle').attr({
                        r: '7',
                        cx: 3.5,
                        cy: 3.5,
                        style: 'stroke:' + d.filler
                    });
                    $g.append('line').attr({
                        x1: 0,
                        y1: 3.5,
                        x2: 7,
                        y2: 3.5,
                        style: 'stroke:' + d.filler
                    });
                    var $vertical_line =  $g.append('line').attr({
                        x1: 3.5,
                        y1: 0,
                        x2: 3.5,
                        y2: 7,
                        style: 'stroke:' + d.filler
                    }).classed('vertical-line', true);
                    if(d._children){
                        $vertical_line.style('display', 'block');
                    } else {
                        $vertical_line.style('display', 'none');
                    }
                    return true
                }
                return false
        });
        node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + (source.y) + "," + (svg_y(source.x)-(source.x_size * scale - nodebox_vertical_margin)/2) + ")";
            })
            .remove();

        // control the lines between the nodes
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
        var enter_diagonal = d3.svg.diagonal()
            .source(function (d, i) {
                var s = d.source;
                return {
                    x: s.x,
                    y: s.y + s.y_size - nodebox_right_margin / scale
                };
            })
            .projection(function (d) {
                return [d.y, d.x];
            });
        var links = engine.links(nodes);
        var link = svg_g.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0,
                    y_size: source.y_size
                };
                return enter_diagonal({
                    source: o,
                    target: o
                });
            });
        // transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);
        // transition exiting nodes to the parent's new position
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y,
                    y_size: source.y_size
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();
        // save the old positions for transition
        nodes.forEach(function (d) {
            d.x0 = svg_y(d.x);
            d.y0 = svg_x(d.y);
        });
        callback && callback();
    }

    // function for zoom
    function redraw() {
        svg_g.attr("transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");
    }
    // toggle children on click
    function click(d) {
        if (d.children) {
            d3.select(this).select('.vertical-line').style('display', 'block');
            d._children = d.children;
            d.children = null;
        } else {
            d3.select(this).select('.vertical-line').style('display', 'none');
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
    // wrap text line, control image ang highlight code
    function parseText(text_tag, d){
        var $text = d3.select(text_tag),
            content = d.content;
        if(typeof content === 'string'){
            if(/^(\.\/)?img\//.test(content)){
                var img_id = content.replace(/[\/\.]/g, '');
                if($modal_cell.select('#' + img_id)[0][0] === null){
                    $modal_cell.append('img').attr('id', img_id).attr('src', content).attr('style', 'display:none');
                }
                $text.append('tspan').attr({x: '2', dy: '1.5em', path: content}).text('点击查看图片');
                d3.select(text_tag.parentNode).attr('img_id', img_id).on("click.show", function(){
                    $modal.select('#' + d3.select(this).attr('img_id')).attr("style", "display:inline-block");
                    $modal.attr("style", "display: block");
                });
            } else {
                var len = 0, split_str = '', reg = /[^\x00-\xff]/;
                var split_arr = content.split(''),
                    split_arr_len = split_arr.length - 1;
                split_arr.forEach(function(val, i){
                    if(reg.test(val)){
                        len += 2;
                    } else {
                        len += 1;
                    }
                    split_str += val;
                    if(len >= 30 || i >= split_arr_len){
                        $text.append('tspan').attr({x: '2', dy: '1.5em'}).text(split_str);
                        len = 0;
                        split_str = '';
                    }
                });
            }
        } else {
            if(content.type === 'html_code'){
                $modal_code.attr('class', 'language-html');
            } else if(content.type === 'js_code'){
                $modal_code.attr('class', 'language-javascript');
            }
            $text.append('tspan').attr({x: '2', dy: '1.5em'}).text('点击查看代码');
            d3.select(text_tag.parentNode).attr('code_id', content.id).on("click.show", function(){
                var code = $iframe_doc.getElementById(d3.select(this).attr('code_id')).innerHTML;
                $modal_code.text(code);
                $modal_pre.style('display', 'inline-block');
                Prism.highlightAll();
                $modal.style('display', 'block');
            });
        }
    }
});
