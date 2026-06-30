/* ============================================================
   customer.js — 客户管理
   ============================================================ */

A.rCust = function () {
  return IDB.all('cust').then(function (custs) {
    return IDB.all('proj').then(function (projs) {
      var html = '';
      if (custs.length === 0) { html = '<div class="emp"><div class="ei">' + IC('i-user') + '</div>暂无客户</div>'; }
      else {
        for (var i = 0; i < custs.length; i++) {
          var c = custs[i];
          var cnt = projs.filter(function (p) { return p.custId === c.id; }).length;
          html += '<div class="cust-card" onclick="A.viewCust(\'' + c.id + '\')"><div class="cust-card-main"><div class="cust-card-avatar">' + IC('i-user') + '</div><div class="cust-card-copy"><div class="cust-card-name">' + c.name + '</div><div class="cust-card-meta">' + (c.phone || c.wx || '暂未填写联系方式') + '</div></div><span class="cust-card-arrow">' + IC('i-chevron-right') + '</span></div><div class="cust-card-foot"><span class="cust-pill">' + cnt + ' 次拍摄</span><span class="cust-foot-note">查看历史与信息</span></div></div>';
        }
      }
      document.getElementById('custL').innerHTML = html;
    });
  });
};

A.viewCust = function (id) {
  return IDB.get('cust', id).then(function (c) {
    if (!c) return;
    return IDB.all('proj').then(function (projs) {
      var cp = projs.filter(function (p) { return p.custId === c.id; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
      var o = document.createElement('div'); o.className = 'mo';
      o.innerHTML = '<div class="ms"><div class="cust-detail"><div class="cust-detail-avatar">' + IC('i-user') + '</div><h3>' + c.name + '</h3><div class="cust-detail-meta">' + (c.phone || '未填写手机') + (c.wx ? ' · ' + c.wx : '') + '</div><div class="cust-detail-stats"><div class="cust-stat"><span class="cust-stat-num">' + cp.length + '</span><span class="cust-stat-label">历史项目</span></div><div class="cust-stat"><span class="cust-stat-num">' + (cp[0] && cp[0].date ? FDATE(cp[0].date) : '暂无') + '</span><span class="cust-stat-label">最近一次</span></div></div></div><div class="sn">历史项目</div>' + (cp.length === 0 ? '<div class="emp"><p>暂无项目</p></div>' : cp.map(function (p) { return A.projCard(p); }).join('')) + '<div class="ma"><button class="bt bt-p" onclick="this.closest(\'.mo\').remove();A.editCust(\'' + c.id + '\')">' + IC('i-edit') + '编辑</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">关闭</button></div>';
      document.body.appendChild(o);
      o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    });
  });
};

A.newCust = function () { A.editCust(null); };

A.editCust = function (id) {
  return IDB.get('cust', id || '').then(function (c) {
    var o = document.createElement('div'); o.className = 'mo';
    o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-user') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (c ? '编辑客户' : '添加客户') + '</div><div class="sheet-hero-sub">维护联系人信息，方便后续档期与回访管理</div></div></div><div class="form-sec form-sec-card"><div class="form-sec-hd"><div class="form-sec-title">基础信息</div><div class="form-sec-sub">客户昵称与对外联系方式</div></div><div class="fg"><label class="fl">头像标识</label><input class="fi" id="efCustAv" placeholder="可留空，或输入一个简短标识" value="' + (c ? c.av || '' : '') + '"></div><div class="fg"><label class="fl">昵称</label><input class="fi" id="efCustName2" value="' + (c ? c.name : '') + '"></div><div class="fg"><label class="fl">手机</label><input class="fi" id="efCustPh" value="' + (c ? c.phone || '' : '') + '"></div><div class="fg" style="margin-bottom:0"><label class="fl">微信</label><input class="fi" id="efCustWx" value="' + (c ? c.wx || '' : '') + '"></div></div><div class="ma">' + (c ? '<button class="bt bt-dr" onclick="A.delCust(\'' + c.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveCust(\'' + (id || '') + '\')">保存</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
  });
};

A.saveCust = function (id) {
  var name = document.getElementById('efCustName2').value.trim();
  if (!name) { TOAST('请输入昵称'); return; }
  if (id) {
    return IDB.get('cust', id).then(function (c) {
      if (c) {
        c.name = name; c.av = document.getElementById('efCustAv').value.trim();
        c.phone = document.getElementById('efCustPh').value.trim();
        c.wx = document.getElementById('efCustWx').value.trim();
        return IDB.put('cust', c).then(function () {
          document.querySelector('.mo').remove(); A.rCust(); TOAST('已保存');
        });
      }
    });
  } else {
    return IDB.put('cust', {
      id: U(), name: name, av: document.getElementById('efCustAv').value.trim(),
      phone: document.getElementById('efCustPh').value.trim(),
      wx: document.getElementById('efCustWx').value.trim(),
      createdAt: new Date().toISOString()
    }).then(function () {
      document.querySelector('.mo').remove(); A.rCust(); TOAST('已保存');
    });
  }
};

A.delCust = function (id) {
  if (!confirm('确认删除？')) return;
  return IDB.del('cust', id).then(function () {
    document.querySelector('.mo').remove(); A.rCust(); TOAST('已删除');
  });
};
