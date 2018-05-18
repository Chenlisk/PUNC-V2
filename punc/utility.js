// -------------------------------------------------
var Port;
var OriText;
var ProText;
var PlainText;
var Reg = /[，。、：；？！“”‘’「」『』·…（）【】《》]/g;
var URL = "http://192.168.16.232:####/translator/translate";
var clipboard1, clipboard2;
var version = [
    { 'text': '版本1', 'port': '7786', 'title': '1.0.7786' },
    { 'text': '版本2', 'port': '7785', 'title': '1.0.7785' },
    { 'text': '版本3', 'port': '7784', 'title': '1.0.7784' },
    { 'text': '版本4', 'port': '7783', 'title': '1.0.7783' }];

var TestText = "如是我聞：一時，婆伽婆入於神通大光明藏，三昧正受，一切如來光嚴住持，是諸眾生清淨覺地；身心寂滅平等本際，圓滿十方不二隨順，於不二境現諸淨土。與大菩薩摩訶薩十萬人俱，其名曰文殊師利菩薩、普賢菩薩、普眼菩薩、金剛藏菩薩、彌勒菩薩、清淨慧菩薩、威德自在菩薩、辯音菩薩、淨諸業障菩薩、普覺菩薩、圓覺菩薩、賢善首菩薩等，而為上首；與諸眷屬皆入三昧，同住如來平等法會。\n\n\
舍利弗謂須菩提：「菩薩當云何行般若波羅蜜，得般若波羅蜜？」\n\n\
「舍利弗！於汝意云何？何故名為『一切諸佛所護念經』？舍利弗！若有善男子、善女人，聞是經受持者，及聞諸佛名者；是諸善男子、善女人，皆為一切諸佛共所護念，皆得不退轉於阿耨多羅三藐三菩提。是故舍利弗！汝等皆當信受我語及諸佛所說。\n\n\
《老子》曰：知其白，守其黑。又曰：歸根曰靜，靜曰復命是也。夫玄一者，提我元命真人也，但坐而守之，守之極靜，於至靜之中，圓光之內，忽見我之真形者，是玄一，得之守之，則不復去矣。（出自《道藏》）"

// -------------------------------------------------
$(document).ready(function () {
    // $("#card2").hide();
    // $("#btn3").hide();
    // // $("#btn4").hide();
    // $("#btn3").css("display", "");
    // $("#btn4").css("display", "");
    clipboard1 = new Clipboard('#btn2');
    clipboard2 = new Clipboard('#btn3');
    makeMune(version);

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

var makeMune = function (list) {
    for (var i = 0; i < list.length; i++) {
        var adata = list[i];
        var a = createE("a");
        a.className = "dropdown-item";
        a.title = adata.title;
        a.innerHTML = adata.text;
        a.dataset.port = adata.port;
        a.onclick = function (e) {
            // print(e.srcElement);
            select(e.srcElement);
        };
        $("#dropMenu").append(a);
    }
    $("#dropMenu").append('<div class="dropdown-divider"></div>');
    var a = createE("a");
    a.className = "dropdown-item";
    a.innerHTML = '全部版本';
    a.onclick = function (e) {
        select(e.srcElement);
    };
    $("#dropMenu").append(a);
}

var process = function () {
    // if ($("#btn1").text() != "发送") {
    //     ctoggle();
    //     $("#btn4").text("对比");
    //     return;
    // }

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
        $(e)[0].style.height = $(e)[0].scrollHeight + 'px';

        print($(e))
        var str = $(e).val();
    }
    else
        var str = $(e).text();
    pstr = repPunc(str, '');
    punc = str.replace(/[^，。、：；？！“”‘’「」『』·…（）【】《》]/g, '');
    // print(pstr);
    // print(punc);

    $(t).html("字数:" + str.length + "(" + pstr.length + "/" + punc.length + ")");
}

var select = function (e) {
    var t = e.text;
    if( t==="全部版本"){
        for(var i=0;i<version.length;i++){
            var p=version[i].port;
            Port = p;
            setTimeout(process, 100);
        }
        $('#btnGroupDrop1').text("选择标点版本");
    }
    else{
        var p = e.dataset.port;
        Port = p;
        $('#btnGroupDrop1').text(t);
        setTimeout(process, 100);
    }
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
    var newTxt = combine(PlainText, newMap);
    newTxt = spanner(newTxt);

    for (var i = 0; i < newMap.length; i++) {
        var tag = newMap[i].replace(/[^a-z]/g,'');
        var chr = newMap[i].replace(/[\n-~]/g,'');
        newTxt = newTxt.replace('<span class="word">' + chr + '<\/span>', '<span class="' + tag + '">' + chr + '<\/span>');
    }

    $("#result").html(newTxt);
    var note = '&ensp;<span class="ori">原始</span>&ensp;<span class="pro">已标点</span>';
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
    print(map+'');
    for (var i = 2; i < map.length; i++) {
        var a = map[i - 2];
        var b = map[i - 1];
        var c = map[i - 0];
        var chra = a.replace(/[^a-z]/g,'');
        var chrb = b.replace(/[^a-z]/g,'');
        var chrc = c.replace(/[^a-z]/g,'');

        if (chra != chrb && parseInt(a) == parseInt(b)) {
            if (a[19] === b[19]) {
                a = a.replace('ori', 'sam').replace('pro', 'sam');
                b = ' ';
            }
        }
        if (chra != chrc && parseInt(a) == parseInt(c)) {
            if (a[19] === c[19]) {
                a = a.replace('ori', 'sam').replace('pro', 'sam');
                c = '9999';   
            }
        }
        if (chrb != chrc && parseInt(b) == parseInt(c)) {
            if (b[19] === c[19]) {
                b = b.replace('ori', 'sam').replace('pro', 'sam');
                c = '9999';
            }
        }
        map[i - 2] = a;
        map[i - 1] = b;
        map[i - 0] = c; 
    }
    map = map.sort();
    var loca=map.indexOf('9999');
    if (loca!=-1)
        map=map.slice(0,loca);
    print(map);
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
        map.push(index + '-'+ mark + justify(num, 4) + '-' + val );
        num++;
    }
    print(map);
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
        str = str.slice(0, index) + map[i].charAt(map[i].length - 1) + str.slice(index);
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
    // if ($("#btn1").text() == "发送")
    //     $("#btn1").text("返回");
    // else
    //     $("#btn1").text("发送");

    // $("#btn2").toggle();
    // $("#btn3").toggle();
    // $("#btn4").toggle();
    // $("#card1").toggle();
    // $("#card2").toggle();
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
    for (var i = 0; i < lis.length; i++) {
        var Div = createE("div");

        var title = createE("span");
        title.className = 'title';
        title.innerHTML = lis[i].p;

        var data = createE("span");
        data.className = 'data';

        var progress = createE("div");
        progress.className = 'progress';

        var progressbar = createE("div");
        progressbar.className = 'progress-bar';
        progressbar.style = "width:" + lis[i].v;
        progressbar.innerHTML = lis[i].v;

        progress.appendChild(progressbar);
        data.appendChild(progress);

        Div.appendChild(title);
        Div.appendChild(data);
        $('#tooltip').append(Div);
    }
}

var createE = function (e) {
    return document.createElement(e);
}

var print=function (param) {  
    console.log(param);
}
