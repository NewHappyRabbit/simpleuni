let date = new Date().getDay();
let hours = new Date().getHours();
let minutes = new Date().getMinutes();


let subjectEl = document.getElementById("subject");
let typeEl = document.getElementById("type");
let roomEl = document.getElementById("room");
let timeEl = document.getElementById("time");
let linkEl = document.getElementById("link");


let cookieExpire = new Date();
cookieExpire = new Date(cookieExpire.getFullYear() + 1, cookieExpire.getMonth(), cookieExpire.getDate()).toUTCString();

$.fn.animateRotate = function (angle, duration, easing, complete) { //this is for rotating setting button
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(function (i, e) {
        args.complete = $.proxy(args.complete, e);
        args.step = function (now) {
            $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(e, arguments);
        };

        $({
            deg: 0
        }).animate({
            deg: angle
        }, args);
    });
};


function openSettings() { //otvarq menuto s nastroiki
    if ($("#settingsbutton").attr("rotation") == -90)
        $("#settingsbutton").attr("rotation", 90);
    else
        $("#settingsbutton").attr("rotation", -90);

    $("#settingsbutton").animateRotate($("#settingsbutton").attr("rotation")); //zavurta kop4eto settings
    $('#settings').toggle("slide", {
        direction: "left"
    }, 300); //pokazva menuto
}

function saveForm(form) {
    let n = form.parentNode.id.split('-')[2];
    
    let acord = form.parentNode.parentNode;
    
    $(acord).accordion("option", "active", n);
}

//TODO FUNCTIONS

function showTips() {
    $(`#tip-1`).show(); //show first tip
    
        
    
    
    //when all tips shown, delete the cookie so they dont show anymore
    document.cookie = 'userfirstusetime=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


//



function updateSubjects() { //from oldusers
    $('#olduser').hide();
    $('#newuser').show();
    $("#tabs").tabs();
    $("#allforms").show();
    $("#add-subject-hint").hide();
    
    //get subjects from cookie
        let regex = /program=({.+})/;
        let final = {};
        let subjects = document.cookie.match(regex);
        final = JSON.parse(subjects[1]);
    
    //start adding subjects to each day
    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk']) {
        $(day).empty();
        $(day).accordion({
            collapsible: true,
            heightStyle: "content"
        });
        
        //proverqvame dali ima predmeti v tozi den
        let den;
        switch (day) {
            case '#ponedelnik':
                den = 'понеделник';
                break;
            case '#vtornik':
                den = 'вторник';
                break;
            case '#srqda':
                den = 'сряда';
                break;
            case '#chetvurtuk':
                den = 'четвъртък';
                break;
            case '#petuk':
                den = 'петък';
                break;
        }
        
        //tuk obrabotvame vsi4ki 4etni i tezi koito sa VSQKA sedmica
        if (final[den].четна.length) { //ako ima chasove v tozi den
            for (let subject of final[den].четна) {
                fillSubjectsForUpdate(day,subject);
            }
        }
        
        //tuk preska4ame predmetite koito sa vsqka sedmica za da ne stavat dvoini formi
        if (final[den].нечетна.length) { //ako ima chasove v tozi den
            for (let subject of final[den].нечетна) {
                if (subject.when != 'всяка') {
                    fillSubjectsForUpdate(day,subject);
                }
            }
        }
    }
}

