// ----------------------------------------------------Globle
var PlainText;
var Reg1 = /[，。、：；？！·…—“”‘’「」『』（）【】《》]/g;
var Reg2 = /[^，。、：；？！·…—“”‘’「」『』（）【】《》]/g;
var URL = "http://192.168.16.232:####/translator/translate";

var version = [
    { 'text': '版本1（V1）', 'port': '7786', 'title': '1.0.7786' },
    { 'text': '版本2（V2）', 'port': '7785', 'title': '1.0.7785' },
    { 'text': '版本3（V3）', 'port': '7784', 'title': '1.0.7784' },
    { 'text': '版本4（V4）', 'port': '7783', 'title': '1.0.7783' }];

var TestText = "如是我聞：一時，婆伽婆入於神通大光明藏，三昧正受，一切如來光嚴住持，是諸眾生清淨覺地；身心寂滅平等本際，圓滿十方不二隨順，於不二境現諸淨土。與大菩薩摩訶薩十萬人俱，其名曰文殊師利菩薩、普賢菩薩、普眼菩薩、金剛藏菩薩、彌勒菩薩、清淨慧菩薩、威德自在菩薩、辯音菩薩、淨諸業障菩薩、普覺菩薩、圓覺菩薩、賢善首菩薩等，而為上首；與諸眷屬皆入三昧，同住如來平等法會。\n\n\
舍利弗謂須菩提：「菩薩當云何行般若波羅蜜，得般若波羅蜜？」\n\n\
「舍利弗！於汝意云何？何故名為『一切諸佛所護念經』？舍利弗！若有善男子、善女人，聞是經受持者，及聞諸佛名者；是諸善男子、善女人，皆為一切諸佛共所護念，皆得不退轉於阿耨多羅三藐三菩提。是故舍利弗！汝等皆當信受我語及諸佛所說。\n\n\
《老子》曰：知其白，守其黑。又曰：歸根3333曰靜，靜曰666復命是也。夫玄一者，提我元命真人也，但——坐而守之，守之極靜，於至靜之中，圓光之內，忽見我之真形者，是玄一，得之守之，則不復去矣。（出自《道藏》）"

// ----------------------------------------------------System
$(document).ready(function () {
    TabIndex = 0;

    makeMune(version);
    clipboard1 = new Clipboard('#copy01');
    clipboard2 = new Clipboard('#copy02');
    clipboard3 = new Clipboard('#copy03');

    $("#result000").keyup(function () {
        check("#result000", '#tip000');
    });

    $("#result000").mouseup(function () {
        check("#result000", '#tip000');
    });

    $('#result000').val(TestText);
    check("#result000", '#tip000');

    $('#tablink000').click();
    TabRecord.push(["V0", 0, ""]);
})

var makeMune = function (list) {
    var dpmenu = $("#dropMenu");
    for (var i = 0; i < list.length; i++) {
        var adata = list[i];
        var a = createE("a");
        a.className = "dropdown-item";
        a.title = adata.title;
        a.innerHTML = adata.text;
        a.dataset.port = adata.port;
        a.onclick = function (e) {
            select(e.srcElement);
        };
        // a.onclick=select(this);
        dpmenu.append(a);
    }
    dpmenu.append('<div class="dropdown-divider"></div>');
    var a = createE("a");
    a.className = "dropdown-item";
    a.innerHTML = '全部版本';
    a.onclick = function (e) {
        select(e.srcElement);
    };
    dpmenu.append(a);
}

// ----------------------------------------------------Board
var TabRecord = [];
var TbandTbRecord = [];
var Pool = [];
var process = function () {
    if (Pool.length == 0) {//jump
        $('#tablink' + justify(TabIndex, 3)).click();
        return;
    }

    var txt = $("#result000").val();
    if (txt == "")
        return;

    var ver = Pool[0].ver;
    var port = Pool[0].port;

    for (var i = 0; i < TabRecord.length; i++) {//no repeat
        if (TabRecord[i][0] === ver) {
            Pool = Pool.slice(1);
            if (Pool.length == 0)
                $('#tablink' + justify(TabRecord[i][1], 3)).click();
            else
                setTimeout(process, 100);
            return;
        }
    }

    var dic = new Array();
    var newText = new Array();
    var txtList = txt.split("\n\n");
    for (var i = 0; i < txtList.length; i++) {
        var str = txtList[i];
        str = str.replace(/(\n| |　|\d)/g, '');
        if (str != "") {
            mstr = repPunc(str, '');
            if (mstr != '')
                dic.push({ "src": mstr });
            newText.push(mstr);
            txtList[i] = str;
        }
    }

    PlainText = newText.join('\n\n');
    var otxt = txtList.join('\n\n');
    $("#result000").val(otxt);
    check("#result000", '#tip000');
    TabRecord[0][2]=$("#result000").val();

    addResultTab(ver, ++TabIndex, "", "&nbsp;");
    TabRecord.push([ver, TabIndex, ""]);

    if (dic.length != 0)
        postText(dic, port, TabIndex);
    Pool = Pool.slice(1);
    setTimeout(process, 100);
}

