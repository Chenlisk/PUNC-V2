// -------------------------------------------------
var Port;
var OriText;
var ProText;
var PlainText;
var Reg = /[，。、：；？！“”‘’「」『』·…（）【】《》]/g;
var URL = "http://192.168.16.232:####/translator/translate";
var clipboard1, clipboard2;
var TestText="如是我聞：一時，婆伽婆入於神通大光明藏，三昧正受，一切如來光嚴住持，是諸眾生清淨覺地；身心寂滅平等本際，圓滿十方不二隨順，於不二境現諸淨土。與大菩薩摩訶薩十萬人俱，其名曰文殊師利菩薩、普賢菩薩、普眼菩薩、金剛藏菩薩、彌勒菩薩、清淨慧菩薩、威德自在菩薩、辯音菩薩、淨諸業障菩薩、普覺菩薩、圓覺菩薩、賢善首菩薩等，而為上首；與諸眷屬皆入三昧，同住如來平等法會。\n\n於是文殊師利菩薩在大眾中即從座起，頂禮佛足右遶三匝，長跪叉手而白佛言：「大悲世尊！願為此會諸來法眾，說於如來本起清淨因地法行，及說菩薩於大乘中發清淨心，遠離諸病，能使未來末世眾生求大乘者不墮邪見。」作是語已五體投地，如是三請終而復始。\n\n爾時，世尊告文殊師利菩薩言：「善哉！善哉！善男子！汝等乃能為諸菩薩諮詢如來因地法行，及為末世一切眾生求大乘者，得正住持不墮邪見。汝今諦聽！當為汝說。」時，文殊師利菩薩奉教歡喜，及諸大眾默然而聽。"

// -------------------------------------------------
$(document).ready(function () {
    $("#card2").hide();
    $("#btn3").hide();
    $("#btn4").hide();
    $("#btn3").css("display", "");
    $("#btn4").css("display", "");
    clipboard1 = new Clipboard('#btn2');
    clipboard2 = new Clipboard('#btn3');
    Port = $('#btnGroupDrop1')[0].dataset.port;

    $("#sendText").keyup(function () {
        check("#sendText", '#tip1');
    });
    $("#sendText").mouseup(function () {
        check("#sendText", '#tip1');
    });
    $('#tooltip').hide();

    $('#sendText').val(TestText);

    check("#sendText", '#tip1');
})

var process = function () {
    if ($("#btn1").text() != "发送") {
        ctoggle();
        $("#btn4").text("对比");
        return;
    }

    var txt = $("#sendText").val();
    if (txt == "")
        return;

    var dic = new Array();
    var newText = new Array();
    var txtList = txt.split("\n\n");
    for (var i = 0; i < txtList.length; i++) {
        var str = txtList[i];
        str = str.replace(/(\n| |　)/g, '');
        if (str != "") {
            mstr = repPunc(str, '');
            if (mstr != '')
                dic.push({ "src": mstr });
            newText.push(mstr);
            txtList[i] = str;
        }
    }

    PlainText = newText.join('\n\n');
    OriText = txtList.join('\n\n');
    $("#sendText").val(OriText);
    check("#sendText", '#tip1');

    if (dic.length != 0)
        postText(dic, Port);
}

var check = function (e, t) {
    if ('#sendText' == e) {
        $(e)[0].style.height = 'auto';
        // $(e)[0].style.eight = '100px';
        $(e)[0].style.height = $(e)[0].scrollHeight + 'px';
        // $(e)[0].style.scrollHeight = $(e)[0].scrollHeight + 'px';
        console.log($(e))
        var str = $(e).val();
        // $("#sendText").val(OriText);
        // if (str == '')
        //     return;
    }
    else
        var str = $(e).text();
    pstr = repPunc(str, '');
    punc = str.replace(/[^，。、：；？！“”‘’「」『』·…（）【】《》]/g, '');
    // console.log(pstr);
    // console.log(punc);

    $(t).html("字数:" + str.length + "(" + pstr.length + "/" + punc.length + ")");
}

var select = function (e) {
    var p = e.dataset.port;
    var t = e.text;
    Port = p;
    $('#btnGroupDrop1').text(t);
    console.log($('#btnGroupDrop1'));
    $('#btnGroupDrop1')[0].dataset.port = p;
}

var compare = function () {
    if ($("#btn4").text() == "对比")
        $("#btn4").text("取消");
    else {
        $("#btn4").text("对比");
        setResult();
        return;
    }

    var oriMap = pcMap(OriText, 'ori');
    var proMap = pcMap(ProText, 'pro');
    var newMap = oriMap.concat(proMap);

    newMap = mapProcess(newMap);
    // console.log(newMap);
    var newTxt = combine(PlainText, newMap);
    newTxt = spanner(newTxt);

    for (var i = 0; i < newMap.length; i++) {
        var chr = newMap[i].slice(-4, -3);
        var tag = newMap[i].slice(-3);
        newTxt = newTxt.replace('<span class="word">' + chr + '<\/span>', '<span class="' + tag + '">' + chr + '<\/span>');
    }

    $("#result").html(newTxt);
    var note = '&ensp;<span class="ori">原始文本</span>&ensp;<span class="pro">已标点文本</span>';
    $("#tip2").html($("#tip2").html() + note);
}