function fillSubjectsForUpdate(day,subject) {
        let den = day.substring(1);
        let lastel = $(`${day} h3`).length + 1;
        let n = +$(day).attr('subjs')+1;
        $(day).attr('subjs',n);

        let h3 = $("<h3></h3>").text(`${subject.name}`);
        let div = $(`<div id=\"${den}-predmet-${n}\" class="predmet">    </div>`);
        let form = $("<form onsubmit=\"event.preventDefault(); saveForm(this)\"></form>");
        $(div).append(form);


        let el = $(`
        <label class="cool-input cool-input-name" for="${den}-predmet${n}-name">
            <input value="${subject.name}" placeholder="&nbsp;" onchange="changeSubjectName(this)" id="${den}-predmet${n}-name" type="text" required>
            <span class="cool-input-label required">Име на предмет</span>
            <span class="cool-input-focus-bg"></span>
        </label>
        `);
        $(form).append(el);

        if (subject.type == 'лекция') {
            el = $(`
        <label class="cool-input-select cool-input-select-type" for="${den}-predmet${n}-type">
            <select id="${den}-predmet${n}-type" name="type" required>
                <option value="упражнение" >Упражнение</option>
                <option value="лекция" selected="selected">Лекция</option>
            </select>
          <svg>
            <use xlink:href="#select-arrow-down"></use>
          </svg>
        </label>`);
        }
        else {
            el = $(`
        <label class="cool-input-select cool-input-select-type" for="${den}-predmet${n}-type">
            <select id="${den}-predmet${n}-type" name="type" required>
                <option value="упражнение" selected="selected">Упражнение</option>
                <option value="лекция">Лекция</option>
            </select>
          <svg>
            <use xlink:href="#select-arrow-down"></use>
          </svg>
        </label>`);
        }
        $(form).append(el);

        if (subject.when == 'четна') {
            el = $(`
        <label class="cool-input-select cool-input-select-week" for="${den}-predmet${n}-when">
            <select id="${den}-predmet${n}-when" required>
                <option value="нечетна">В нечетна седмица</option>
                <option value="четна" selected="selected">В четна седмица</option>
                <option value="всяка">Всяка седмица</option>
            </select>
          <svg>
            <use xlink:href="#select-arrow-down"></use>
          </svg>
        </label>`);
        }
        else if (subject.when == 'нечетна') {
            el = $(`
        <label class="cool-input-select cool-input-select-week" for="${den}-predmet${n}-when">
            <select id="${den}-predmet${n}-when" required>
                <option value="нечетна" selected="selected">В нечетна седмица</option>
                <option value="четна">В четна седмица</option>
                <option value="всяка">Всяка седмица</option>
            </select>
          <svg>
            <use xlink:href="#select-arrow-down"></use>
          </svg>
        </label>`);
        }
        else {
            el = $(`
        <label class="cool-input-select cool-input-select-week" for="${den}-predmet${n}-when">
            <select id="${den}-predmet${n}-when" required>
                <option value="нечетна">В нечетна седмица</option>
                <option value="четна">В четна седмица</option>
                <option value="всяка" selected="selected">Всяка седмица</option>
            </select>
          <svg>
            <use xlink:href="#select-arrow-down"></use>
          </svg>
        </label>`);
        }
        $(form).append(el);

        let label = $(`<label class="cool-input-time-starts cool-input" for="${den}-predmet${n}-starts"></label>`);
        el = $(`<input value="${subject.starts}" placeholder="&nbsp;" onchange="checkTime(this); verifyTime(this)" id="${den}-predmet${n}-starts" type="text" required>`);
        $(el).timepicker({
            minTime: '07:00',
            maxTime: '22:00',
            step: 15,
            timeFormat: 'H:i'
        });
        $(label).append(el);
        el = $(`<span class="required cool-input-label">Започва в</span><span class="cool-input-focus-bg"></span>`);
        $(label).append(el);
        $(form).append(label);

        label = $(`<label class="cool-input-time-ends cool-input" for="${den}-predmet${n}-ends"></label>`);
        el = $(`<input value="${subject.ends}" placeholder="&nbsp;" onchange="verifyTime(this)" id="${den}-predmet${n}-ends" type="text" required>`);
        $(el).timepicker({
            minTime: '07:15',
            maxTime: '23:40',
            step: 15,
            timeFormat: 'H:i'
        });
        $(label).append(el);
        el = $(`<span class="required cool-input-label">Приключва в</span><span class="cool-input-focus-bg"></span>`);
        $(label).append(el);
        $(form).append(label);

        el = $(`
        <label class="cool-input cool-input-room" for="${den}-predmet${n}-room">
            <input value="${subject.room}" title="Пример: 1.102Б" placeholder="&nbsp;" id="${den}-predmet${n}-room" type="text">
            <span class="cool-input-label">Учебна стая</span>
            <span class="cool-input-focus-bg"></span>
        </label>
        `);
        $(form).append(el);

        el = $(`
        <label class="cool-input cool-input-link" for="${den}-predmet${n}-link">
            <input value="${subject.link}" placeholder="&nbsp;" id="${den}-predmet${n}-link" type="url" title="Линк към онлайн лекция/стая">
            <span class="cool-input-label">Линк</span>
            <span class="cool-input-focus-bg"></span>
        </label>
        `);
        $(form).append(el);

        el = $(`<span class="cool-input-fields">Полетата маркирани с<span class="required"> </span> са задължителни.</span>`);
        $(form).append(el);

        el = $(`<button class="form-submit-check"  type=\"submit\">Запази</button>`);
        $(form).append(el);

        el = $(`<img title="Изтрий предмет" onclick="deleteSubject(this)" class="delete-button" src="svg/delete-subject.svg">`);
        $(form).append(el);

        $(day).append(h3, div);
        $(day).accordion("refresh");
}

