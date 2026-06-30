/* ============================================================
   app.js — 应用入口、初始化、导航、资料库路由
   ============================================================ */

/** 全局应用对象 — 所有模块通过 A.xxx 挂载方法 */
var A = {};

/* ---- 初始化 A 对象的核心属性 ---- */
A.tab = 'home';
A.lt = 'res';           // 资料库子标签
A.cy = TY();            // 日历年
A.cm = TM();            // 日历月
A.cpk = T();            // 日历选中日期
A.rcf = null;           // 资源库分类筛选
A.refCf = null;         // 参考图分类筛选
A.rpf = null;           // 话术分类筛选
A._repSrch = '';        // 话术搜索词
A._repCache = {};       // 话术内容缓存（用于同步复制）

/* ---- 应用启动 ---- */
A.init = function () {
  try {
    return IDB.init().then(function () {
      return seed();
    }).then(function () {
      return A.rHome();
    }).then(function () {
      A.rCal();
    }).catch(function (e) {
      console.error('Init error:', e);
      document.getElementById('secToday').innerHTML = '<div class="cd empty-card"><div class="emp"><div class="ei"><svg class="ui-ic"><use href="#i-refresh"></use></svg></div><div class="empty-card-title">加载失败，请刷新重试</div></div></div>';
    });
  } catch (e) {
    console.error(e);
  }
};

/* ---- 页面导航 ---- */
A.nav = function (t) {
  A.tab = t;
  document.querySelectorAll('.pg').forEach(function (p) { p.classList.remove('on'); });
  var pg = document.getElementById('pg-' + t); if (pg) pg.classList.add('on');
  document.querySelectorAll('.ni').forEach(function (n) { n.classList.remove('on'); });
  var ni = document.querySelector('.ni[data-t="' + t + '"]'); if (ni) ni.classList.add('on');
  document.getElementById('hT').textContent = { home: '工作台', proj: '项目', cal: '日历', lib: '资料', cust: '客户' }[t] || '';
  if (t === 'home') A.rHome();
  if (t === 'proj') A.rProj();
  if (t === 'cal') A.rCal();
  if (t === 'lib') A.rLib();
  if (t === 'cust') A.rCust();
  window.scrollTo(0, 0);
};

/* ---- 资料库路由 ---- */
A.rLib = function () {
  document.querySelectorAll('.sti').forEach(function (t) {
    t.classList.toggle('on', t.dataset.lt === A.lt);
  });
  var c = document.getElementById('lc');
  if (A.lt === 'res') A.rRes(c);
  else if (A.lt === 'ref') A.rRef(c);
  else A.rRep(c);
};

/* ---- DOM Ready ---- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(function () {});
}
document.addEventListener('DOMContentLoaded', function () {
  A.init();
});
