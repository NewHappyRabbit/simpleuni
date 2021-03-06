import './jquery-3.5.1.min.js';
import './jquery-ui.min.js';
import {html, render} from 'https://unpkg.com/lit-html?module';
import './jquery.timepicker.min.js';
import './parse.min.js';
Parse.initialize("OhHXlNOYVhnRv5WwWGCijNSuFqS3u77NRiioEIGS", "m2g7YwRQe7W2VUdsBtn3MAJxomzUf6azp9FibaWQ"); 
Parse.serverURL = 'https://parseapi.back4app.com/';

window.onload=addEventListeners;

let date = new Date().getDay();
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
    case 6:
        date = 'събота';
        break;
    case 0:
        date = 'неделя';
        break;
}
let hours = new Date().getHours();
let minutes = new Date().getMinutes();
let linkEl = document.getElementById("link");
let subjectEl = document.getElementById("subject");
let typeEl = document.getElementById("type");
let roomEl = document.getElementById("room");
let timeEl = document.getElementById("time");
let currentweek;

function addEventListeners() {
    document.getElementById('settingsbutton').addEventListener('click',openSettings);
    document.getElementById('show-all-subjects').addEventListener('click',showAllSubjects);
    document.getElementById('edit-program').addEventListener('click',editSubjects);
    document.getElementById('share-program').addEventListener('click',createProgramCode);
    document.getElementById('delete-program').addEventListener('click',deleteAll);
    document.getElementById('finalize-form-button').addEventListener('click',validateForms);
    document.querySelectorAll('#tabs img[title="Добави предмет"]').forEach((img) => {
        img.addEventListener('click',() => {
            addSubject(img.parentNode.previousElementSibling.id);
        });
    });
    document.querySelectorAll('.icon').forEach(el => {
        el.addEventListener('click', changeDarkMode);
    });
    
    document.querySelector('#migrate button').addEventListener('click', migrate);
    
    checkUser();
}

function migrate() {
    const Back4app = Parse.Object.extend("programs");
    let program = {
        program: localStorage.getItem("program"),
        type: localStorage.getItem("type")
    };
    const back4app = new Back4app();
    back4app.set("Program", program);
    back4app.save()
        .then((object) => {
            // Success
            gtag('event', 'interaction', {'event_category': 'user migrated', 'event_label': `${object.id}`});
            window.location.replace("https://mydigitalschedule.web.app/migrate/"+object.id);
        }, (error) => {
            // Save fails
            alert('Възникна грешка: ' + error.message);
        });
}