function deleteSubject(el) { //from when creating subject
    let div = el.parentElement.parentElement;
    let h3 = div.previousSibling;
    
    let day = h3.parentElement;
    div.remove();
    h3.remove();
    $(day).attr('deleted', true);
}

function checkIfEmpty() {
    if ($('#tabs').find("input").length < 2)
        alert('Въведете поне един предмет.');
    else {
        for (let form of ($(`#tabs form`))) {
                //check if form is invalid
                if(!form.checkValidity()) {
                    //let n = form.parentNode.id.split('-')[2];
                    
                    let acord = form.parentNode.parentNode;
                    //check which tab we are currently on
                    let openTab = $('#tabs').tabs("option", "active"); //can be 0,1,2,3,4 NOT ponedelnik,...
                    
                    //get what tab the form is in
                    let formTab = form.parentNode.id.split('-')[0]; //will be ponedelnik,...
                    //pravi formtab ot 'ponedelnik' v 0 naprimer 
                    
                    
                    //get unique id to open tab when error
                    let formuniqueid = $(form.parentNode).attr('aria-labelledby');
                    let allforms = $(`#${formTab} h3`);
                    
                    let n = 0;
                    for (let h3 of allforms) {
                       if ($(h3).attr('id') == formuniqueid)
                           break;
                        else
                            n++;
                    } 
                    
                    switch (formTab) {
                        case 'ponedelnik':
                            formTab = 0;
                            break;
                        case 'vtornik':
                            formTab = 1;
                            break;
                        case 'srqda':
                            formTab = 2;
                            break;
                        case 'chetvurtuk':
                            formTab = 3;
                            break;
                        case 'petuk':
                            formTab = 4;
                            break;
                    }
                    
                    $('#tabs').tabs("option", "active", formTab);//otvarq taba s denq
                    $(acord).accordion("option", "active", n); //otvarq predmeta
                    form.reportValidity(); //pravi proverkata za da izleze bubble errora
                    return;
                }
 
        }
        finalize();
    }  
}

function finalize() {
    $("#allforms").hide();
    let allsubj = {
        'понеделник': {
            'четна': [],
            'нечетна': []
        },
        'вторник': {
            'четна': [],
            'нечетна': []
        },
        'сряда': {
            'четна': [],
            'нечетна': []
        },
        'четвъртък': {
            'четна': [],
            'нечетна': []
        },
        'петък': {
            'четна': [],
            'нечетна': []
        }
    };

    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk']) {
        $('#finalize-' + day.substring(1)).empty();
        if ($(`${day} div`).length > 0) {
            for (let subject of ($(`${day} div form`))) {
                let subj = {};
                for (let input of $(subject).find(':input').not(':input[type=button], :input[type=submit]')) {
                    let id = $(input).attr('id').split('-')[2];
                    let val = $(input).val();
                    subj[id] = val;
                }
                let el;
                if (subj.room) {
                    el = $("<li></li>").text(`${subj.name} (${subj.type}), от ${subj.starts} до ${subj.ends}, ${subj.when} седмица в стая ${subj.room}.`);
                } else {
                    el = $("<li></li>").text(`${subj.name} (${subj.type}), от ${subj.starts} до ${subj.ends}, ${subj.when} седмица.`);
                }

                $('#finalize-' + day.substring(1)).append(el);


                let d;
                switch (day) {
                    case '#ponedelnik':
                        d = 'понеделник';
                        break;
                    case '#vtornik':
                        d = 'вторник';
                        break;
                    case '#srqda':
                        d = 'сряда';
                        break;
                    case '#chetvurtuk':
                        d = 'четвъртък';
                        break;
                    case '#petuk':
                        d = 'петък';
                        break;
                }
                if (subj.when == 'всяка') {
                    allsubj[d].четна.push(subj);
                    allsubj[d].нечетна.push(subj);
                } else {
                    allsubj[d][subj.when].push(subj);
                }
            }
        }
    }

    $("#finalize").dialog({
        resizable: false,
        height: "auto",
        width: "auto",
        modal: true,
        draggable: false,
        closeOnEscape: false,
        buttons: {
            'Информацията е вярна': function () {
                $(this).dialog("close");
                document.cookie = `program=${JSON.stringify(allsubj)};expires=${cookieExpire};path=/`; 
                checkCookie();
            },
            'Има допусната грешка': function () {
                $(this).dialog("close");
                $("#allforms").show();
            },
        }
    });
    $("#finalize").show();

}

