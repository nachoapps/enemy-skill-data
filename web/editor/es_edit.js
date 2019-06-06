var esURL = 'http://miru.info/utils/get_es_info.php?monster_id=';
var esData;
var esRaw;
function appendElement(parent, tag, css, name, value, text) {
    var child = document.createElement(tag);
    if (!!name) {
        child.name = name;
        child.id = name;
    }
    if (!!css) {
        child.className = css;
    }
    if (!!text) {
        var textnode = document.createTextNode(text);
        child.appendChild(textnode);
    }
    if (!!value) {
        child.value = value;
    }
    parent.appendChild(child);
    return child;
}
class SkillRecordListing {
    constructor(level, overrides, records) {
        this.level = level;
        this.overrides = overrides;
        this.records = records;
    }
}
var SkillRecordListingYaml = new jsyaml.Type('!SkillRecordListing', {
    kind: 'mapping',
    construct: function (data) {
        data = data || {};
        return new SkillRecordListing(data.level || 0, data.overrides || [], data.records || []);
    },
    instanceOf: SkillRecordListing
});
class SkillRecord {
    constructor(record_type_name, name_en, name_jp, desc_en, desc_jp, one_time, usage_pct, max_atk_pct) {
        this.record_type_name = record_type_name;
        this.name_en = name_en;
        this.name_jp = name_jp;
        this.desc_en = desc_en;
        this.desc_jp = desc_jp;
        this.one_time = one_time;
        this.usage_pct = usage_pct;
        this.max_atk_pct = max_atk_pct;
    }
}
var SkillRecordYaml = new jsyaml.Type('!SkillRecord', {
    kind: 'mapping',
    construct: function (data) {
        data = data || {};
        return new SkillRecord(
            data.record_type_name || '',
            data.name_en || '',
            data.name_jp || '',
            data.desc_en || '',
            data.desc_jp || '',
            data.one_time || 0,
            data.usage_pct || 0,
            data.max_atk_pct || undefined,
        );
    },
    instanceOf: SkillRecord
});
var ES_SCHEMA = jsyaml.Schema.create([SkillRecordListingYaml, SkillRecordYaml]);
function populateEnemyForm() {
    var editPanel = document.getElementById('enemy_editor');
    var eLvlSelect = document.getElementById('enemy_level_select');
    var populateSelect = eLvlSelect.innerHTML === '';

    editPanel.innerHTML = '';
    var infoPanel = document.createElement('div');
    infoPanel.id = 'panel-info';
    infoPanel.className = 'panel';
    appendElement(infoPanel, 'h2', undefined, undefined, undefined, 'Info:');
    appendElement(infoPanel, 'pre', undefined, 'edit-info', undefined, esData.info);
    editPanel.appendChild(infoPanel);

    var hideLvl = false;
    for (var lvl in esData.levels) {
        if (populateSelect) {
            appendElement(eLvlSelect, 'option', undefined, undefined, lvl, lvl);
        }

        var lvlPanel = document.createElement('div');
        if (hideLvl) {
            lvlPanel.style.display = "none";
        } else {
            hideLvl = true;
        }
        lvlPanel.className = 'panel';
        lvlPanel.id = 'panel-lvl-' + lvl;
        appendElement(lvlPanel, 'h2', undefined, undefined, undefined, 'Processed:')
        appendElement(lvlPanel, 'pre', 'processed', 'processed-lvl-' + lvl, undefined, esData.levels[lvl].processed);
        appendElement(lvlPanel, 'h2', undefined, undefined, undefined, 'Raw:');

        var raw = appendElement(lvlPanel, 'div', 'raw', 'raw-lvl-' + lvl, undefined, undefined);
        esRaw = jsyaml.load(esData.levels[lvl].raw, { schema: ES_SCHEMA });
        var currentRecordType = undefined;
        for (var idx in esRaw.records) {
            var record = esRaw.records[idx];
            var recordDiv = appendElement(raw, 'div', 'record', 'record-' + lvl + '-' + idx);
            for (var key in record) {
                var recordID = lvl + '-' + idx + '-' + key;
                if (key === 'record_type_name') {
                    appendElement(recordDiv, 'h3', 'record-type', 'record-' + recordID, undefined, record[key]);
                    currentRecordType = record[key];
                } else if (currentRecordType === 'DIVIDER' && key != 'name_en' && key != 'name_jp') {
                    continue;
                } else if (key === 'desc_en' || key === 'desc_jp') {
                    appendElement(recordDiv, 'p', undefined, undefined, undefined, key);
                    appendElement(recordDiv, 'textarea', 'record-entry', 'input-' + recordID, record[key], undefined);
                } else {
                    appendElement(recordDiv, 'p', undefined, undefined, undefined, key);
                    appendElement(recordDiv, 'input', 'record-entry', 'input-' + recordID, record[key], undefined);
                }
            }
        }
        editPanel.appendChild(lvlPanel);
        $(".raw").sortable();
        $(".raw").disableSelection();
    }
}
function loadEnemyForm() {
    var statusMsg = document.getElementById('status_msg');
    statusMsg.style.display = 'block';
    statusMsg.innerHTML = 'Loading...';
    var xmlhttp = new XMLHttpRequest();
    var monID = this.value || '1000';
    xmlhttp.open("GET", esURL + monID);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
        document.getElementById('enemy_editor').innerHTML = '';
        if (this.readyState === 4) {
            if (this.status === 200 && this.responseText !== '') {
                statusMsg.innerHTML = '';
                statusMsg.style.display = 'none';
                esData = JSON.parse(this.responseText);
                populateEnemyForm();
            } else {
                statusMsg.innerHTML = 'Enemy data not found.';
            }
        } else {
            statusMsg.innerHTML = 'Loading...';
        }
    };
}
function changeLvl() {
    var panels = document.querySelectorAll('div[id^="panel-lvl"]');
    for (var p in panels) {
        if (panels.hasOwnProperty(p)) {
            if (panels[p].id === 'panel-lvl-' + document.getElementById('enemy_level_select').value) {
                panels[p].style.display = 'block';
            } else {
                panels[p].style.display = 'none';
            }
        }
    }
}
window.onload = function () {
    loadEnemyForm();
    document.getElementById('enemy_id').addEventListener('change', loadEnemyForm)
    document.getElementById('reload').addEventListener('click', function () {
        populateEnemyForm();
        changeLvl();
    })
    document.getElementById('enemy_level_select').addEventListener('change', changeLvl)
}