function showAllSubjects() {
    let program = JSON.parse(localStorage.getItem('program'));
    let table;
    let days = [];
    if (localStorage.getItem('type') == 'pupil') {
        let getDays = () => {
            let result = [];
            for (let [day, val] of Object.entries(program)) {
                result.push(html`<th>${day}</th>`);
                days.push(day);
            }
            return result;
        }

        let getSubjects = () => {
            let allsubjects = [];

            let maxrows = 0;
            for (let day of days) {
                if (maxrows < program[day].length) {
                    maxrows = program[day].length;
                }
            }

            let allrows = [];
            for (let i = 0; i < maxrows; i++) {
                let isubjects = [];
                for (let day of days) {
                    program[day] = program[day].sort((a,b) => {
                        if (a.starts > b.starts)
                            return 1;
                        else
                            return -1;
                    });
                    if (program[day][i])
                        isubjects.push(html`
                            <td>
                                ${program[day][i].link 
                                    ? html`
                                        <a href=${program[day][i].link}>
                                            ${program[day][i].name}
                                            <br>
                                            ${program[day][i].starts}-${program[day][i].ends}
                                            ${program[day][i].room ? 
                                                html`<br>${program[day][i].room}`
                                                : ''}
                                        </a>`
                                    : html`
                                        ${program[day][i].name}
                                        <br>
                                        ${program[day][i].starts}-${program[day][i].ends}
                                        ${program[day][i].room ? 
                                            html`<br>${program[day][i].room}`
                                        : ''}`
                                }
                            </td>
                            `);

                    else
                        isubjects.push(html`<td></td>`);
                }
                allrows.push(html`
                    <tr>
                        ${isubjects}
                    </tr>`);
            }
            return allrows;
            }
            table = html`
                <table class='pupil-allsubjects'>
                    <thead>
                    <tr>
                        ${getDays() /* grabs all days */}
                    </tr>
                    </thead>
                    <tbody>
                        ${getSubjects()}
                    </tbody>
                </table>
            `;
    }
    else {
        let getSubjects = () => {
            let alldays = [];
            let maxcols=0;
            for (let day of Object.entries(program)) {
                if(day[1].нечетна && maxcols < day[1].нечетна.length)
                    maxcols = day[1].нечетна.length;
                if(day[1].четна && maxcols < day[1].четна.length)
                maxcols = day[1].четна.length;
            }
            let n = 0;
            for (let day of Object.entries(program)) {
                n++;
                let todaysubjectschetna = [];
                let todaysubjectsnechetna = [];

                if (day[1].нечетна) {
                    program[day[0]].нечетна = program[day[0]].нечетна.sort((a,b) => {
                        if (a.starts > b.starts)
                            return 1;
                        else
                            return -1;
                    });
                    for (let i = 0; i < maxcols; i++){
                        if (day[1].нечетна && day[1].нечетна[i]){
                            let subject = day[1].нечетна[i];
                            todaysubjectsnechetna.push(html`
                                <td class=${subject.when == 'всяка' ? 'every-week' : ''} rowspan=${subject.when == 'всяка' ? 2 : 1}>
                                    ${subject.link
                                        ? html`
                                        <a href=${subject.link}>
                                            ${subject.name}<br>
                                            ${subject.type}<br>
                                            ${subject.room ? 
                                                html`${subject.room}<br>`
                                                : ''
                                            }
                                            ${subject.starts+'-'+subject.ends}
                                        </a>`
                                        : html`
                                            ${subject.name}<br>
                                            ${subject.type}<br>
                                            ${subject.room ? 
                                                html`${subject.room}<br>`
                                                : ''
                                            }
                                            ${subject.starts+'-'+subject.ends}`
                                    }
                                </td>
                            `);}
                        else {
                            todaysubjectsnechetna.push(html`<td></td>`);
                        }
                    }
                } else {
                    for (let i = 0; i < maxcols; i++)
                        todaysubjectsnechetna.push(html`<td></td>`);
                }

                if (day[1].четна) {
                    program[day[0]].четна = program[day[0]].четна.sort((a,b) => {
                        if (a.starts > b.starts)
                            return 1;
                        else
                            return -1;
                    });
                    for (let i = 0; i < maxcols; i++){
                        if (day[1].четна && day[1].четна[i]){
                            let subject = day[1].четна[i];
                            if(subject.when != 'всяка')
                                todaysubjectschetna.push(html`
                                    <td>
                                        ${subject.link
                                            ? html`
                                            <a href=${subject.link}>
                                                ${subject.name}<br>
                                                ${subject.type}<br>
                                                ${subject.room ? 
                                                    html`${subject.room}<br>`
                                                    : ''
                                                }
                                                ${subject.starts+'-'+subject.ends}
                                            </a>`
                                            : html`
                                                ${subject.name}<br>
                                                ${subject.type}<br>
                                                ${subject.room ? 
                                                    html`${subject.room}<br>`
                                                    : ''
                                                }
                                                ${subject.starts+'-'+subject.ends}`
                                        }
                                    </td>
                                `);
                        }
                        else {
                            todaysubjectschetna.push(html`<td></td>`);
                        }
                    }
                } else {
                    for (let i = 0; i < maxcols; i++)
                        todaysubjectschetna.push(html`<td></td>`);
                }


                alldays.push(html`
                    <tr class=${n%2 == 0 ? 'even-top' : 'odd-top'}> 
                        <th rowspan=${2}>${day[0]}</th>
                        <td class='week-type'>нечетна</td>
                            ${todaysubjectsnechetna}
                    </tr>
                    <tr class=${n%2 == 0 ? 'even-bottom' : 'odd-bottom'}>
                        <td class='week-type'>четна</td>
                            ${todaysubjectschetna}
                    </tr>
                `);
            }
            let toreturn = html`
            <tr>
                ${alldays}
            </tr>
            `

            
            return toreturn;
        }


            table = html`
                <table class='student-allsubjects'>
                    <tbody>
                        ${getSubjects()}
                    </tbody>
                </table>
            `;
    }

    render(table, document.getElementById('allSubjects'));

    $("#allSubjects").dialog({
        resizable: true,
        height: "auto",
        width: 'auto',
        modal: true,
        classes: {
            "ui-dialog": "week-subjects"
          }
});
}