function getsubject(week, subjects) { //tursi koi predmet ima sega potrebitelq
    switch (date) {
        case 1:
            date = 'понеделник';
            break;
        case 2:
            date = 'вторник';
            break;
        case 3:
            date = 'сряда';
            break;
        case 4:
            date = 'четвъртък';
            break;
        case 5:
            date = 'петък';
            break;
    }
    for (let sub of subjects[date][week]) {
        let endT = sub.ends.split(":");
        if (endT[0] > hours) {
            displaySubject(sub);
            return;
        } else if (endT[0] == hours) {
            if (endT[1] >= minutes) {
                displaySubject(sub);
                return;
            }
        } else { //ako nqma poveche chasove
            subjectEl.innerText = 'Днес нямате повече часове.';
            $('#olduser').show();
        }
    }
    subjectEl.innerText = 'Днес нямате часове.';
    $('#olduser').show();
}

function getWeek(subjects) { //pita dali e chetna ili nechetna sedmica
    if(document.cookie.match('userfirstusetime=true')) //pokazva na potrebitelq nqkoi hintove pri purvo polzvane
        showTips();
    
    $(function () {
        $("#week-choose").dialog({
            resizable: false,
            height: "auto",
            width:'auto',
            classes: {
             'ui-dialog-title': 'ui-dialog-title-custom'   
            },
            modal: true,
            draggable: false,
            closeOnEscape: false,
            buttons: {
                "Четна": function () {
                    $(this).dialog("close");
                    getsubject('четна', subjects);
                },
                "Нечетна": function () {
                    $(this).dialog("close");
                    getsubject('нечетна', subjects);
                }
            }
        });
    });
}

function displaySubject(sub) { //izkarva predmeta v dom
    if (sub.startM == 0)
        sub.startM = '00';
    time = `${sub.starts}-${sub.ends}`;
    if (sub.link.length > 0) {
        if (sub.link.includes('http://'))
            link = sub.link;
        else
            link = 'http://' + sub.link;

        linkEl.href = link;
    }

    subjectEl.innerText = sub.name;
    typeEl.innerText = sub.type;
    if (sub.room.length > 0)
        roomEl.innerText = sub.room;
    timeEl.innerText = time;
    $("#olduser").show();
}

function checkCookie() { //proverqva dali potrebitelq vliza za purvi put ili ve4e e vkaral predmeti
    let regex = /program=({.+})/;
    let final = {};
    let subjects = document.cookie.match(regex);
    if (subjects === null) {
        createSubjects();
    } else {
        final = JSON.parse(subjects[1]);
        getWeek(final);
    }
}

function createSubjects() { //pri purvo polzvane kara potrebitelq da vkara predmetite
    $("#allforms").hide();
    $("#newuser").show();
    
    $("#dialog-message").dialog({
        modal: true,
        draggable: false,
        closeOnEscape: false,
        width: '250',
        buttons: [
            {
            text: 'Продължи',
            "class": 'continuebutton',
            click: function () {
                $(this).dialog("close");
                $("#tabs").tabs();
                $("#allforms").show();
                document.cookie = 'userfirstusetime=true'; //polzvame za da dadem hintove pri purvo polzvane
            }
        }
        ]
    });
    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk']) {
        $(day).accordion({
            collapsible: true,
            heightStyle: "content"
        });
    }
}

