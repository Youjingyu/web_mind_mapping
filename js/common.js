/**
 * Created by Administrator on 2016/9/15.
 */
$(document).ready(function(){
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

    var second_data_obj = [
        {
            content: "hahahhahah111111111111111111111111111111111111111111111111111111111",
            next_memu: [
                {
                    content:"4444444",
                    next_memu:[]
                }
            ]
        },
        {
            content: "hehhehehhe"
        },
        {
            content: "hahahhahah"
        },
        {
            content: "hahahhahah"
        },
        {
            content: "hahahhahah"
        }
    ];
    $('.first').data('data', second_data_obj);

    function addNextMenu($ele){
        $ele.after('<div class="one-to-two"><canvas width="100" height="800"></canvas></div>');
        $ele.next().after('<div class="second"></div>');
        var $next_menu = $ele.next().next();
        var start = getCoordinate($ele, 'right');
        var data = $ele.data('data');
        var html = '';
        for(var i = 0, len = data.length; i < len; i++){
            html += '<div class="menu">'+ data[i].content +'</div>';
        }
        $next_menu.append(html);

        var end = getCoordinate($next_menu, 'left');
        //console.log(start, end);
        $next_menu.css('margin-top', (start.y-end.y)+'px');

        var $next_menu_item = $next_menu.find('.menu');
        for(var j = 0; j<len; j++){
            if(data[j].next_memu){
                $($next_menu_item[i]).append('<div class="add-icon-con"><i class="add-icon">+</i></div>');
                $($next_menu_item[i]).data('data', data[i].next_memu);
            }
        }
    }

    function initFirstMenu(){
        var $first = $('.first');
        $first.css('margin-top', (window.innerHeight-$first.innerHeight())/2+'px');
        addNextMenu($first);
    }
    initFirstMenu();

    function drawLine($ele){
        var start = getCoordinate($('.first-menu'), 'right');
        var end, ratio, abs_ratio;
        var ctx_1_2 = $ele.next().find('canvas')[0].getContext('2d');
        ctx_1_2.lineWidth = 2;
        ctx_1_2.beginPath();
        ctx_1_2.moveTo(0, start.y);
        $ele.next().next().find('.menu').each(function(){
            ctx_1_2.strokeStyle = "#"+(~~(Math.random()*(1<<24))).toString(16);
            end = getCoordinate($(this), 'left');
            ratio = (start.y - end.y)/150;
            if(ratio>0.9){ratio=0.9}
            if(ratio<-0.9){ratio=-0.9}
            abs_ratio = Math.abs(ratio);
            ctx_1_2.quadraticCurveTo(15-5*abs_ratio, start.y, 25-5*abs_ratio, start.y-15*ratio);
            ctx_1_2.lineTo(100-25*abs_ratio, end.y+15*ratio);
            ctx_1_2.quadraticCurveTo(100-15*abs_ratio, end.y + 3*ratio, 100, end.y);
            ctx_1_2.stroke();
            ctx_1_2.beginPath();
            ctx_1_2.moveTo(0, start.y);
        });
    }

    $('.add-icon-con').click(function(){
        var $this =  $(this);
        var $content = $this.parent().parent();
        if($this.find('i').html() == "+"){
            $this.find('i').html("-");
            $('.second').show();
            drawLine($content);
        } else {
            $this.find('i').html("+");
            $('.second').hide();
            $content.parent().next().find('canvas')[0].getContext('2d').clearRect(0,0,100,800);
        }
    });
});