function deleteAll() {
    let confirmed = confirm('Сигурни ли сте че изкате да изтриете своята програма?');
    if (confirmed == true) {
        gtag('event', 'interaction', {'event_category': 'user deleted his schedule'});
        localStorage.clear();
        alert('Всичко е изтрито!');
        location.reload();
    }
}

function activateProgramCode() {
    let code = document.getElementById("programcode").value;

    if (!code)
        alert('Моля въведете код!');
    else {
        const Back4app = Parse.Object.extend("programs");
        const back4app = new Parse.Query(Back4app);

        back4app.get(code)
            .then((program) => {
                // The object was retrieved successfully.
                localStorage.setItem("program", program.attributes.Program.program);
                localStorage.setItem("type", program.attributes.Program.type);
                localStorage.setItem("userfirstusetime", true);
                alert('Успешно въведена програма!');
                window.location.replace("index.html");
                gtag('event', 'interaction', {'event_category': 'user successful entered a shared schedule code', 'event_label': `${code}`});
            }, (error) => {
                //alert('Възникна грешка: ' + error);
                alert('Невалиден код.');
                gtag('event', 'interaction', {'event_category': 'user failed to enter a valid shared schedule code'});
            });
    }

}

function createProgramCode() {
    const Back4app = Parse.Object.extend("programs");
    let program = {
        program: localStorage.getItem("program"),
        type: localStorage.getItem("type")
    };
    const back4app = new Back4app();

    //let program = JSON.parse(localStorage.getItem("program"));
    back4app.set("Program", program);
    back4app.save()
        .then((object) => {
            // Success
            alert('Вашият код за споделяне: ' + object.id);
            gtag('event', 'interaction', {'event_category': 'user created a shared schedule code', 'event_label': `${object.id}`});
        }, (error) => {
            // Save fails
            gtag('event', 'errors', {'event_category': 'error when creating a shared schedule code', 'event_label': `${error.message}`});
            alert('Възникна грешка: ' + error.message);
        });
}

function checkUser() {

    //check dark mode settings
    updateDarkModeBody();
    rotateDarkModeWheel();
    clearFields();
    
    let subjects = localStorage.getItem("program");
        
    if (subjects === null) {
        createSubjects();
    } else {
        subjects = JSON.parse(subjects);
        if (localStorage.getItem("type") == 'student')
            askOddOrEven(subjects);
        else
            getSubject(subjects);
    }
}

function changeDarkMode() {
    let preference = localStorage.getItem("dark-mode");
    let mode;
    switch (preference) {
        case 'off':
            mode = 'on';
            break;
        case 'on':
            mode = 'auto';
            break;
        case 'auto':
            mode = 'off';
            break;
        default:
            mode = 'on';
            break;
    }

    localStorage.setItem("dark-mode", mode);
    const icons = document.querySelector('#icons');
    const rotation = parseInt(getComputedStyle(icons).getPropertyValue('--rotation'));
    icons.style.setProperty('--rotation', rotation - 120);
    updateDarkModeBody();

}

function rotateDarkModeWheel() {
    let preference = localStorage.getItem("dark-mode");
    let icons = document.querySelector('#icons');

    icons.style['transition-duration'] = '0s';
    if (preference == 'auto') {
        icons.style.setProperty('--rotation', -240);
    }
    else if (preference == 'on') {
        icons.style.setProperty('--rotation', -120);
    }
    else if (preference == null || preference == 'off') {
        icons.style.setProperty('--rotation', 0);
    }
    setTimeout(function () {
        icons.style['transition-duration'] = '1s';
    }, 1);
}

function updateDarkModeBody() {
    let darkthemecss = document.getElementById('darktheme');
    let preference = localStorage.getItem("dark-mode");
    if (preference == 'auto') {
        let checkSystem = window.matchMedia("(prefers-color-scheme: dark)");
        if (checkSystem.matches) {
            document.body.classList.add("dark-mode");
            darkthemecss.disabled = '';
        } else {
            document.body.classList.remove("dark-mode");
            darkthemecss.disabled = 'disabled';
        }
    } 
    else if (preference == 'on') {
        document.body.classList.add("dark-mode");
        darkthemecss.disabled = '';
    }
        
    else if (preference == null || preference == 'off') {
        document.body.classList.remove("dark-mode");
        darkthemecss.disabled = 'disabled';
    }
        
}