function addSubject(day) {
    $('#add-subject-hint').hide();
    let den = day;
    day = '#' + day;
    let lastel = $(`${day} h3`).length + 1;
    let n = +$(day).attr('subjs')+1;
    $(day).attr('subjs',n);
    
    let h3 = $("<h3></h3>").text(`Предмет ${n}`);
    let div = $(`<div id=\"${den}-predmet-${n}\" class="predmet">    </div>`);
    let form = $("<form onsubmit=\"event.preventDefault(); saveForm(this)\"></form>");
    $(div).append(form);
    
    
    let el = $(`
    <label class="cool-input cool-input-name" for="${den}-predmet${n}-name">
        <input placeholder="&nbsp;" onchange="changeSubjectName(this)" id="${den}-predmet${n}-name" type="text" required>
        <span class="cool-input-label required">Име на предмет</span>
        <span class="cool-input-focus-bg"></span>
    </label>
    `);
    $(form).append(el);

    el = $(`
    <label class="cool-input-select cool-input-select-type" for="${den}-predmet${n}-type">
        <select id="${den}-predmet${n}-type" name="type" required>
            <option value="" disabled="disabled" selected="selected">Избери тип*</option>
            <option value="упражнение" >Упражнение</option>
            <option value="лекция">Лекция</option>
        </select>
      <svg>
        <use xlink:href="#select-arrow-down"></use>
      </svg>
    </label>`);
    $(form).append(el);
    
    el = $(`
    <label class="cool-input-select cool-input-select-week" for="${den}-predmet${n}-when">
        <select id="${den}-predmet${n}-when" required>
            <option value="" disabled="disabled" selected="selected">Избери кога*</option>
            <option value="нечетна">В нечетна седмица</option>
            <option value="четна">В четна седмица</option>
            <option value="всяка">Всяка седмица</option>
        </select>
      <svg>
        <use xlink:href="#select-arrow-down"></use>
      </svg>
    </label>`);
    $(form).append(el);
    
    let label = $(`<label class="cool-input-time-starts cool-input" for="${den}-predmet${n}-starts"></label>`);
    el = $(`<input placeholder="&nbsp;" onchange="checkTime(this); verifyTime(this)" id="${den}-predmet${n}-starts" type="text" required>`);
    $(el).timepicker({
        minTime: '07:00',
        maxTime: '22:00',
        step: 15,
        timeFormat: 'H:i'
    });
    $(label).append(el);
    el = $(`<span class="required cool-input-label">Започва в</span><span class="cool-input-focus-bg"></span>`);
    $(label).append(el);
    $(form).append(label);

    label = $(`<label class="cool-input-time-ends cool-input" for="${den}-predmet${n}-ends"></label>`);
    el = $(`<input placeholder="&nbsp;" onchange="verifyTime(this)" id="${den}-predmet${n}-ends" type="text" required>`);
    $(el).timepicker({
        minTime: '07:15',
        maxTime: '23:40',
        step: 15,
        timeFormat: 'H:i'
    });
    $(label).append(el);
    el = $(`<span class="required cool-input-label">Приключва в</span><span class="cool-input-focus-bg"></span>`);
    $(label).append(el);
    $(form).append(label);
    
    el = $(`
    <label class="cool-input cool-input-room" for="${den}-predmet${n}-room">
        <input title="Пример: 1.102Б" placeholder="&nbsp;" id="${den}-predmet${n}-room" type="text">
        <span class="cool-input-label">Учебна стая</span>
        <span class="cool-input-focus-bg"></span>
    </label>
    `);
    $(form).append(el);

    el = $(`
    <label class="cool-input cool-input-link" for="${den}-predmet${n}-link">
        <input placeholder="&nbsp;" id="${den}-predmet${n}-link" type="url" title="Линк към онлайн лекция/стая">
        <span class="cool-input-label">Линк</span>
        <span class="cool-input-focus-bg"></span>
    </label>
    `);
    $(form).append(el);

    el = $(`<span class="cool-input-fields">Полетата маркирани с<span class="required"> </span> са задължителни.</span>`);
    $(form).append(el);
    
    el = $(`<button class="form-submit-check"  type=\"submit\">Запази</button>`);
    $(form).append(el);
    
    el = $(`<img title="Изтрий предмет" onclick="deleteSubject(this)" class="delete-button" src="svg/delete-subject.svg">`);
    $(form).append(el);

    $(day).append(h3, div);
    $(day).accordion("refresh");
    if ($(day).attr('deleted') == 'true') {//if element is deleted prevent weird animation 
        $(day).accordion("option", "active", false);
        $(day).attr('deleted', 'false');
}
    $(day).accordion("option", "active", lastel - 1);
}

function checkTime(el) {
    let type = el.id.split('-');
    type[2] = 'ends';
    type = type.join('-');
    let tm = el.value.split(":");
    tm[1] = Number(tm[1]) + 15;
    if (tm[1] == 60) {
        tm[1] = '00';
        tm[0]++;
    }

    tm = tm.join(':')
    $('#' + type).timepicker({
        minTime: tm,
        maxTime: '23:40',
        step: 15,
        timeFormat: 'H:i'
    });
    document.getElementById(type).value = tm;
}

function verifyTime(el) {
    let regex = /^\d\d:\d\d$/;
    if (!el.value.match(/^\d\d:\d\d$/)) {
        el.setCustomValidity("Not a time.");
    } else {
        el.setCustomValidity('');
    }
}

function changeSubjectName(el) {
    el.parentNode.parentNode.parentNode.previousSibling.innerText = el.value;
    $(el.parentNode.parentNode.parentNode.parentNode).accordion("refresh");
}