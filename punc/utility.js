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

    $("#result000").keyup(function () {
        check("#result000");
    });

    $("#result000").mouseup(function () {
        check("#result000");
    });

    $(document).ready(function () {
        $('[data-toggle="popover"]').popover();
    });

    $('#result000').val(TestText);
    check("#result000");

    $('#tablink000').click();
    TabRecord.push({
        ver: 'V0',
        index: 0,
        linkid: "#tablink000",
        tabid: "#result000",
        text: "",
        response: ""
    });
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
            selectItem(e.srcElement);
        };
        dpmenu.append(a);
    }
    dpmenu.append('<div class="dropdown-divider"></div>');
    var a = createE("a");
    a.className = "dropdown-item";
    a.innerHTML = '全部版本';
    a.onclick = function (e) {
        selectItem(e.srcElement);
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
    if (txt === "") return;

    var ver = Pool[0].ver;
    var port = Pool[0].port;

    var dic = new Array();
    var newText = new Array();
    var txtList = txt.split("\n\n");
    for (var i = 0; i < txtList.length; i++) {
        txtList[i] = txtList[i].replace(/(\n| |　|\d)/g, '');
        var str = txtList[i];
        if (str != "") {
            var mstr = repPunc(str, '');
            if (mstr != '') {
                dic.push({ "src": mstr });
                newText.push(mstr);
                txtList[i] = str;
            }
        }
    }

    var otxt = '#'+txtList.join('\n\n')+'@';
    otxt=otxt.replace(/(\n\n\n+)/g, '\n\n');
    otxt=otxt.replace(/#\n{0,}/g, '');
    otxt=otxt.replace(/\n{0,}@/g, '');

    var sameTab = false;
    for (var i = 0; i < TabRecord.length; i++) {//no repeat
        if (TabRecord[i].ver === ver) {
            Pool = Pool.slice(1);

            if (otxt != TabRecord[0].text) {
                sameTab = true;
                break;
            }

            if (Pool.length == 0)
                $('#tablink' + justify(TabRecord[i].index, 3)).click();
            else
                setTimeout(process, 100);
            return;
        }
    }

    PlainText = newText.join('\n\n');

    $("#result000").val(otxt);
    check("#result000");
    TabRecord[0].text = $("#result000").val();

    if (!sameTab) {
        addResultTab(ver, ++TabIndex, "", "&nbsp;");

        TabRecord.push({
            ver: ver,
            index: TabIndex,
            linkid: "#tablink" + justify(TabIndex, 3),
            tabid: "#result" + justify(TabIndex, 3),
            text: "",
            response: ""
        });
    }

    if (dic.length != 0)
        postText(dic, port, TabIndex);
    Pool = Pool.slice(1);
    setTimeout(process, 100);
}

var check = function (e) {
    if ('#result000' == e) {
        $(e)[0].style.height = 'auto';
        $(e)[0].style.height = $(e)[0].scrollHeight + 'px';
        var str = $(e).val();
    }
    else
        var str = $(e).text();
    pstr = repPunc(str, '');
    punc = str.replace(Reg2, '');

    var tip = e.replace('result', 'tip');
    var str = "字数:" + str.length + "(" + pstr.length + "/" + punc.length + ")";

    var list = $(e + '>span');
    var warn = 0, edit = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i].dataset.state === 'warn')
            ++warn;
        else if (list[i].dataset.state === 'edit')
            ++edit;
    }

    if (warn != 0) {
        str += ' ' + addtag('span', '警告', '', '', 'warn').outerHTML;
        str += ':' + warn;
    }

    if (edit != 0) {
        str += ' ' + addtag('span', '修改', '', '', 'edit').outerHTML;
        str += ':' + edit;
    }

    $(tip).html(str);
}

var selectItem = function (e) {
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
    setTimeout(process, 100);
}

var compare = function (e) {
    if (TabRecord.length < 3)
        setCompare(TabRecord[0].ver, TabRecord[1].ver);
    else {
        addSelectItem(TabRecord);
    }
}