var check = function (e, t) {
    if ('#result000' == e) {
        $(e)[0].style.height = 'auto';
        $(e)[0].style.height = $(e)[0].scrollHeight + 'px';
        var str = $(e).val();
    }
    else
        var str = $(e).text();
    pstr = repPunc(str, '');
    punc = str.replace(Reg2, '');

    $(t).html("字数:" + str.length + "(" + pstr.length + "/" + punc.length + ")");
}

var select = function (e) {
    var t = e.text;
    if (t === "全部版本") {
        for (var i = 0; i < version.length; i++) {
            var p = version[i].port;
            var v = version[i].text.replace(/(.*（|）.*)/g, '');
            Pool.push({ 'port': p, 'ver': v });
        }
    }
    else {
        var p = e.dataset.port;
        var v = e.innerHTML.replace(/(.*（|）.*)/g, '');
        Pool.push({ 'port': p, 'ver': v });
    }
    setTimeout(process(), 100);
}

var compare = function (e) {
    if (TabRecord.length < 3)
        setCompare(TabRecord[0][0], TabRecord[1][0]);
    else {
        addSelectItem(TabRecord);
    }
}

var setCompare = function (ver1, ver2) {//Ver1 < Ver2
    var ver = ver1 + " & " + ver2;
    for (var i = 0; i < TbandTbRecord.length; i++) {
        if (TbandTbRecord[i][0] === ver) {
            setTimeout(function () { $("#tablink" + justify(TbandTbRecord[i][1], 3)).click(); }, 100);
            return;
        }
    }

    var otxt, ptxt;
    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i][0] === ver1) {
            var id = "#result" + justify(TabRecord[i][1], 3);
            otxt = TabRecord[i][2];
        } else if (TabRecord[i][0] === ver2) {
            var id = "#result" + justify(TabRecord[i][1], 3);
            ptxt = TabRecord[i][2];
        }
    }

    print(otxt);
    print(ptxt);

    var oriMap = pcMap(otxt, 'ori');
    var proMap = pcMap(ptxt, 'pro');
    var newMap = oriMap.concat(proMap);

    newMap = mapProcess(newMap);
    var newTxt = combine(PlainText, newMap);
    newTxt = spanner(newTxt);

    for (var i = 0; i < newMap.length; i++) {
        var tag = newMap[i].replace(/[^a-z]/g, '');
        var chr = newMap[i].replace(/[\n-~]/g, '');
        newTxt = newTxt.replace('<span class="word">' + chr + '<\/span>', '<span class="' + tag + '">' + chr + '<\/span>');
    }


    var note = '&ensp;<span class="ori">原始</span>&ensp;<span class="pro">已标点</span>';
    addCompareTab(ver, ++TabIndex, newTxt, note);
    TbandTbRecord.push([ver, TabIndex]);

    setTimeout(function () { $("#tablink" + justify(TabIndex, 3)).click(); }, 100);
}

var clearTxt = function (e) {
    var id=e.dataset.target;
    $(id).val("");
    check("#result000", '#tip000');
}

var copyTxt=function (e) {  
    var id=e.dataset.target;
    alert(id);
}

