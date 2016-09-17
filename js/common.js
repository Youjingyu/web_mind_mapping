/**
 * Created by Administrator on 2016/9/15.
 */
$(document).ready(function(){
    var ctx_1_2 = document.getElementById('canvas_1_2').getContext('2d');
//ctx_1_2.globalCompositeOperation = 'source-atop';
    function getCoordinate($ele, type){
        var x = parseInt($ele.offset().left);
        var y = parseInt($ele.offset().top);
        if(type == 'left'){
            return {
                x: x,
                y: y + parseInt($ele.innerHeight())/2
            }
        } else {
            return {
                x: x + parseInt($ele.innerWidth()),
                y: y + parseInt($ele.innerHeight())/2
            }
        }
    }

    function init(){
        var $first_menu = $('.first-menu');
        var $second = $('.second');
        var end = getCoordinate($('.second'), 'left');
        var start = getCoordinate($('.first-menu'), 'right');
        var next_menu = [1,2,3,1,2,3,1,2]
        $first_menu.css('margin-top', (window.innerHeight-$first_menu.innerHeight())/2+'px');
        //$second.css('margin-top', (start.y-end.y)+'px');
        console.log(start,end)
    }

    init();

    function drawLine(){
        var start = getCoordinate($('.first-menu'), 'right');
        var end = getCoordinate($('.second-menu'), 'left');
        ctx_1_2.strokeStyle = "orange";
        ctx_1_2.lineWidth = 2;
        ctx_1_2.beginPath();
        ctx_1_2.moveTo(0, start.y);
        ctx_1_2.quadraticCurveTo(15,start.y,25,start.y-15);
        ctx_1_2.lineTo(75, end.y+15);
        ctx_1_2.quadraticCurveTo(85,end.y,100,end.y);
        ctx_1_2.stroke();
    }
    drawLine();
});