//////////// OLD USER FUNCTIONS ////////////////
function askOddOrEven(subjects) { //pita dali e chetna ili nechetna sedmica    
    $(function () {
        $("#week-choose").dialog({
            resizable: false,
            height: "auto",
            width: 'auto',
            modal: false,
            draggable: false,
            closeOnEscape: false,
            classes: {
                'ui-dialog-title': 'ui-dialog-title-custom',
                'ui-dialog-titlebar-close': 'ui-dialog-close-hide'
            },
            buttons: {
                "Четна": function () {
                    $(this).dialog("close");
                    currentweek = 'четна';
                    getSubject(subjects);
                },
                "Нечетна": function () {
                    $(this).dialog("close");
                    currentweek = 'нечетна';
                    getSubject(subjects);
                }
            }
        });
    });
}

function clearFields() {
    linkEl.removeAttribute("href");
    subjectEl.innerText = '';
    typeEl.innerText = '';
    roomEl.innerText = '';
    timeEl.innerText = '';
}

function getSubject(subjects) { //tursi koi predmet ima sega potrebitelq
    document.getElementById('link').remove();
    document.getElementById('userDiv').appendChild(linkEl);
    if (localStorage.getItem('type') == 'student') { //if student
        if (subjects[date] && subjects[date][currentweek] && subjects[date][currentweek].length) { //if day has any subjects
            subjects[date][currentweek] = subjects[date][currentweek].sort((a,b) => { //sorts subjects by time for the day
                if (a.starts > b.starts)
                    return 1;
                else
                    return -1;
            });
            
                for (let sub of subjects[date][currentweek]) {
                    let endT = sub.ends.split(":");
                    
                    if (endT[0] > hours) {
                        displaySubject(sub);
                        return;
                    } else if (endT[0] == hours && endT[1] >= minutes) {
                        displaySubject(sub);
                        return;
                    } else { //ako nqma poveche chasove za dnes
                        subjectEl.innerText = 'Днес нямате повече часове.';
                        $('#userDiv').show();
                    }
            }
            
        } else { //ako vuob6te nqma 4asove dnes
            subjectEl.innerText = 'Програмата ви за днес е празна.';
            $('#userDiv').show();
        }
    } 
    else { //if pupil
        if (subjects[date]) {
            subjects[date] = subjects[date].sort((a, b) => { //sorts subjects by time for the day
                if (a.starts > b.starts)
                    return 1;
                else
                    return -1;
            });

            for (let sub of subjects[date]) {
                let endT = sub.ends.split(":");

                if (endT[0] > hours) {
                    displaySubject(sub);
                    return;
                } else if (endT[0] == hours && endT[1] >= minutes) {
                    displaySubject(sub);
                    return;
                } else { //ako nqma poveche chasove za dnes
                    subjectEl.innerText = 'Днес нямате повече часове.';
                    $('#userDiv').show();
                }
            }
        } else { //ako vuob6te nqma 4asove dnes
            subjectEl.innerText = 'Програмата за днес е празна.';
            $('#userDiv').show();
        }
    }


}

function displaySubject(sub) { //izkarva predmeta v dom
    let time = `${sub.starts}-${sub.ends}`;
    if (sub.link.length > 0) {
        linkEl.href = sub.link;
    }

    subjectEl.innerText = sub.name;
    if (sub.type)
        typeEl.innerText = sub.type;
    if (sub.room.length > 0)
        roomEl.innerText = sub.room;
    timeEl.innerText = time;
    $("#userDiv").show();
}

function openSettings() { //otvarq menuto s nastroiki
    if ($("#settingsbutton").attr("rotation") == 90)
        $("#settingsbutton").attr("rotation", -90);
    else
        $("#settingsbutton").attr("rotation", 90);

    $("#settingsbutton").animateRotate($("#settingsbutton").attr("rotation")); //zavurta kop4eto settings
    $('#settings').toggle("slide", {
        direction: "right"
    }, 300); //pokazva menuto
}

