// 代码语言标准形式（这里应该有更合理的解决方式，但是我不会写）
var code_language = {
  txt: "",
  md: "Markdown",
  markdwon: "Markdown",

  yml: "YAML",
  yaml: "YAML",
  json: "JSON",

  xml: "XML",
  html: "HTML",
  css: "CSS",
  styl: "Stylus",
  stylus: "Stylus",

  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",

  c: "C",
  "c++": "C++",
  cpp: "C++",
  cxx: "C++",
  "c#": "C#",
  cs: "C#",
  csharp: "C#",
  java: "Java"
};

// 代码语言格式化
function getLanguage(lang) {
  var lang_lower = lang.toLowerCase();
  return lang_lower in code_language ? code_language[lang_lower] : lang;
}

// 获取唯一 ID
function getUuiD() {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
}

function addLanguage() {
  // 获取所有 figure.highlight 元素
  var hs = $("figure.highlight");
  for (var i = 0; i < hs.length; i++) {
    // 获取代码语言
    var lang = hs[i].firstChild.firstChild.firstChild.lastChild.firstChild.firstChild.firstChild.classList[1];

    // 折叠块的 id
    var id = `kiyan-collapse-${getUuiD()}`;
    // 前面折叠按钮，这里我使用了 FAS 图标
    // 注意：这里是 bootstrap 的 collapse 功能的简略代码，使用时会自动补全，补全后的 HTML 可以通过浏览器 F12 查看，此外也可查看官方文档
    var btn = `<i class="iconfont .icon-arrowdown" type="button" data-toggle="collapse" data-target="#${id}"></i>`;
    // 代码语言
    var span = `<span>${getLanguage(lang)}</span>`;
    // 折叠块包裹原来的内容
    var div = `<div class="collapse show" id="${id}">${hs[i].innerHTML}</div>`;
    hs[i].innerHTML = btn + span + div;
  }
}

function init() {
  addLanguage();
}

$(document).ready(init);
