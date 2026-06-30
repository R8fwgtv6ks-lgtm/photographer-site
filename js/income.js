/* ============================================================
   income.js — 首页渲染（今日拍摄、经营统计、清单、快捷操作）
   所有收入数据为实时计算，不存入数据库
   ============================================================ */

A.rHome = function () {
  return IDB.all('proj').then(function (projs) {
    var ts = T();
    var now = new Date();

    // ---- 今日拍摄 ----
    var todayShoots = projs.filter(function (p) { return p.date === ts && (p.stage || 0) < 4; });
    var td = document.getElementById('secToday');
    if (todayShoots.length === 0) {
      td.innerHTML = '<div class="cd empty-card"><div class="emp"><div class="ei">' + IC('i-camera') + '</div><div class="empty-card-title">今天没有拍摄</div><div class="empty-card-sub">可以整理参考图，或者好好休息</div></div></div>';
    } else {
      var s = todayShoots[0];
      var timeStr = '';
      if (s.time) {
        var parts = s.time.split(':'); var h = parseInt(parts[0]), m = parseInt(parts[1]);
        var shootT = new Date(); shootT.setHours(h, m, 0, 0);
        var diff = shootT - now;
        if (diff > 0) { var hrs = Math.floor(diff / 3600000); var mins = Math.floor((diff % 3600000) / 60000); timeStr = hrs > 0 ? '还有 ' + hrs + '小时' + mins + '分钟' : '还有 ' + mins + '分钟'; }
        else timeStr = '已到拍摄时间';
      }
      td.innerHTML = '<div class="tdc" onclick="A.editProj(\'' + s.id + '\')"><div class="td-eyebrow"><span class="td-icon">' + IC('i-camera') + '</span><span>今日拍摄</span></div><div class="bn">' + (s.custName || '未命名') + '</div><div class="bmt">' + (s.pkgName || '') + ' · ' + (s.time || '') + ' · ' + (s.loc || '') + '</div>' + (timeStr ? '<div class="btm" style="margin-top:8px">' + timeStr + '</div>' : '') + '<div style="margin-top:10px">' + A.stageTag(s.stage || 0) + '</div></div>';
    }

    // ---- 本月经营统计（全计算，不存库） ----
    var thisM = projs.filter(function (p) { var d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    var nowY = now.getFullYear(), nowM = now.getMonth();
    function inThisMonth(dateStr) {
      if (!dateStr) return false;
      var d = new Date(dateStr);
      return d.getFullYear() === nowY && d.getMonth() === nowM;
    }
    var depositIn = 0, balanceIn = 0, travelIn = 0, pendingOut = 0;
    for (var i = 0; i < projs.length; i++) {
      var pp = projs[i];
      var depAmt = pp.deposit || 0;
      var balAmt = (pp.price || 0) - depAmt;
      var travelAmt = pp.travelFee || 0;
      var depPaid = pp.depositPaid === true;
      var balPaid = pp.balancePaid === true;
      var travelPaid = pp.travelFeePaid === true;
      var depDate = pp.depositDate || (depPaid ? pp.date : '');
      var balDate = pp.balanceDate || (balPaid ? pp.date : '');
      var travelDate = pp.travelFeeDate || (travelPaid ? pp.date : '');
      if (depPaid && inThisMonth(depDate)) depositIn += depAmt;
      if (balPaid && inThisMonth(balDate)) balanceIn += balAmt;
      if (travelPaid && inThisMonth(travelDate)) travelIn += travelAmt;
      if (depPaid && !balPaid) pendingOut += balAmt;
    }
    var totalIn = depositIn + balanceIn + travelIn;
    var thisM_shoots = thisM.length;
    var avg = thisM_shoots > 0 ? Math.round(totalIn / thisM_shoots) : 0;
    document.getElementById('secStats').innerHTML = '<div class="sn">本月经营</div>' +
      '<div class="sr"><div class="sc"><div class="sv">' + FM(totalIn) + '</div><div class="sl">本月总收入</div></div><div class="sc"><div class="sv">' + FM(depositIn) + '</div><div class="sl">已收定金</div></div><div class="sc"><div class="sv">' + FM(pendingOut) + '</div><div class="sl">待收尾款</div></div></div>' +
      '<div class="sr" style="grid-template-columns:1fr 1fr"><div class="sc"><div class="sv">' + thisM_shoots + '</div><div class="sl">本月拍摄</div></div><div class="sc"><div class="sv">' + FM(avg) + '</div><div class="sl">平均客单价</div></div></div>';

    // ---- 拍摄清单（有拍摄才显示） ----
    var tom = new Date(); tom.setDate(tom.getDate() + 1);
    var tms = tom.getFullYear() + '-' + F(tom.getMonth() + 1) + '-' + F(tom.getDate());
    var hasNear = projs.some(function (p) { return p.date === ts || p.date === tms; });
    var cdv = document.getElementById('secCheck');
    if (hasNear) {
      return IDB.get('set', 'checklist').then(function (cl) {
        var items = cl ? cl.val : [];
        var html = '<div class="sn">拍摄 Checklist</div><div class="cds" id="checkItems">';
        for (var i = 0; i < items.length; i++) {
          html += '<div class="ck"><input type="checkbox" ' + (items[i].d ? 'checked' : '') + ' onchange="A.tCheck(' + i + ')"><span class="' + (items[i].d ? 'xx' : '') + '">' + items[i].t + '</span><button class="bt bt-gh bt-xs bt-ic" style="margin-left:auto;color:var(--rd)" onclick="event.stopPropagation();A.delCheckItem(' + i + ')" aria-label="删除清单项">' + IC('i-close') + '</button></div>';
        }
        html += '<div class="check-compose"><input class="fi" id="newCheckItem" placeholder="新清单项..."><button class="bt bt-o bt-xs bt-ic" onclick="A.addCheckItem()" aria-label="添加清单项">' + IC('i-plus') + '</button></div>';
        html += '</div>';
        cdv.innerHTML = html;
        cdv.style.display = 'block';
        _renderRecent(projs);
      });
    } else {
      cdv.style.display = 'none';
      _renderRecent(projs);
    }
  });
};

function _renderRecent(projs) {
  var recent = projs.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
  var rd = document.getElementById('secRecent');
  rd.innerHTML = '<div class="sn">最近项目</div>';
  if (recent.length === 0) { rd.innerHTML += '<div class="emp"><div class="ei">' + IC('i-project') + '</div>还没有项目</div>'; }
  else { for (var j = 0; j < recent.length; j++) { rd.innerHTML += A.projCard(recent[j]); } }
}

// ---- 清单操作 ----
A.tCheck = function (i) {
  return IDB.get('set', 'checklist').then(function (cl) {
    if (!cl) return;
    cl.val[i].d = !cl.val[i].d;
    return IDB.put('set', cl).then(function () { A.rHome(); });
  });
};

A.addCheckItem = function () {
  var input = document.getElementById('newCheckItem');
  var text = (input ? input.value : '').trim();
  if (!text) { TOAST('请输入内容'); return; }
  return IDB.get('set', 'checklist').then(function (cl) {
    if (!cl) cl = { id: 'checklist', val: [] };
    cl.val.push({ t: text, d: false });
    return IDB.put('set', cl).then(function () { A.rHome(); });
  });
};

A.delCheckItem = function (i) {
  if (!confirm('删除这个清单项？')) return;
  return IDB.get('set', 'checklist').then(function (cl) {
    if (!cl) return;
    cl.val.splice(i, 1);
    return IDB.put('set', cl).then(function () { A.rHome(); });
  });
};

// ---- 公共渲染工具 ----
A.stageTag = function (st) {
  var labels = ['已收定金', '已完成拍摄', '已收尾款', '已完成选片', '已完成交付'];
  var cls = ['s0', 's1', 's2', 's3', 's4'];
  return '<span class="st ' + (cls[st] || 's0') + '">' + labels[st] + '</span>';
};

A.projCard = function (p) {
  var dateText = p.date ? FDATE(p.date) : '待定日期';
  var pkgText = p.pkgName || '未设置套餐';
  var locText = p.loc || '待定地点';
  return '<div class="pj" onclick="A.editProj(\'' + p.id + '\')"><div class="pj-top"><div class="pa">' + IC('i-camera') + '</div><div class="pi"><div class="pn">' + (p.custName || '未命名客户') + '</div><div class="pm">' + pkgText + '</div></div></div><div class="pj-meta"><span class="pj-chip">' + IC('i-calendar') + '<strong>' + dateText + '</strong></span><span class="pj-chip">' + IC('i-wallet') + '<strong>¥' + (p.price || 0) + '</strong></span><span class="pj-chip">' + IC('i-folder') + '<strong>' + locText + '</strong></span></div><div class="pj-foot"><span class="pj-note">' + (p.time || '时间待定') + '</span><div>' + A.stageTag(p.stage || 0) + '</div></div></div>';
};
