/* ============================================================
   project.js — Project（项目）CRUD、进度条、收款卡片
   所有方法挂载到全局 A 对象
   ============================================================ */

// ---- 项目列表 ----
A.rProj = function (filter) {
  filter = filter || 'all';
  return IDB.all('proj').then(function (projs) {
    var f = projs;
    if (filter === 'active') f = projs.filter(function (p) { return (p.stage || 0) < 4; });
    if (filter === 'done') f = projs.filter(function (p) { return (p.stage || 0) >= 4; });
    f.sort(function (a, b) { return b.date.localeCompare(a.date); });
    var html = '';
    if (f.length === 0) { html = '<div class="emp"><div class="ei">' + IC('i-project') + '</div>暂无项目</div>'; }
    else { for (var i = 0; i < f.length; i++) { html += A.projCard(f[i]); } }
    document.getElementById('plist').innerHTML = html;
    document.getElementById('pf').innerHTML =
      '<button class="fpi' + (filter === 'all' ? ' on' : '') + '" onclick="A.rProj(\'all\')">全部</button>' +
      '<button class="fpi' + (filter === 'active' ? ' on' : '') + '" onclick="A.rProj(\'active\')">进行中</button>' +
      '<button class="fpi' + (filter === 'done' ? ' on' : '') + '" onclick="A.rProj(\'done\')">已完成</button>';
  });
};

A.newProj = function () { A.editProj(null); };