function editSubjects() { //from userDivs
    $('#userDiv').hide();
    $('#subjectsForms').show();
    
    if (localStorage.getItem('type') == 'student') {
        $("#tabs").tabs({
            classes: {
                "ui-tabs": "student-tabs"
            }
        });
    }
    else {
        $("#tabs").tabs({
            classes: {
                "ui-tabs": "pupil-tabs"
            }
        });
    }

    $("#allforms").show();
    $("#add-subject-hint").hide();

    let subjects = localStorage.getItem("program");
    let final = JSON.parse(subjects);

    //start adding subjects to each day
    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk', '#subota', '#nedelq']) {
        $(day).empty();
        $(day).accordion({
            collapsible: true,
            heightStyle: "content"
        });

        let den;
        switch(day) {
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
            case'#subota':
                den = 'събота';
                break;
            case '#nedelq':
                den = 'неделя';
                break;
        }

        //proverqvame dali ima predmeti v tozi den
        if (localStorage.getItem("type") == 'student') {
            //tuk obrabotvame vsi4ki 4etni i tezi koito sa VSQKA sedmica
            if (final[den]) { //ako ima chasove v tozi den
                
                if (final[den].четна) {
                    for (let subject of final[den].четна) {
                        //fillSubjectsForEdit(day, subject);
                        addSubject(day.substring(1),subject);
                    }
                }
                if (final[den].нечетна) { //ako ima chasove v tozi den
                    for (let subject of final[den].нечетна) {
                        if (subject.when != 'всяка') { //tuk preska4ame predmetite koito sa vsqka sedmica za da ne stavat dvoini formi
                            //fillSubjectsForEdit(day, subject);
                            addSubject(day.substring(1),subject);
                        }
                    }
                }
            }   
        } else {
            if (final[den]) {
                for (let subject of final[den]) {
                    addSubject(day.substring(1),subject);
                }
            }
        }


    }
}

//////////// NEW USER FUNCTIONS ////////////////
function createSubjects() { //pri purvo polzvane kara potrebitelq da vkara predmetite    
    $("#allforms").hide();
    $("#subjectsForms").show();

    if (ismobile) //shows the 'click here to add subject' hint for mobile 
        $('#tabs-1').children().eq(1).append($(`<img id="add-subject-hint-mobile" src="svg/add-subject-mobile.svg">`));
    else //shows desktop hint instead
        $('#tabs-1').children().eq(1).append($(`<img id="add-subject-hint" src="svg/add-subject.svg">`));

    $("#dialog-message").dialog({
        modal: false,
        resizable: false,
        draggable: false,
        closeOnEscape: false,
        width: '300',
        classes: {
            'ui-dialog-titlebar-close': 'ui-dialog-close-hide'
        },
        buttons: [
            {
                text: 'Въведи код',
                "class": 'simplecontinuebutton',
                click: function () {
                    //$(this).dialog("close");

                    $("#enter-code").dialog({
                        modal: true,
                        draggable: false,
                        closeOnEscape: false,
                        width: '300',
                        buttons: [
                            {
                                text: 'Въведи',
                                "class": 'simplecontinuebutton',
                                click: function () {
                                    activateProgramCode();
                                }
                        }]
                    });
                }
            },
            {
                text: 'Продължи',
                "class": 'continuebutton',
                click: function () {
                    $(this).dialog("close");
                    $("#student-or-pupil").dialog({
                        modal: false,
                        resizable: false,
                        draggable: false,
                        closeOnEscape: false,
                        width: '250',
                        classes: {
                            'ui-dialog-titlebar-close': 'ui-dialog-close-hide'
                        },
                        buttons: [
                            {
                                text: 'Студент',
                                click: function () {
                                    $(this).dialog("close");
                                    $("#tabs").tabs({
                                        classes: {
                                            "ui-tabs": "student-tabs"
                                        }
                                    });
                                    localStorage.setItem('type','student');
                                    $("#allforms").show();
                                }
                            },
                            {
                                text: 'Ученик',
                                click: function () {
                                    $(this).dialog("close");
                                    $("#tabs").tabs({
                                        classes: {
                                            "ui-tabs": "pupil-tabs"
                                        }
                                    });
                                    localStorage.setItem('type', 'pupil');
                                    $("#allforms").show();
                                }
                            }
                        ]
                    });
                }
            }
        ]
    });


    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk', '#subota', '#nedelq']) {
        $(day).accordion({
            collapsible: true,
            heightStyle: "content"
        });
    }
}

function saveForm(event) {
    event.preventDefault(); 
    let form = event.target;
    let n = form.parentNode.id.split('-')[2];

    let acord = form.parentNode.parentNode;

    $(acord).accordion("option", "active", n);
}

function deleteSubject(event) { //from when creating subject
    let el = event.target;
    let div = el.parentElement.parentElement;
    let h3 = div.previousSibling;

    let day = h3.parentElement;
    div.remove();
    h3.remove();
    $(day).attr('deleted', true);
}

