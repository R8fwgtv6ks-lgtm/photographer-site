/* ============================================================
   calendar.js — 摄影日历
   ============================================================ */

A.cp = function () {
  A.cm--;
  if (A.cm < 0) { A.cy--; A.cm = 11; }
  A.rCal();
};

A.cn = function () {
  A.cm++;
  if (A.cm > 11) { A.cy++; A.cm = 0; }
  A.rCal();
};

A.pick = function (dateStr) {
  A.cpk = dateStr;
  A.rCal();
};

A.rCal = function () {
  var y = A.cy, m = A.cm;
  document.getElementById('cmo').textContent = y + '年' + (m + 1) + '月';
  document.getElementById('cdh').innerHTML = ['日', '一', '二', '三', '四', '五', '六'].map(function (d) { return '<div class="cdh">' + d + '</div>'; }).join('');

  var days = DIM(y, m), fd = FD(y, m);
  return IDB.all('proj').then(function (projs) {
    var shootDates = {};
    for (var i = 0; i < projs.length; i++) { shootDates[projs[i].date] = true; }

    var html = '';
    var prevDays = DIM(y, m === 0 ? 11 : m - 1);
    for (var pd = fd - 1; pd >= 0; pd--) { html += '<div class="cd2 ot">' + (prevDays - pd) + '</div>'; }
    for (var d = 1; d <= days; d++) {
      var ds = y + '-' + F(m + 1) + '-' + F(d);
      var cls = 'cd2';
      if (shootDates[ds]) cls += ' st2';
      if (ds === T()) cls += ' td';
      if (ds === A.cpk) cls += ' pk';
      html += '<div class="' + cls + '" onclick="A.pick(\'' + ds + '\')">' + d + '</div>';
    }
    var rem = 7 - ((fd + days) % 7);
    if (rem < 7) { for (var nd = 1; nd <= rem; nd++) { html += '<div class="cd2 ot">' + nd + '</div>'; } }
    document.getElementById('cbd').innerHTML = html;

    // 当日拍摄列表
    var list = projs.filter(function (p) { return p.date === A.cpk; });
    document.getElementById('clt').textContent = '拍摄安排 · ' + A.cpk;
    var cl = document.getElementById('clst');
    if (list.length === 0) { cl.innerHTML = '<div class="emp"><div class="ei">' + IC('i-calendar') + '</div><p>当天无拍摄</p></div>'; }
    else { cl.innerHTML = list.map(function (p) { return A.projCard(p); }).join(''); }
  });
};