// ----------------------------------------------------SubProcess
var mapProcess = function (map) {
    map = map.sort();
    print(map + '');
    for (var i = 2; i < map.length; i++) {
        var a = map[i - 2];
        var b = map[i - 1];
        var c = map[i - 0];
        var chra = a.replace(/[^a-z]/g, '');
        var chrb = b.replace(/[^a-z]/g, '');
        var chrc = c.replace(/[^a-z]/g, '');

        if (chra != chrb && parseInt(a) == parseInt(b)) {
            if (a[19] === b[19]) {
                a = a.replace('ori', 'sam').replace('pro', 'sam');
                b = '9999';
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
    var loca = map.indexOf('9999');
    if (loca != -1)
        map = map.slice(0, loca);
    print(map);
    return map;
}

var pcMap = function (str, mark) {
    var num = 1;
    var map = [];
    var std = str.replace(Reg1, '#');
    while (std.indexOf('#') != -1) {
        var index = std.indexOf('#');
        var val = str[index];
        std = std.replace('#', '');
        str = str.slice(0, index) + str.slice(index + 1);
        index = justify(index, 10);
        map.push(index + '-' + mark + justify(num, 4) + '-' + val);
        num++;
    }
    print(map);
    return map;
}

var combine = function (str, map) {
    map = map.reverse();
    for (var i = 0; i < map.length; i++) {
        var index = parseInt(map[i]);
        str = str.slice(0, index) + map[i].replace(/[\n-~]/g, '') + str.slice(index);
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

var postText = function (txtlis, prt, tabindex) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.tabindex = tabindex;

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var str = xhr.responseText;
            str = eval(str);
            var newTxt = "";
            for (var i = 0; i < str.length; i++) {
                newTxt += str[i].pred + '\n\n';
            }
            var ptxt = newTxt.slice(0, -2);
            setResult(ptxt, xhr.tabindex);
        }
    }

    prt = URL.replace('####', prt)
    xhr.open("POST", prt, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var data = JSON.stringify(txtlis);
    xhr.send(data);
}

var setResult = function (txt, index) {
    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i][1] == index)
            TabRecord[i][2] = txt;
    }
    var newTxt = spanner(txt);

    var punMap = pcMap(txt, 'pun');
    for (var i = 0; i < punMap.length; i++) {
        var tag = punMap[i].replace(/[^a-z]/g, '');
        var chr = punMap[i].replace(/[\n-~]/g, '');
        newTxt = newTxt.replace('<span class="word">' + chr + '<\/span>', '<span class="' + tag + '">' + chr + '<\/span>');
    }
    index = justify(index, 3);
    $("#result" + index).html(newTxt);
    check("#result" + index, '#tip' + index);
}

var spanner = function (txt) {
    var ls = txt.split('');
    txt = ''
    for (var i = 0; i < ls.length; i++) {
        txt += addtag(ls[i], 'span', 'word');
    }
    txt = txt.replace(/<span class="word">\n<\/span>/g, '<br>');
    setTimeout(showTooltip(), 100);
    return txt
}

var comparePro = function () {
    if (selectCMPItem.state) {
        setCompare(selectCMPItem.v1, selectCMPItem.v2);
        selectCMPItem = { 'state': false, 'v1': '', 'v2': '' };
    }
}

var selectCMPItem = { 'state': false, 'v1': '', 'v2': '' };
var checkRadio = function () {
    var result = $("input[name='version']:checked");
    if (result.length === 2) {
        $('#OKbtn').attr("disabled", true);
        var ver1 = result[0].value;
        var ver2 = result[1].value;
        if (ver1 != ver2) {
            $('#OKbtn').attr("disabled", false);
            var va = justify(ver1.slice(1), 3);
            var vb = justify(ver2.slice(1), 3);
            va < vb ? "" : ver1 = [ver2, ver2 = ver1][0];//exchange
            selectCMPItem = { 'state': true, 'v1': ver1, 'v2': ver2 };
        }
    }
}

var addSelectItem = function (list) {
    var form1 = makeForm(list, 'form1');
    var form2 = makeForm(list, 'form2');

    $('#radioGroup').empty();
    $('#radioGroup').append(form1);
    $('#radioGroup').append(form2);

    $('#OKbtn').attr("disabled", true);

    setTimeout(function () { $("#modal").click(); }, 100);
}

var makeForm = function (list, id) {
    var form = createE("form");
    form.id = id;
    form.className = "col-sm";

    var ul = createE("ul");
    ul.className = "list-group border";

    for (var i = 0; i < list.length; i++) {
        var li = createE("li");
        li.className = "dropdown-item";
        li.onclick = function () {
            this.children[0].checked = true;
            checkRadio();
        };

        var input = createE("input");
        input.type = "radio";
        input.name = "version";
        input.value = list[i][0];
        input.onclick = function () {
            checkRadio();
        };

        var span = createE("span");
        span.innerHTML = input.value;

        li.appendChild(input);
        li.appendChild(span);
        ul.appendChild(li);
    }
    form.appendChild(ul);
    return form;
}