function validateForms() {
    if ($('#tabs').find("input").length < 2)
        alert('Въведете поне един предмет.');
    else {
        for (let form of ($(`#tabs form`))) {
            //check if form is invalid
            if (!form.checkValidity()) {
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
                    case 'subota':
                        formTab = 5;
                        break;
                    case 'nedelq':
                        formTab = 6;
                        break;
                }

                $('#tabs').tabs("option", "active", formTab); //otvarq taba s denq
                $(acord).accordion("option", "active", n); //otvarq predmeta
                form.reportValidity(); //pravi proverkata za da izleze bubble errora
                return;
            }

        }
        if (localStorage.getItem("type") == 'student')
            finalizeStudent();
        else
            finalizePupil();
    }
}

function finalizePupil() {
    $("#allforms").hide();
    let allsubj = {};

    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk', '#subota', '#nedelq']) {
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
                    el = $("<li></li>").text(`${subj.name} от ${subj.starts} до ${subj.ends} в стая ${subj.room}.`);
                } else {
                    el = $("<li></li>").text(`${subj.name} от ${subj.starts} до ${subj.ends}.`);
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
                    case '#subota':
                        d = 'събота';
                        break;
                    case '#nedelq':
                        d = 'неделя';
                        break;
                }
                if (!allsubj[d])
                    allsubj[d] = [];
                allsubj[d].push(subj);

            }
        }
    }
    $("#finalize").dialog({
        resizable: false,
        height: "auto",
        width: "auto",
        modal: false,
        draggable: false,
        classes: {
            'ui-dialog-titlebar-close': 'ui-dialog-close-hide'
        },
        closeOnEscape: false,
        buttons: [
            {
                text: 'Назад',
                "class": 'backbutton finalize-buttons',
                click: function () {
                    $(this).dialog("close");
                    $("#allforms").show();
                }
            },
            {
                text: 'Завърши',
                "class": 'finishbutton finalize-buttons',
                click: function () {
                    $(this).dialog("close");
                    localStorage.setItem("program", `${JSON.stringify(allsubj)}`);
                    checkUser();
                    localStorage.setItem("userfirstusetime", "true"); //polzvame za da dadem hintove pri purvo polzvane
                    localStorage.setItem("type", "pupil");
                    gtag('event', 'interaction', {'event_category': 'new pupil created a schedule'});
                }
            }
        ]
    });
    $("#finalize").show();

}

function finalizeStudent() {
    $("#allforms").hide();
    let allsubj = {};

    for (let day of ['#ponedelnik', '#vtornik', '#srqda', '#chetvurtuk', '#petuk', '#subota', '#nedelq']) {
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
                    case '#subota':
                        d = 'събота';
                        break;
                    case '#nedelq':
                        d = 'неделя';
                        break;
                }
                if (subj.when == 'всяка') {
                    if (!allsubj[d])
                        allsubj[d] = {};
                    if (!allsubj[d].четна)
                        allsubj[d].четна = [];
                    if (!allsubj[d].нечетна)
                        allsubj[d].нечетна = [];
                    allsubj[d].четна.push(subj);
                    allsubj[d].нечетна.push(subj);
                } else {
                    if (!allsubj[d])
                        allsubj[d] = {};
                    if (!allsubj[d][subj.when])
                        allsubj[d][subj.when] = [];
                    allsubj[d][subj.when].push(subj);
                }
            }
        }
    }
    $("#finalize").dialog({
        resizable: false,
        height: "auto",
        width: "auto",
        modal: false,
        draggable: false,
        classes: {
            'ui-dialog-titlebar-close': 'ui-dialog-close-hide'
        },
        closeOnEscape: false,
        buttons: [
            {
                text: 'Назад',
                "class": 'backbutton finalize-buttons',
                click: function () {
                    $(this).dialog("close");
                    $("#allforms").show();
                }
            },
            {
                text: 'Завърши',
                "class": 'finishbutton finalize-buttons',
                click: function () {
                    $(this).dialog("close");
                    localStorage.setItem("program", `${JSON.stringify(allsubj)}`);
                    checkUser();
                    localStorage.setItem("userfirstusetime", "true"); //polzvame za da dadem hintove pri purvo polzvane
                    localStorage.setItem("type", "student");
                    gtag('event', 'interaction', {'event_category': 'new student created a schedule'});
                }
            }
        ]
    });
    $("#finalize").show();

}