var clearAll = function () {
    $("#sendText").val("");
    OriText = '';
    ProText = '';
    PlainText = '';
    check("#sendText", '#tip1');
}
// -------------------------------------------------
var mapProcess = function (map) {
    map = map.sort();
    // map = map.reverse();
    for (var i = 0; i < map.length; i++) {
        
        var a = map[i];
        var b = map[i + 1];
        var c = map[i + 2];
        if (parseInt(a) == parseInt(b)) {
            if (a[16] === b[16]) {
                a = a.replace('ori', 'sam').replace('pro', 'sam');
                b = '9999';
                map[i]=a;
                map[i + 1]=b;
                map = map.sort();
                map.pop();                
            }
        }
        if (parseInt(a) == parseInt(c)) {
            if (a[16] === c[16]) {
                a = a.replace('ori', 'sam').replace('pro', 'sam');
                c = '9999';
                map[i]=a;
                map[i + 2]=c;
                map = map.sort();
                map.pop();                
            }
        }
        if (parseInt(b) == parseInt(c)) {
            if (b[16] === c[16]) {
                b = b.replace('ori', 'sam').replace('pro', 'sam');
                c = '9999';
                map[i + 1]=b;
                map[i + 2]=c;
                map = map.sort();
                map.pop();                
            }
        }
    }

    console.log(map);
    return map;
}

var pcMap = function (str, mark) {
    var num = 1;
    var map = [];
    var std = str.replace(Reg, '#');
    while (std.indexOf('#') != -1) {
        var index = std.indexOf('#');
        var val = str[index];
        std = std.replace('#', '');
        str = str.slice(0, index) + str.slice(index + 1);
        index = justify(index, 10);
        map.push(index + '-' + justify(num, 4) + '-' + val + mark);
        num++;
    }
    console.log(map);
    return map;
}

var justify = function (num, len) {
    var l = len;
    while (l != 0) {
        num = '0' + num;
        l--;
    }
    num = num.slice(-len);
    return num;
}

var combine = function (str, map) {
    map = map.reverse();
    for (var i = 0; i < map.length; i++) {
        var index = parseInt(map[i]);
        str = str.slice(0, index) + map[i].charAt(map[i].length - 4) + str.slice(index);
    }
    map = map.reverse();
    return str;
}

var repPunc = function (s, r) {
    s = s.replace(/([\n-']|[*-Z]|[\^-~])/g, r);
    s = s.replace(/[　-〟]/g, r);
    s = s.replace(/[‐-ⁿ]/g, r);
    s = s.replace(/[！-･]/g, r);
    s = s.replace(/(（）|〔〕|\(\)|\[\]|\\|·|￥)/g, r);
    return s;
}

var postText = function (txtlis, prt) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var str = xhr.responseText;
            str = str.substring(3, str.length - 3);
            var newTxt = str.split('"], ["');
            newTxt = newTxt.join('\n\n');
            ProText = newTxt;
            setResult();
            ctoggle();
        }
    }

    prt = URL.replace('####', prt)
    xhr.open("POST", prt, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var data = JSON.stringify(txtlis);
    xhr.send(data);
}

var setResult = function () {
    var newTxt = spanner(ProText);

    var punMap = pcMap(ProText, 'pun');
    for (var i = 0; i < punMap.length; i++) {
        var chr = punMap[i].slice(-4, -3);
        var tag = punMap[i].slice(-3);
        newTxt = newTxt.replace('<span class="word">' + chr + '<\/span>', '<span class="' + tag + '">' + chr + '<\/span>');
    }

    $("#result").html(newTxt);
    check("#result", '#tip2');
}

var ctoggle = function () {
    if ($("#btn1").text() == "发送")
        $("#btn1").text("返回");
    else
        $("#btn1").text("发送");

    $("#btn2").toggle();
    $("#btn3").toggle();
    $("#btn4").toggle();
    $("#card1").toggle();
    $("#card2").toggle();
}

var spanner = function (txt) {
    var ls = txt.split('');
    txt = ''
    for (var i = 0; i < ls.length; i++) {
        txt += addtag(ls[i], 'span', 'word');
    }
    txt = txt.replace(/<span class="word">\n<\/span>/g, '<br>');
    setTimeout(() => {
        showTooltip();
    }, 100);
    return txt
}

var addtag = function (str, tg, classname) {
    return '<' + tg + ' class="' + classname + '">' + str + '</' + tg + '>';
}

var showTooltip = function () {
    $(".word").click(function (e) {
        e.stopPropagation();//阻止冒泡
        var list = [
            { 'p': '？', 'v': '79%' },
            { 'p': '。', 'v': '18%' },
            { 'p': '！', 'v': '0.9%' }];
        $('#tooltip').empty();
        setTooltip(list);

        var x = e.originalEvent.pageX + 15;
        var y = e.originalEvent.pageY - 80 - 160;
        var max_X = $(document)[0].body.clientWidth - 180;
        x = x < 0 ? '0' : x;
        x = x > max_X ? max_X : x;
        y = y < -20 ? -20 : y;
        $("#tooltip").css({ "top": y + "px", "left": x + "px" });
        $('#tooltip').fadeIn();
    });
    $(document).click(function (e) {
        $('#tooltip').fadeOut();        
    });
}

var setTooltip = function (lis) {     
    $('#tooltip').append("<p id='tooltitle'>比例</p>");
    for (var i=0;i<lis.length;i++){
        var Div=document.createElement("div");

        var title=document.createElement("span");
        title.className='title';
        title.innerHTML=lis[i].p;
        
        var data=document.createElement("span");
        data.className='data';

        var progress=document.createElement("div");
        progress.className='progress';

        var progressbar=document.createElement("div");
        progressbar.className='progress-bar';
        progressbar.style="width:"+lis[i].v;
        progressbar.innerHTML=lis[i].v;

        progress.appendChild(progressbar);
        data.appendChild(progress);

        Div.appendChild(title);
        Div.appendChild(data);
        $('#tooltip').append(Div);
    }   
}

