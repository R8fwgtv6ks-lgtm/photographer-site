/* ============================================================
   backup.js — 设置、数据导出导入、套餐/附加项管理
   ============================================================ */

A.openSet = function () {
  return IDB.get('set', 'lastBackup').then(function (lb) {
    var lbStr = lb && lb.val ? new Date(lb.val).toLocaleString('zh-CN') : '尚未备份';
    return IDB.all('pkg').then(function (pkgs) {
      return IDB.all('addon').then(function (addons) {
        var pkgList = '';
        for (var i = 0; i < pkgs.length; i++) {
          pkgList += '<div class="set-row"><div class="set-row-copy"><div class="set-row-title">' + pkgs[i].name + (pkgs[i].featured ? ' <span class="tg tg-p">推荐</span>' : '') + '</div><div class="set-row-meta">¥' + pkgs[i].price + '/' + pkgs[i].unit + (pkgs[i].desc ? ' · ' + pkgs[i].desc : '') + '</div></div><button class="bt bt-gh bt-xs bt-ic" onclick="A.editPkg(\'' + pkgs[i].id + '\')">' + IC('i-edit') + '</button></div>';
        }
        var addonList = '';
        for (var j = 0; j < addons.length; j++) {
          addonList += '<div class="set-row"><div class="set-row-copy"><div class="set-row-title">' + addons[j].name + '</div><div class="set-row-meta">+¥' + addons[j].price + (addons[j].desc ? ' · ' + addons[j].desc : '') + '</div></div><button class="bt bt-gh bt-xs bt-ic" onclick="A.editAddon(\'' + addons[j].id + '\')">' + IC('i-edit') + '</button></div>';
        }

        var o = document.createElement('div'); o.className = 'mo';
        o.innerHTML = '<div class="ms"><h3>设置</h3>' +
          '<div class="set-hero"><div class="set-hero-icon">' + IC('i-settings') + '</div><div class="set-hero-copy"><div class="set-hero-title">摄影工作台</div><div class="set-hero-sub">管理套餐、附加项和本地备份</div></div></div>' +
          '<div class="cds set-block"><div class="set-block-hd"><div class="ct" style="font-size:14px">套餐管理</div><div class="set-block-sub">维护常用套餐与报价模板</div></div>' + pkgList +
          '<button class="bt bt-o bt-s bt-fw" onclick="A.editPkg()" style="margin-top:8px">' + IC('i-plus') + '添加套餐</button></div>' +
          '<div class="cds set-block"><div class="set-block-hd"><div class="ct" style="font-size:14px">附加选项</div><div class="set-block-sub">补充路费、花絮等增值项目</div></div>' + addonList +
          '<button class="bt bt-o bt-s bt-fw" onclick="A.editAddon()" style="margin-top:8px">' + IC('i-plus') + '添加附加项</button></div>' +
          '<div class="cds set-block"><div class="set-block-hd"><div class="ct" style="font-size:14px">数据备份</div><div class="set-block-sub">上次备份：' + lbStr + '</div></div><div class="inline-note">建议每周备份一次，导出后可保存到 iCloud、网盘等</div><div class="stack-actions"><button class="bt bt-p bt-s" onclick="A.exportAll()">' + IC('i-download') + '导出数据</button><button class="bt bt-o bt-s" onclick="document.getElementById(\'impF\').click()">' + IC('i-upload') + '导入数据</button></div><input type="file" id="impF" accept=".json" style="display:none"></div>' +
          '<div class="cds set-block"><div class="set-block-hd"><div class="ct" style="font-size:14px">关于</div><div class="set-block-sub">本地优先、轻量记录、减少重复工作</div></div><div class="inline-note">摄影工作台 v1.0<br>数据完全存储在本地，不上传任何信息<br>遵循「记录，而不是管理」原则</div></div>' +
          '<button class="bt bt-dr bt-s bt-fw" onclick="A.resetAll()">' + IC('i-alert') + '重置所有数据</button>' +
          '<button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">关闭</button></div>';
        document.body.appendChild(o);
        o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
        setTimeout(function () {
          var imp = document.getElementById('impF'); if (imp) imp.onchange = function (e) { A.importAll(e); };
        }, 100);
      });
    });
  });
};

