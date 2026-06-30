/* ============================================================
   utils.js — 公共工具函数
   所有不依赖项目状态的纯函数统一放在这里
   ============================================================ */

/** 生成唯一 ID */
function U() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

/** 数字补零 */
function F(n) {
  return String(n).padStart(2, '0');
}

/** 今天日期字符串 YYYY-MM-DD */
function T() {
  var d = new Date();
  return d.getFullYear() + '-' + F(d.getMonth() + 1) + '-' + F(d.getDate());
}

/** 当月索引 0-11 */
function TM() {
  return new Date().getMonth();
}

/** 当年 */
function TY() {
  return new Date().getFullYear();
}

/** 指定年月的天数 */
function DIM(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

/** 指定年月第一天是周几 (0=周日) */
function FD(y, m) {
  return new Date(y, m, 1).getDay();
}

/** 金额格式化 ¥1,234 */
function FM(n) {
  return '¥' + Number(n).toLocaleString('zh-CN');
}

/** 日期转中文显示 "6月30日" */
function FDATE(s) {
  var d = new Date(s);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

/** Toast 提示 */
function TOAST(msg) {
  var t = document.createElement('div');
  t.className = 'tst';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 2200);
}

/** 统一 SVG 图标 */
function IC(name, cls) {
  return '<svg class="' + (cls || 'ui-ic') + '"><use href="#' + name + '"></use></svg>';
}

/** 图片压缩 base64 — 高画质模式（抗锯齿） */
function compressImg(file, mw, q) {
  mw = mw || 1400;
  q = q || 0.85;
  return new Promise(function (ok) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        var w = img.width, h = img.height;
        if (w > mw) { h = Math.round(h * mw / w); w = mw; }
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, w, h);
        ok(c.toDataURL('image/jpeg', q));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