function addSubject(day,subject) {
    if (ismobile)
        $('#add-subject-hint-mobile').hide();
    else
        $('#add-subject-hint').hide();

    let hday = '#' + day;
    let n = +$(hday).attr('subjs') + 1;
    let id = day+'-predmet'+n;

    let lastel = $(`${hday} h3`).length + 1;
    $(hday).attr('subjs', n);

    let h3;
    if (subject)
        h3 = $("<h3></h3>").text(subject.name);
    else 
        h3 = $("<h3></h3>").text(`Предмет ${n}`);
    let div = $(`<div id="${id}" class="predmet"></div>`);

    $(hday).append(h3);
    $(hday).append(div);

    function checkWeek() {
        if (!subject) {
            return html`
                <label class="cool-input-select cool-input-select-week" for="${id}-when">
                    <select id="${id}-when" required>
                        <option value="" disabled="disabled" selected="selected">Избери кога*</option>
                        <option value="нечетна">В нечетна седмица</option>
                        <option value="четна">В четна седмица</option>
                        <option value="всяка">Всяка седмица</option>
                    </select>
                    <svg>
                        <use xlink:href="#select-arrow-down"></use>
                    </svg>
                </label>
            `;
        }
        else if (subject.when == 'нечетна') {
            return html`
                <label class="cool-input-select cool-input-select-week" for="${id}-when">
                    <select id="${id}-when" required>
                        <option value="" disabled="disabled">Избери кога*</option>
                        <option value="нечетна" selected="selected">В нечетна седмица</option>
                        <option value="четна">В четна седмица</option>
                        <option value="всяка">Всяка седмица</option>
                    </select>
                    <svg>
                        <use xlink:href="#select-arrow-down"></use>
                    </svg>
                </label>
            `;
        }
        else if (subject.when == 'четна') {
            return html`
                <label class="cool-input-select cool-input-select-week" for="${id}-when">
                    <select id="${id}-when" required>
                        <option value="" disabled="disabled">Избери кога*</option>
                        <option value="нечетна">В нечетна седмица</option>
                        <option value="четна" selected="selected">В четна седмица</option>
                        <option value="всяка">Всяка седмица</option>
                    </select>
                    <svg>
                        <use xlink:href="#select-arrow-down"></use>
                    </svg>
                </label>
            `;
        }
        else {
            return html`
                <label class="cool-input-select cool-input-select-week" for="${id}-when">
                    <select id="${id}-when" required>
                        <option value="" disabled="disabled">Избери кога*</option>
                        <option value="нечетна">В нечетна седмица</option>
                        <option value="четна">В четна седмица</option>
                        <option value="всяка" selected="selected">Всяка седмица</option>
                    </select>
                    <svg>
                        <use xlink:href="#select-arrow-down"></use>
                    </svg>
                </label>
            `;
        }
    }

    function checkType() {
        if (!subject) {
            return html`
                <label class="cool-input-select cool-input-select-type" for="${id}-type">
                    <select id="${id}-type" name="type" required>
                        <option value="" disabled="disabled" selected="selected">Избери тип*</option>
                        <option value="упражнение">Упражнение</option>
                        <option value="лекция">Лекция</option>
                    </select>
                    <svg>
                        <use xlink:href="#select-arrow-down"></use>
                    </svg>
                </label>
            `;
        }
        else if (subject.type == 'упражнение') {
            return html`
                <label class="cool-input-select cool-input-select-type" for="${id}-type">
                    <select id="${id}-type" name="type" required>
                        <option value="" disabled="disabled">Избери тип*</option>
                        <option value="упражнение" selected="selected">Упражнение</option>
                        <option value="лекция">Лекция</option>
                    </select>
                    <svg>
                        <use xlink:href="#select-arrow-down"></use>
                    </svg>
                </label>
            `;
        }
        else {
            return html`
            <label class="cool-input-select cool-input-select-type" for="${id}-type">
                <select id="${id}-type" name="type" required>
                    <option value="" disabled="disabled">Избери тип*</option>
                    <option value="упражнение">Упражнение</option>
                    <option value="лекция" selected="selected">Лекция</option>
                </select>
                <svg>
                    <use xlink:href="#select-arrow-down"></use>
                </svg>
            </label>
        `;
        }
    }

     const predmet = () => html`
        
            <form @submit=${saveForm}>
                <label class="cool-input cool-input-name" for="${id}-name">
                    <input value=${subject ? subject.name : ''} placeholder="&nbsp;" @change=${changeSubjectNameForm} id="${id}-name" type="text" required>
                    <span class="cool-input-label required">Име на предмет</span>
                    <span class="cool-input-focus-bg"></span>
                </label>

                ${localStorage.getItem("type") == 'student'
                    ? html`
                        ${ checkType() }
                        ${ checkWeek() }
                    `
                     : html``
                }

                <label class="cool-input-time-starts cool-input" for="${id}-starts">
                    <input value=${subject ? subject.starts : ''} placeholder="&nbsp;" @change=${checkTime} id="${id}-starts" type="text" required>
                    <span class="required cool-input-label">Започва в</span>
                    <span class="cool-input-focus-bg"></span>
                </label>

                <label class="cool-input-time-ends cool-input" for="${id}-ends">
                    <input value=${subject ? subject.ends : ''} placeholder="&nbsp;" @change=${verifyTimeForm} id="${id}-ends" type="text" required>
                    <span class="required cool-input-label">Приключва в</span>
                    <span class="cool-input-focus-bg"></span>
                </label>

                <label class="cool-input cool-input-room" for="${id}-room">
                    <input value=${subject && subject.room ? subject.room : ''} title="Пример: 1.102Б" placeholder="&nbsp;" id="${id}-room" type="text">
                    <span class="cool-input-label">Учебна стая</span>
                    <span class="cool-input-focus-bg"></span>
                </label>

                <label class="cool-input cool-input-link" for="${id}-link">
                    <input value=${subject && subject.link ? subject.link : ''} placeholder="&nbsp;" id="${id}-link" type="url" title="Линк към онлайн лекция/стая">
                    <span class="cool-input-label">Линк</span>
                    <span class="cool-input-focus-bg"></span>
                </label>

                <span class="cool-input-fields">Полетата маркирани с<span class="required"> </span> са задължителни.</span>
                <button class="form-submit-check"  type="submit">Запази</button>
                <img title="Изтрий предмет" @click=${deleteSubject} class="delete-button" src="svg/delete-subject.svg"/>
            </form>
        
    `;
    render(predmet(),document.getElementById(id));

    $(document.getElementById(`${id}-starts`)).timepicker({
        minTime: '07:00',
        maxTime: '22:00',
        step: 5,
        timeFormat: 'H:i'
    });

    $(document.getElementById(`${id}-ends`)).timepicker({
        minTime: '07:15',
        maxTime: '23:40',
        step: 5,
        timeFormat: 'H:i'
    });

    $(hday).accordion("refresh");
    if ($(hday).attr('deleted') == 'true') { //if element is deleted prevent weird animation 
        $(hday).accordion("option", "active", false);
        $(hday).attr('deleted', 'false');
    }

    if (!subject)
        $(hday).accordion("option", "active", lastel - 1);
}