var TabIndex;
var addResultTab = function (ver, index, content, note) {
    addLink(ver, index);

    var docker = createE("span");
    docker.className = "docker";

    var copy = createE("button");
    copy.id = "copy" + justify(index, 3);
    copy.className = "btn btn-outline-warning";
    copy.dataset.target = "#result" + justify(index, 3);
    copy.innerHTML = "复制";
    copy.onclick=function () {
        copyTxt(this);
    }

    var comp = createE("button");
    comp.className = "btn btn-outline-danger";
    comp.innerHTML = "对比";

    comp.onclick = function (e) {
        compare(this);
    };

    var vol = createE("div");
    vol.id = "result" + justify(index, 3);
    vol.className = "Result";
    vol.innerHTML = content;

    docker.appendChild(copy);
    docker.appendChild(comp);

    addTab(index, "标点结果", docker, vol, note);
}

var addCompareTab = function (ver, index, content, note) {
    addLink(ver, index);

    var docker = createE("span");
    docker.className = "docker";

    var copy = createE("button");
    copy.id = "copy" + justify(index, 3);
    copy.className = "btn btn-outline-warning";
    copy.dataset.target = "#compare" + justify(index, 3);
    copy.innerHTML = "复制";
    copy.onclick=function () {
        copyTxt(this);
    }

    var vol = createE("div");
    vol.id = "compare" + justify(index, 3);
    vol.className = "Compare";
    vol.innerHTML = content;

    docker.appendChild(copy);

    addTab(index, "对比结果", docker, vol, note);
}

var addLink = function (ver, index) {
    var newlink = createE("li");
    newlink.className = "nav-item";
    newlink.draggable="true";

    var a = createE("a");
    a.id = 'tablink' + justify(index, 3);
    a.className = "nav-link";
    a.dataset.toggle = "tab";
    a.href = "#tab" + justify(index, 3);
    a.innerHTML = ver + " ";
    a.ondblclick = function (e) {
        closeLink(e);
    }

    // var span = createE("span");//----------------------------------------------
    // span.className = "tabclose";
    // span.innerHTML = "&times;";
    // span.index = index;
    // span.onclick = function (e) {
    //     e.stopPropagation();//阻止冒泡
    //     alert(e.target.index);
    // }
    // a.appendChild(span);//----------------------------------------------

    newlink.appendChild(a);
    $('#tabTitle').append(newlink);
}

var addTab = function (index, title, docker, vol, note) {
    var newtab = createE("div");
    newtab.id = "tab" + justify(index, 3);
    newtab.className = "tab-pane fade container-fluid";

    var card = createE("div");
    card.className = "card";

    var cardHeader = createE("div");
    cardHeader.className = "card-header";

    var cardTitle = createE("span");
    cardTitle.className = "cardTitle";
    cardTitle.innerHTML = title;

    var cardBody = createE("div");
    cardBody.className = "card-body";

    var tip = createE("p");
    tip.id = "tip" + justify(index, 3);
    tip.className = "tips";
    tip.innerHTML = note;

    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(docker);

    cardBody.appendChild(vol);
    cardBody.appendChild(tip);

    card.appendChild(cardHeader);
    card.appendChild(cardBody);

    newtab.appendChild(card);
    $('#tabContent').append(newtab);
}

var closeLink=function (e) {  
    var link = '#' + e.target.id;
    var tab = e.target.hash;
    var ver = e.target.text.trim();

    $(link).remove();
    $(tab).remove();

    var max1 = 0, max2 = 0;
    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i][0] == ver)
            TabRecord[i] = "";
        else if (TabRecord[i][1] > max1)
            max1 = TabRecord[i][1];
    }
    if (TabRecord.indexOf("") != -1)
        TabRecord.splice(TabRecord.indexOf(""), 1);

    for (var i = 0; i < TbandTbRecord.length; i++) {
        if (TbandTbRecord[i][0] == ver)
            TbandTbRecord[i] = "";
        else if (TbandTbRecord[i][1] > max2)
            max2 = TbandTbRecord[i][1];
    }
    if (TbandTbRecord.indexOf("") != -1)
        TbandTbRecord.splice(TbandTbRecord.indexOf(""), 1);

    var id = max1 > max2 ? max1 : max2;
    id = "#tablink" + justify(id, 3);
    $(id).click();
}

// ----------------------------------------------------Basic
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

var justify = function (num, len) {
    var l = len;
    while (l != 0) {
        num = '0' + num;
        l--;
    }
    num = num.slice(-len);
    return num;
}

var print = function (param) {
    console.log(param);
}
// ----------------------------------------------------End