// ---- 项目编辑/新建弹窗 ----
A.editProj = function (id) {
  return IDB.all('proj').then(function (projs) {
    var p = id ? projs.find(function (x) { return x.id === id; }) : null;
    return Promise.all([IDB.all('cust'), IDB.all('pkg'), IDB.all('addon')]).then(function (res) {
      var custs = res[0], pkgs = res[1], addons = res[2];

      // 历史地点 & 来源
      var locs = [], srcs = [], seenL = {}, seenS = {};
      for (var i = 0; i < projs.length; i++) {
        var l = projs[i].loc; if (l && !seenL[l]) { seenL[l] = true; locs.push(l); }
        var sr = projs[i].src; if (sr && !seenS[sr]) { seenS[sr] = true; srcs.push(sr); }
      }

      var overlay = document.createElement('div'); overlay.className = 'mo';
      var html = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-project') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (p ? '项目详情' : '新建项目') + '</div><div class="sheet-hero-sub">' + (p ? '查看档期、价格、收款与执行进度' : '建立新的拍摄项目，保持信息完整一致') + '</div></div></div>';

      if (p) {
        html += '<div class="proj-hero">' +
          '<div class="proj-hero-main">' +
          '<div class="proj-hero-icon">' + IC('i-camera') + '</div>' +
          '<div class="proj-hero-copy"><div class="proj-hero-title">' + (p.custName || '未命名客户') + '</div><div class="proj-hero-meta">' + (p.date ? FDATE(p.date) : '待定日期') + (p.time ? ' · ' + p.time : '') + (p.loc ? ' · ' + p.loc : '') + '</div></div>' +
          '</div>' +
          '<div class="proj-hero-side">' + A.stageTag(p.stage || 0) + '</div>' +
          '</div>';
      }

      html += '<div class="proj-grid">';

      // 进度条（仅已有项目显示）
      if (p) {
        var stages = ['已收定金', '已完成拍摄', '已收尾款', '已完成选片', '已完成交付'];
        html += '<div class="proj-sec proj-sec-card"><div class="proj-sec-hd"><div class="proj-sec-title">项目进度</div><div class="proj-sec-sub">轻点节点更新阶段</div></div><div class="pb">';
        for (var si = 0; si < 5; si++) {
          var cls = '';
          if (si < (p.stage || 0)) cls = 'dn';
          else if (si === (p.stage || 0)) cls = 'cu';
          html += '<div class="ps ' + cls + '" onclick="A.advStage(\'' + p.id + '\',' + si + ')"><div class="pd"></div><div class="pl">' + stages[si] + '</div></div>';
        }
        html += '</div></div>';
      }

      // 客户
      html += '<div class="proj-sec proj-sec-card"><div class="proj-sec-hd"><div class="proj-sec-title">客户与来源</div><div class="proj-sec-sub">绑定客户、记录获客入口</div></div>';
      html += '<div class="fg"><label class="fl">客户</label><select class="fs" id="efCust"><option value="">选择客户</option>';
      for (var j = 0; j < custs.length; j++) { html += '<option value="' + custs[j].id + '"' + (p && p.custId === custs[j].id ? ' selected' : '') + '>' + custs[j].name + '</option>'; }
      html += '</select><input class="fi" id="efCustName" placeholder="或手动输入姓名" value="' + (p && !p.custId ? (p.custName || '') : '') + '" style="margin-top:6px"></div>';

      // 来源（含历史datalist）
      html += '<div class="fg"><label class="fl">来源</label><input class="fi" id="efSrc" list="srcList" placeholder="小红书/微信/朋友介绍..." value="' + (p ? p.src || '' : '') + '"><datalist id="srcList">';
      for (var si2 = 0; si2 < srcs.length; si2++) { html += '<option value="' + srcs[si2] + '">'; }
      html += '</datalist></div></div>';

      // 套餐下拉
      html += '<div class="proj-sec proj-sec-card"><div class="proj-sec-hd"><div class="proj-sec-title">套餐与报价</div><div class="proj-sec-sub">调整套餐、价格和附加项</div></div>';
      html += '<div class="fg"><label class="fl">套餐</label><select class="fs" id="efPkg" onchange="A.onPkgChange()"><option value="">手动填写</option>';
      for (var k = 0; k < pkgs.length; k++) {
        html += '<option value="' + pkgs[k].id + '" data-price="' + pkgs[k].price + '" data-name="' + pkgs[k].name + '"' + (p && p.pkgId === pkgs[k].id ? ' selected' : '') + '>' + pkgs[k].name + ' - ¥' + pkgs[k].price + '/' + pkgs[k].unit + '</option>';
      }
      html += '</select></div>';
      html += '<div class="fg"><label class="fl">价格（元）</label><input type="number" class="fi" id="efPrice" value="' + (p ? p.price || '' : '') + '"></div>';

      // 附加项
      if (addons.length > 0) {
        html += '<div class="fg"><label class="fl">附加选项</label><div class="addon-list">';
        for (var ai = 0; ai < addons.length; ai++) {
          var checked = p && p.addonIds && p.addonIds.indexOf(addons[ai].id) >= 0;
          html += '<label class="addon-row"><input type="checkbox" class="efAddon" value="' + addons[ai].id + '" data-price="' + addons[ai].price + '" data-name="' + addons[ai].name + '"' + (checked ? ' checked' : '') + ' onchange="A.onAddonChange()"><span class="addon-copy"><span class="addon-title">' + addons[ai].name + '</span><span class="addon-meta">+¥' + addons[ai].price + (addons[ai].desc ? ' · ' + addons[ai].desc : '') + '</span></span></label>';
        }
        html += '</div></div>';
      }
      html += '</div>';

      // 收款卡片
      var depAmt = p ? p.deposit || 0 : 0;
      var balAmt = (p ? p.price || 0 : 0) - depAmt;
      var travelAmt = p ? p.travelFee || 0 : 0;
      var depChk = p ? p.depositPaid === true : false;
      var balChk = p ? p.balancePaid === true : false;
      var travelChk = p ? p.travelFeePaid === true : false;
      var depDate = p ? p.depositDate || (depChk ? p.date : '') : '';
      var balDate = p ? p.balanceDate || (balChk ? p.date : '') : '';
      var travelDate = p ? p.travelFeeDate || (travelChk ? p.date : '') : '';
      var autoSave = p ? 'A.quickSavePay(\'' + p.id + '\')' : '';
      html += '<div class="proj-sec"><div class="proj-sec-hd"><div class="proj-sec-title">收款信息</div><div class="proj-sec-sub">保持付款状态清晰可追踪</div></div><div class="cds pay-card" style="margin-bottom:14px">' +
        '<div class="pay-top"><span class="pay-top-label">套餐总价</span><span class="pay-top-value">¥<span id="payTotal">' + (p ? p.price || 0 : 0) + '</span></span></div>' +
        '<div class="pay-row"><div class="pay-row-main"><span class="pay-row-title">定金</span><span class="pay-row-note">先确认档期</span></div><input type="number" class="fi pay-input" id="efDeposit" value="' + depAmt + '" placeholder="0" oninput="A.updatePayCard();' + autoSave + '"></div>' +
        '<div class="pay-meta"><label class="pay-toggle"><input type="checkbox" id="efDepositPaid" ' + (depChk ? 'checked' : '') + ' onchange="if(this.checked){document.getElementById(\'efDepDate\').value=T();}A.updatePayCard();' + autoSave + '"><span>已收</span></label><input type="date" class="fi pay-date" id="efDepDate" value="' + depDate + '" onchange="' + autoSave + '"></div>' +
        '<div class="pay-split"></div>' +
        '<div class="pay-row"><div class="pay-row-main"><span class="pay-row-title">尾款</span><span class="pay-row-note">交付前确认</span></div><span class="pay-balance" id="payBalance">¥' + balAmt + '</span></div>' +
        '<div class="pay-meta"><label class="pay-toggle"><input type="checkbox" id="efBalancePaid" ' + (balChk ? 'checked' : '') + ' onchange="if(this.checked){document.getElementById(\'efBalDate\').value=T();}A.updatePayCard();' + autoSave + '"><span>已收</span></label><input type="date" class="fi pay-date" id="efBalDate" value="' + balDate + '" onchange="' + autoSave + '"></div>' +
        '<div class="pay-split"></div>' +
        '<div class="pay-row"><div class="pay-row-main"><span class="pay-row-title">路费</span><span class="pay-row-note">异地拍摄补充</span></div><input type="number" class="fi pay-input" id="efTravelFee" value="' + travelAmt + '" placeholder="0" oninput="A.updatePayCard();' + autoSave + '"></div>' +
        '<div class="pay-meta"><label class="pay-toggle"><input type="checkbox" id="efTravelFeePaid" ' + (travelChk ? 'checked' : '') + ' onchange="if(this.checked){document.getElementById(\'efTravelDate\').value=T();}A.updatePayCard();' + autoSave + '"><span>已收</span></label><input type="date" class="fi pay-date" id="efTravelDate" value="' + travelDate + '" onchange="' + autoSave + '"></div>' +
        '</div></div>';

      // 日期/时间/地点
      html += '<div class="proj-sec proj-sec-card"><div class="proj-sec-hd"><div class="proj-sec-title">拍摄安排</div><div class="proj-sec-sub">确定档期、时长与地点</div></div>';
      html += '<div class="fg"><label class="fl">日期</label><input type="date" class="fi" id="efDate" value="' + (p ? p.date : T()) + '"></div>';
      html += '<div class="fg"><label class="fl">时间</label><div class="time-row"><input type="time" class="fi" id="efTime" value="' + (p ? p.time || '' : '') + '" oninput="A.calcEndTime()" style="flex:1"><span class="time-sep">结束</span><span id="efEndTime" class="time-end"></span></div></div>';
      html += '<div class="fg"><label class="fl">地点</label><input class="fi" id="efLoc" list="locList" placeholder="拍摄地址" value="' + (p ? p.loc || '' : '') + '"><datalist id="locList">';
      for (var li = 0; li < locs.length; li++) { html += '<option value="' + locs[li] + '">'; }
      html += '</datalist></div></div>';
      html += '<div class="proj-sec proj-sec-card"><div class="proj-sec-hd"><div class="proj-sec-title">补充备注</div><div class="proj-sec-sub">记录场地、服装或交付说明</div></div><div class="fg" style="margin-bottom:0"><label class="fl">备注</label><textarea class="ft" id="efNotes">' + (p ? p.notes || '' : '') + '</textarea></div></div>';
      html += '</div>';

      html += '<div class="ma">' + (p ? '<button class="bt bt-dr" onclick="A.delProj(\'' + p.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveProj(\'' + (id || '') + '\')">保存</button></div>';
      html += '<button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';

      overlay.innerHTML = html;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
      setTimeout(function () { A.calcEndTime(); }, 50);
    });
  });
};

// ---- 套餐变更 ----
A.onPkgChange = function () {
  var sel = document.getElementById('efPkg');
  var opt = sel.options[sel.selectedIndex];
  var price = opt.getAttribute('data-price');
  if (price) document.getElementById('efPrice').value = price;
  A.onAddonChange();
  A.calcEndTime();
};

A.onAddonChange = function () {
  var total = Number(document.getElementById('efPrice').value) || 0;
  var sel = document.getElementById('efPkg');
  var opt = sel.options[sel.selectedIndex];
  var basePrice = opt.getAttribute('data-price');
  if (!basePrice) basePrice = total;
  else basePrice = Number(basePrice);
  var addonTotal = 0;
  var cbs = document.querySelectorAll('.efAddon:checked');
  for (var i = 0; i < cbs.length; i++) { addonTotal += Number(cbs[i].getAttribute('data-price')) || 0; }
  document.getElementById('efPrice').value = basePrice + addonTotal;
  A.updatePayCard();
};

// ---- 收款卡片更新 ----
A.updatePayCard = function () {
  var price = Number(document.getElementById('efPrice').value) || 0;
  var dep = Number(document.getElementById('efDeposit').value) || 0;
  var bal = price - dep;
  var pt = document.getElementById('payTotal'); if (pt) pt.textContent = price;
  var pb = document.getElementById('payBalance'); if (pb) pb.textContent = '¥' + bal;
};

// ---- 收款状态即时保存 ----
A.quickSavePay = function (id) {
  if (!id) return;
  return IDB.get('proj', id).then(function (p) {
    if (!p) return;
    p.deposit = Number(document.getElementById('efDeposit').value) || 0;
    p.depositPaid = document.getElementById('efDepositPaid').checked;
    p.balancePaid = document.getElementById('efBalancePaid').checked;
    p.travelFee = Number(document.getElementById('efTravelFee').value) || 0;
    p.travelFeePaid = document.getElementById('efTravelFeePaid').checked;
    var depDate = document.getElementById('efDepDate'); if (depDate) p.depositDate = depDate.value;
    var balDate = document.getElementById('efBalDate'); if (balDate) p.balanceDate = balDate.value;
    var travelDate = document.getElementById('efTravelDate'); if (travelDate) p.travelFeeDate = travelDate.value;
    p.updatedAt = new Date().toISOString();
    return IDB.put('proj', p).then(function () { A.rHome(); });
  });
};

// ---- 结束时间计算 ----
A.calcEndTime = function () {
  var t = document.getElementById('efTime'); if (!t) return;
  var pkgSel = document.getElementById('efPkg');
  var opt = pkgSel.options[pkgSel.selectedIndex];
  var unit = opt ? opt.textContent || '' : '';
  var end = A._calcEnd(t.value, unit);
  document.getElementById('efEndTime').textContent = end;
};

A._calcEnd = function (timeVal, pkgUnit) {
  if (!timeVal) return '';
  var unit = pkgUnit || '';
  var parts = timeVal.split(':'); var h = parseInt(parts[0]) || 0; var min = parseInt(parts[1]) || 0;
  var totalMin = h * 60 + min;
  var dur = 0;
  if (unit.indexOf('半小时') >= 0) dur = 30;
  else if (unit.indexOf('一小时') >= 0) dur = 60;
  else if (unit.indexOf('两小时') >= 0) dur = 120;
  else if (unit.indexOf('半') >= 0) dur = 30;
  else if (unit.indexOf('一') >= 0) dur = 60;
  else if (unit.indexOf('两') >= 0) dur = 120;
  if (!dur) return '';
  totalMin += dur;
  var eh = Math.floor(totalMin / 60) % 24; var em = totalMin % 60;
  return F(eh) + ':' + F(em);
};

// ---- 保存项目 ----
A.saveProj = function (id) {
  var pkgSel = document.getElementById('efPkg');
  var pkgOpt = pkgSel.options[pkgSel.selectedIndex];
  var pkgId = pkgSel.value || null;
  var pkgName = pkgId ? (pkgOpt.getAttribute('data-name') || pkgOpt.textContent) : '';

  var addonIds = [], addonNames = [], addonPrices = [];
  var cbs = document.querySelectorAll('.efAddon:checked');
  for (var ai = 0; ai < cbs.length; ai++) {
    addonIds.push(cbs[ai].value);
    addonNames.push(cbs[ai].getAttribute('data-name'));
    addonPrices.push(Number(cbs[ai].getAttribute('data-price')) || 0);
  }

  var depAmt = Number(document.getElementById('efDeposit').value) || 0;
  var depPaid = document.getElementById('efDepositPaid') ? document.getElementById('efDepositPaid').checked : false;
  var balPaid = document.getElementById('efBalancePaid') ? document.getElementById('efBalancePaid').checked : false;
  var travelAmt = Number(document.getElementById('efTravelFee').value) || 0;
  var travelPaid = document.getElementById('efTravelFeePaid') ? document.getElementById('efTravelFeePaid').checked : false;
  var depDate = document.getElementById('efDepDate') ? document.getElementById('efDepDate').value : '';
  var balDate = document.getElementById('efBalDate') ? document.getElementById('efBalDate').value : '';
  var travelDate = document.getElementById('efTravelDate') ? document.getElementById('efTravelDate').value : '';

  if (depAmt > 0 && !id) { depPaid = true; }

  var p = {
    id: id || U(),
    custId: document.getElementById('efCust').value || null,
    custName: document.getElementById('efCustName').value.trim(),
    src: document.getElementById('efSrc').value.trim(),
    pkgId: pkgId,
    pkgName: pkgName || document.getElementById('efPkg').value.trim(),
    price: Number(document.getElementById('efPrice').value) || 0,
    deposit: depAmt,
    depositPaid: depPaid,
    balancePaid: balPaid,
    depositDate: depDate || (depPaid ? document.getElementById('efDate').value : ''),
    balanceDate: balDate || (balPaid ? document.getElementById('efDate').value : ''),
    travelFee: travelAmt,
    travelFeePaid: travelPaid,
    travelFeeDate: travelDate || (travelPaid ? document.getElementById('efDate').value : ''),
    addonIds: addonIds,
    addonNames: addonNames,
    addonPrices: addonPrices,
    date: document.getElementById('efDate').value,
    time: document.getElementById('efTime').value,
    loc: document.getElementById('efLoc').value.trim(),
    notes: document.getElementById('efNotes').value.trim()
  };

  if (!p.custName) {
    var cid = document.getElementById('efCust').value;
    if (cid) {
      return IDB.get('cust', cid).then(function (c) {
        p.custName = c ? c.name : '未命名';
        return _finishSave(p, id);
      });
    } else { p.custName = '未命名'; }
  }
  return _finishSave(p, id);
};

function _finishSave(p, id) {
  if (id) {
    return IDB.get('proj', id).then(function (old) {
      if (old) { p.stage = old.stage || 0; p.createdAt = old.createdAt; }
      p.updatedAt = new Date().toISOString();
      return IDB.put('proj', p).then(function () {
        document.querySelector('.mo').remove();
        if (A.tab === 'proj') A.rProj();
        if (A.tab === 'home') A.rHome();
        if (A.tab === 'cal') A.rCal();
        TOAST('已更新');
      });
    });
  } else {
    p.stage = 0; p.createdAt = new Date().toISOString(); p.updatedAt = new Date().toISOString();
    return IDB.put('proj', p).then(function () {
      document.querySelector('.mo').remove();
      if (A.tab === 'proj') A.rProj();
      if (A.tab === 'home') A.rHome();
      if (A.tab === 'cal') A.rCal();
      TOAST('项目已创建');
    });
  }
}

// ---- 删除项目 ----
A.delProj = function (id) {
  if (!confirm('确认删除？')) return;
  return IDB.del('proj', id).then(function () {
    document.querySelector('.mo').remove();
    if (A.tab === 'proj') A.rProj();
    if (A.tab === 'home') A.rHome();
    TOAST('已删除');
  });
};

// ---- 推进阶段 ----
A.advStage = function (id, stage) {
  return IDB.get('proj', id).then(function (p) {
    if (!p) return;
    p.stage = stage; p.updatedAt = new Date().toISOString();
    return IDB.put('proj', p).then(function () {
      document.querySelector('.mo').remove();
      A.editProj(id);
    });
  });
};