var setCompare = function (ver1, ver2) {//Ver1 < Ver2
    var ver = ver1 + " & " + ver2;
    for (var i = 0; i < TbandTbRecord.length; i++) {
        if (TbandTbRecord[i].ver === ver) {
            setTimeout(function () {
                $(TbandTbRecord[i].linkid).click();
            }, 100);
            return;
        }
    }

    var otxt, ptxt;
    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i].ver === ver1) {
            otxt = TabRecord[i].text;
        } else if (TabRecord[i].ver === ver2) {
            ptxt = TabRecord[i].text;
        }
    }

    print(otxt);
    print(ptxt);

    var oriMap = pcMap(otxt, 'ori');
    var proMap = pcMap(ptxt, 'pro');
    var newMap = oriMap.concat(proMap);

    newMap = mapProcess(newMap);
    var newTxt = combine(PlainText, newMap);
    var newHtml = addSpan(newTxt);

    for (var i = 0; i < newMap.length; i++) {
        var tag = newMap[i].replace(/[^a-z]/g, '');
        var chr = newMap[i].replace(/[\n-~]/g, '');
        newHtml = newHtml.replace('<span class="word">' + chr + '<\/span>', '<span class="' + tag + '">' + chr + '<\/span>');
    }

    var note = '&ensp;<span class="ori">原始</span>&ensp;<span class="pro">已标点</span>';
    addCompareTab(ver, ++TabIndex, newHtml, note);
    TbandTbRecord.push({
        ver: ver,
        index: TabIndex,
        linkid: "#tablink" + justify(TabIndex, 3),
        tabid: "#compare" + justify(TabIndex, 3),
        text: newTxt
    });


    setTimeout(function () {
        $("#tablink" + justify(TabIndex, 3)).click();
    }, 100);
}

var clearTxt = function (e) {
    var id = e.dataset.target;
    $(id).val("");
    check("#result000");
}