function checkTime(event) {
    let el = event.target;
    let startstime = el.value.split(':');

    if (!Number.isNaN(Number(startstime[0])) && !Number.isNaN(Number(startstime[1]))) { //if starts time is good, modify ends time
        let ends = el.id.split('-');
        ends[2] = 'ends';
        ends = ends.join('-');

        let tm = el.value.split(":");
        tm[1] = Number(tm[1]) + 45;
        if (tm[1] >= 60) {
            tm[1] = tm[1]-60;
            if (tm[1] == 0)
                tm[1] = '00';
            if (tm[1] < 9 && tm[1] > 0)
                tm[1] = '0'+tm[1];
            tm[0]++;
            if (tm[0] < 10)
                tm[0] = '0'+tm[0];
        }

        tm = tm.join(':')
        $('#' + ends).timepicker({
            minTime: tm,
            maxTime: '23:40',
            step: 15,
            timeFormat: 'H:i'
        });
        document.getElementById(ends).value = tm;
    }
    else {
        el.value = '08:00';
    }
    verifyTimeForm(event);
}

function verifyTimeForm(event) {
    let el = event.target;
    let regex = /^\d\d:\d\d$/;
    if (!el.value.match(/^\d\d:\d\d$/)) {
        el.setCustomValidity("Not a time.");
    } else {
        el.setCustomValidity('');
    }
}

function changeSubjectNameForm(event) {
    let el = event.target;
    el.parentNode.parentNode.parentNode.previousSibling.innerText = el.value;
    $(el.parentNode.parentNode.parentNode.parentNode).accordion("refresh");
}
///////////////////////////////////////////////

window.mobileCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
let ismobile = mobileCheck();

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