// ---- 套餐管理 ----
A.editPkg = function (id) {
  return IDB.all('pkg').then(function (pkgs) {
    var p = id ? pkgs.find(function (x) { return x.id === id; }) : null;
    var o = document.createElement('div'); o.className = 'mo';
    o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-wallet') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (p ? '编辑套餐' : '添加套餐') + '</div><div class="sheet-hero-sub">统一常用报价、时长与套餐说明</div></div></div>' +
      '<div class="form-sec form-sec-card"><div class="form-sec-hd"><div class="form-sec-title">套餐信息</div><div class="form-sec-sub">面向客户展示的核心报价内容</div></div><div class="fg"><label class="fl">套餐名称</label><input class="fi" id="efPkgName" value="' + (p ? p.name : '') + '"></div>' +
      '<div class="fg"><label class="fl">价格（元）</label><input type="number" class="fi" id="efPkgPrice" value="' + (p ? p.price : '') + '"></div>' +
      '<div class="fg"><label class="fl">时长单位</label><input class="fi" id="efPkgUnit" placeholder="如：半小时" value="' + (p ? p.unit : '') + '"></div>' +
      '<div class="fg"><label class="fl">描述</label><input class="fi" id="efPkgDesc" value="' + (p ? p.desc : '') + '"></div>' +
      '<div class="fg"><label class="fl">包含内容（每行一个）</label><textarea class="ft" id="efPkgFeat">' + (p ? p.features : '') + '</textarea></div>' +
      '<div class="check-row"><input type="checkbox" id="efPkgFd"' + (p && p.featured ? ' checked' : '') + '><span>设为推荐套餐</span></div></div>' +
      '<div class="ma">' + (p ? '<button class="bt bt-dr" onclick="A.delPkg(\'' + p.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.savePkg(\'' + (id || '') + '\')">保存</button></div>' +
      '<button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
  });
};

A.savePkg = function (id) {
  var name = document.getElementById('efPkgName').value.trim();
  if (!name) { TOAST('请输入套餐名称'); return; }
  var data = { id: id || U(), name: name, price: Number(document.getElementById('efPkgPrice').value) || 0, unit: document.getElementById('efPkgUnit').value.trim(), desc: document.getElementById('efPkgDesc').value.trim(), features: document.getElementById('efPkgFeat').value.trim(), featured: document.getElementById('efPkgFd').checked };
  return IDB.put('pkg', data).then(function () { document.querySelector('.mo').remove(); TOAST('套餐已保存'); });
};

A.delPkg = function (id) {
  if (!confirm('确认删除？')) return;
  return IDB.del('pkg', id).then(function () { document.querySelector('.mo').remove(); TOAST('已删除'); });
};

// ---- 附加项管理 ----
A.editAddon = function (id) {
  return IDB.all('addon').then(function (addons) {
    var a = id ? addons.find(function (x) { return x.id === id; }) : null;
    var o = document.createElement('div'); o.className = 'mo';
    o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-plus') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (a ? '编辑附加项' : '添加附加项') + '</div><div class="sheet-hero-sub">补充路费、加急、花絮等增值服务</div></div></div>' +
      '<div class="form-sec form-sec-card"><div class="form-sec-hd"><div class="form-sec-title">附加项信息</div><div class="form-sec-sub">让报价更完整，也更方便重复复用</div></div><div class="fg"><label class="fl">名称</label><input class="fi" id="efAddName" value="' + (a ? a.name : '') + '"></div>' +
      '<div class="fg"><label class="fl">价格（元）</label><input type="number" class="fi" id="efAddPrice" value="' + (a ? a.price : '') + '"></div>' +
      '<div class="fg" style="margin-bottom:0"><label class="fl">描述</label><input class="fi" id="efAddDesc" value="' + (a ? a.desc : '') + '"></div></div>' +
      '<div class="ma">' + (a ? '<button class="bt bt-dr" onclick="A.delAddon(\'' + a.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveAddon(\'' + (id || '') + '\')">保存</button></div>' +
      '<button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
  });
};

A.saveAddon = function (id) {
  var name = document.getElementById('efAddName').value.trim();
  if (!name) { TOAST('请输入名称'); return; }
  var data = { id: id || U(), name: name, price: Number(document.getElementById('efAddPrice').value) || 0, desc: document.getElementById('efAddDesc').value.trim() };
  return IDB.put('addon', data).then(function () { document.querySelector('.mo').remove(); TOAST('附加项已保存'); });
};

A.delAddon = function (id) {
  if (!confirm('确认删除？')) return;
  return IDB.del('addon', id).then(function () { document.querySelector('.mo').remove(); TOAST('已删除'); });
};

// ---- 数据导入导出 ----
A.exportAll = function () {
  var data = { version: '1.0', exportedAt: new Date().toISOString() };
  var stores = ['proj', 'cust', 'res', 'rcat', 'ref', 'rfcat', 'rep', 'repcat', 'set', 'pkg', 'addon'];
  var ps = stores.map(function (s) { return IDB.all(s).then(function (items) { data[s] = items; }); });
  return Promise.all(ps).then(function () {
    return IDB.put('set', { id: 'lastBackup', val: new Date().toISOString() }).then(function () {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'photographer-backup-' + T() + '.json'; a.click();
      URL.revokeObjectURL(url); TOAST('数据已导出');
    });
  });
};

A.importAll = function (e) {
  var file = e.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    try {
      var data = JSON.parse(ev.target.result);
      var stores = ['proj', 'cust', 'res', 'rcat', 'ref', 'rfcat', 'rep', 'repcat', 'set', 'pkg', 'addon'];
      var ps = stores.map(function (s) {
        if (data[s]) {
          return IDB.clr(s).then(function () {
            var puts = data[s].map(function (item) { return IDB.put(s, item); });
            return Promise.all(puts);
          });
        }
        return Promise.resolve();
      });
      return Promise.all(ps).then(function () {
        return IDB.put('set', { id: 'lastBackup', val: new Date().toISOString() });
      }).then(function () {
        TOAST('数据已导入，即将刷新'); setTimeout(function () { location.reload(); }, 1000);
      });
    } catch (err) { TOAST('导入失败：文件格式错误'); }
  };
  reader.readAsText(file); e.target.value = '';
};

A.resetAll = function () {
  if (!confirm('确认重置所有数据？此操作不可恢复！')) return;
  var stores = ['proj', 'cust', 'res', 'rcat', 'ref', 'rfcat', 'rep', 'repcat', 'set', 'pkg', 'addon'];
  var ps = stores.map(function (s) { return IDB.clr(s); });
  return Promise.all(ps).then(function () { location.reload(); });
};