var copyTxt = function (e) {
    var id = e.dataset.target;
    var txt = '';
    if (id === "#result000") {
        txt = $(id).val();
    }
    else if (id.search("result") != -1) {
        txt = $(id).html();
        txt = txt.replace(/<\/?s.+?>/g, '');
        txt = txt.replace(/[ ]/g, '');
        txt = txt.replace(/<br>/g, '\n');
    }
    else if (id.search("compare") != -1) {
        txt = $(id).html();
        txt = txt.replace(/<span class="word">/g, '');
        txt = txt.replace(/<span class=/g, '@<');
        txt = txt.replace(/<\/span>/g, '');
        txt = txt.replace(/<br>/g, '\n');
        txt = txt.replace(/@<"ori">/g, '@A');
        txt = txt.replace(/@<"pro">/g, '@B');
        txt = txt.replace(/@<"sam">/g, '');

        txt = txt.replace(/@[AB]./g, '#');

        var temp = txt.match(/@[AB]./g)
        for (let i = 0; i < temp.length; i++) {
            var newTg = temp[i].replace('@', '#');
            txt = txt.replace(temp[i], newTg + '$');
        }

        txt = txt.replace(/\$#B/g, '|');
        txt = txt.replace(/\$#A/g, '');

        temp = txt.match(/#[AB].\$/g)
        for (let i = 0; i < temp.length; i++) {
            var newTg = temp[i];
            if (newTg.indexOf('A') != -1)
                newTg = newTg.replace(/#A/, '{').replace(/\$/, '|}');
            else if (newTg.indexOf('B') != -1)
                newTg = newTg.replace(/#B/, '{|').replace(/\$/, '}');
            txt = txt.replace(temp[i], newTg);
        }
        txt = txt.replace(/#A/g, '{');//#A「$  -> {A|}
        txt = txt.replace(/\$/g, '}');//#B，$  -> {|B}
    }

    $("#clipArea").val(txt);
    $("#clipArea").select();
    document.execCommand("Copy");
    $("#alertTool").fadeIn();
    setTimeout(() => {
        $("#alertTool").fadeOut(1000);
    }, 800);
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

            for (var i = 0; i < TabRecord.length; i++) {
                if (TabRecord[i].index === tabindex)
                    TabRecord[i].response = str;
            }
            setResult(str, xhr.tabindex);
        }
    }

    prt = URL.replace('####', prt)
    xhr.open("POST", prt, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var data = JSON.stringify(txtlis);
    xhr.send(data);
}

var setResult = function (objary, index) {
    var pred = "";
    for (var i = 0; i < objary.length; i++) {
        pred += objary[i].pred + '\n\n';
    }
    pred = pred.slice(0, -2);

    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i].index === index)
            TabRecord[i].text = pred;
    }

    var newTxt = addSpan(objary, 'prob');

    index = justify(index, 3);
    $("#result" + index).html(newTxt);
    check("#result" + index);
}

var addSpan = function (objary, ifprob) {
    var txt = '';
    if (ifprob === 'prob') {
        for (var i = 0; i < objary.length; i++) {
            var pred = objary[i].pred;
            var prob = objary[i].probs;
            var list = objary[i].list;
            for (var k = 0, z = -1; k < pred.length; k++) {
                var x = pred[k];
                var w = pred[k].replace(Reg1, '*');
                var id, claname;
                if (w != '*') {
                    id = i + "_" + ++z;
                    claname = 'word';
                }
                else {
                    id = i + "_" + z;
                    claname = 'punc';
                }

                var warning = judge(list, prob[z], 6000);
                if (w == '*') warning = false;
                if (warning)
                    warning = 'warn';
                else
                    warning = '';
                txt += addtag('span', pred[k], claname, id, warning).outerHTML;
            }
            txt += '<br><br>';
        }
        txt = txt.slice(0, txt.lastIndexOf('<br><br>'));
    }
    else {
        var ls = objary.split('');
        for (var i = 0; i < ls.length; i++) {
            txt += addtag('span', ls[i], 'word', '', '').outerHTML;
        }
    }
    setTimeout(showTooltip, 120);
    return txt;
}

var judge = function (name, prob, threshold) {
    var warning = true;
    for (let i = 0; i < name.length; i++) {
        var p = name[i];
        var v = parseInt(prob[i]);
        if (v > threshold) warning = false;
    }
    return warning;
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

    setTimeout(function () {
        $("#modal").click();
    }, 100);
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
        input.value = list[i].ver;
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
    copy.onclick = function () {
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
    copy.onclick = function () {
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
    newlink.draggable = "true";

    var a = createE("a");
    a.id = 'tablink' + justify(index, 3);
    a.className = "nav-link";
    a.dataset.toggle = "tab";
    a.href = "#tab" + justify(index, 3);
    a.innerHTML = ver + " ";
    a.ondblclick = function (e) {
        closeLink(e);
    }

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

var closeLink = function (e) {
    var link = '#' + e.target.id;
    var tab = e.target.hash;
    var ver = e.target.text.trim();

    $(link).remove();
    $(tab).remove();

    var max1 = 0, max2 = 0;
    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i].ver == ver)
            TabRecord[i] = "";
        else if (TabRecord[i].index > max1)
            max1 = TabRecord[i].index;
    }
    if (TabRecord.indexOf("") != -1)
        TabRecord.splice(TabRecord.indexOf(""), 1);

    for (var i = 0; i < TbandTbRecord.length; i++) {
        if (TbandTbRecord[i].ver == ver)
            TbandTbRecord[i] = "";
        else if (TbandTbRecord[i].index > max2)
            max2 = TbandTbRecord[i].index;
    }
    if (TbandTbRecord.indexOf("") != -1)
        TbandTbRecord.splice(TbandTbRecord.indexOf(""), 1);

    var id = max1 > max2 ? max1 : max2;
    id = "#tablink" + justify(id, 3);
    $(id).click();
}

// ----------------------------------------------------Basic
var warnColor = 'rgb(255, 128, 128)';
var editColor = 'rgb(220, 160, 255)';
var addtag = function (tg, str, classname, id, state) {
    var newTag;
    if (str === '\n')
        newTag = createE('br');
    else {
        newTag = createE(tg);
        newTag.className = classname;
        newTag.innerHTML = str;
        if (id != '') newTag.id = id;
        if (state != '') {
            if (state === 'warn')
                newTag.style.backgroundColor = warnColor;
            else if (state === 'edit')
                newTag.style.backgroundColor = editColor;

            newTag.dataset.state = state;
        }
    }
    return newTag;
}

var showTooltip = function () {
    $(".Result>span").click(function (e) {
        e.stopPropagation();//阻止冒泡
        showTip(e);
    });

    $(".Result>span.pun").click(function (e) {
        e.stopPropagation();//阻止冒泡
        showTip(e);
    });

    $('#tooltip').click(function (e) {
        e.stopPropagation();//阻止冒泡
    });

    $(document).click(function (e) {
        $('#tooltip').fadeOut();
    });
}

var showTip = function (e) {
    var eid = e.target.id;
    var text = e.target.innerText;
    clickedSpan = e.target;
    var pary, name;
    var list = [];
    var id = parseInt(eid);
    var pib = '#' + e.target.parentElement.id;
    for (var i = 0; i < TabRecord.length; i++) {
        if (TabRecord[i].tabid === pib) {
            pary = TabRecord[i].response[id];
            pary = pary.probs;
            name = TabRecord[i].response[id].list;
        }
    }
    var index = e.target.id;
    index = index.slice(parseInt(index.indexOf("_")) + 1);
    pary = pary[parseInt(index)];

    for (var i = 0; i < pary.length; i++) {
        var num = parseInt(pary[i]);
        var p = name[i];
        var v;
        // if (num === 0) v = ''
        v = num / 100 + "%";

        if (p === '') p = '　';
        if (i > 0) {
            var k;
            for (k = 0; k < i; k++) {
                if (num > list[k].n) {
                    list.splice(k, 0, { p: p, v: v, n: num });
                    break;
                }
            }
            if (k === i)
                // list.splice(k, 0, { p: p, v: v, n: num });
                list.push({ p: p, v: v, n: num });
        }
        else
            list.push({ p: p, v: v, n: num });
    }

    if (text === ' ') text = '　';
    setTooltable(list, text, eid);

    var left = e.originalEvent.pageX + 40;
    var top = e.originalEvent.pageY - 120;
    var max_X = $(document)[0].body.clientWidth - 220;
    left = left < 0 ? '0' : left;
    left = left > max_X ? max_X : left;
    top = top < 95 ? 95 : top;
    $("#tooltip").css({ "top": top + "px", "left": left + "px" });
    $('#tooltip').fadeIn();
}

var setTooltable = function (list, title, target) {
    $('#tooltip').empty();
    $('#tooltip').append("<p id='tooltitle'>" + title + "</p>");
    var Tb = createE("table");
    Tb.className = "table table-bordered table-striped table-hover table-sm";
    Tb.id = "probsTable";

    for (var i = 0; i < list.length; i++) {
        var Tr = createE("tr");
        var Th = createE("th");
        var Td = createE("td");
        var span = createE("span");
        span.innerHTML = list[i].p;

        var progress = createE("div");
        progress.className = 'progress';
        progress.dataset.target = target;
        progress.dataset.value = list[i].p;
        progress.onclick = function (e) {
            changePunc_SigMod(this);
            $("#tipbtn").fadeIn();
        }

        var progressbar = createE("div");
        progressbar.className = 'progress-bar';
        progressbar.style = "width:" + list[i].v;
        progressbar.innerHTML = list[i].v;
        progress.appendChild(progressbar);

        Th.appendChild(span);
        Td.appendChild(progress);
        Tr.appendChild(Th);
        Tr.appendChild(Td);
        Tb.appendChild(Tr);
    }
    $('#tooltip').append(Tb);
}

var clickedSpan;
var changePunc_MltMod = function (e) {
    var oriVal = clickedSpan.innerHTML;
    var newVal = e.dataset.value;
    if (newVal === "　") newVal = ' ';
    if (oriVal != newVal) {
        if (oriVal != ' ' && oriVal.replace(Reg1, '*') != '*') {//word
            if (newVal != ' ') {
                var span = createE("span");
                span.id = clickedSpan.id;
                span.className = "pun";
                span.style.backgroundColor = editColor;
                span.dataset.state = 'edit';
                span.innerHTML = newVal;
                $("#" + clickedSpan.id).after(span);
                $(".Result>span.pun").click(function (e) {
                    e.stopPropagation();//阻止冒泡
                    showTip(e);
                });
                clickedSpan.style.backgroundColor = '';
                clickedSpan.dataset.state = '';
            }
        } else {//punc
            clickedSpan.innerHTML = newVal;
            $('#' + clickedSpan.id).css("background-color", "");
            clickedSpan.style.backgroundColor = editColor;
            clickedSpan.dataset.state = 'edit';
        }
        check('#' + clickedSpan.parentElement.id);
    }
    $('#tooltip').fadeOut();
}

var changePunc_SigMod = function (e) {
    var oriVal = clickedSpan.innerHTML;
    var newVal = e.dataset.value;
    if (newVal === "　") newVal = ' ';
    if (oriVal != newVal) {
        if (oriVal != ' ' && oriVal.replace(Reg1, '*') != '*') {//word
            var group = $("[id='" + clickedSpan.id + "']");
            if (group.length >= 2) {
                var span = group[1];
                // print(group[1]);
                span.innerHTML = newVal;
                span.style.backgroundColor = editColor;
                span.dataset.state = 'edit';
                clickedSpan.style.backgroundColor = '';
                clickedSpan.dataset.state = '';
            } else if (newVal != ' ') {
                var span = createE("span");
                span.id = clickedSpan.id;
                span.className = "punc";
                span.style.backgroundColor = editColor;
                span.dataset.state = 'edit';
                span.innerHTML = newVal;
                $("#" + clickedSpan.id).after(span);
                $(".Result>span.punc").click(function (e) {
                    e.stopPropagation();//阻止冒泡
                    showTip(e);
                });
                clickedSpan.style.backgroundColor = '';
                clickedSpan.dataset.state = '';
            }
        } else {//punc
            clickedSpan.innerHTML = newVal;
            $('#' + clickedSpan.id).css("background-color", "");
            clickedSpan.style.backgroundColor = editColor;
            clickedSpan.dataset.state = 'edit';
        }
        check('#' + clickedSpan.parentElement.id);
    }
    $('#tooltip').fadeOut();
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

var addBold = function (str) {
    return '<b>' + str + '</b>';
}
// ----------------------------------------------------End