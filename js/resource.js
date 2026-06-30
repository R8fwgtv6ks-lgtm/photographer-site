/* ============================================================
   resource.js — 资源库（发送给客户的资料）
   ============================================================ */

A.rRes = function (ct) {
  return IDB.all('rcat').then(function (cats) {
    return IDB.all('res').then(function (items) {
      var html = '<div class="lib-panel"><div class="lib-head"><div class="lib-top"><div><div class="lib-title">资源库</div><div class="lib-sub">发送给客户的图文资料</div></div><button class="bt bt-p bt-s" onclick="A.editRCat()">' + IC('i-plus') + '分类</button></div></div><div class="lib-filters">';
      html += '<button class="bt bt-gh bt-s' + (!A.rcf ? ' active' : '') + '" onclick="A.rcf=null;A.rLib()">全部</button>';
      for (var i = 0; i < cats.length; i++) { html += '<button class="bt bt-gh bt-s' + (A.rcf === cats[i].id ? ' active' : '') + '" onclick="if(A.rcf===\'' + cats[i].id + '\')A.editRCat(\'' + cats[i].id + '\');else{A.rcf=\'' + cats[i].id + '\';A.rLib()}">' + cats[i].name + '</button>'; }
      html += '</div><div class="lib-actions"><button class="bt bt-o bt-s bt-fw" onclick="A.editRes()">' + IC('i-plus') + '添加资源</button></div>';
      var f = A.rcf ? items.filter(function (x) { return x.catId === A.rcf; }) : items;
      if (f.length === 0) { html += '<div class="emp lib-empty"><div class="ei">' + IC('i-folder') + '</div>暂无资源</div>'; }
      else {
        html += '<div class="lib-grid">';
        for (var j = 0; j < f.length; j++) { html += '<div class="im" onclick="A.viewRes(\'' + f[j].id + '\')"><img src="' + f[j].img + '" alt=""><div class="il">' + (f[j].name || '') + '</div></div>'; }
        html += '</div>';
      }
      html += '</div>';
      ct.innerHTML = html;
    });
  });
};

A.editRCat = function (id) {
  return IDB.all('rcat').then(function (cats) {
    var cat = id ? cats.find(function (c) { return c.id === id; }) : null;
    var o = document.createElement('div'); o.className = 'mo';
    o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-folder') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (cat ? '编辑分类' : '新增分类') + '</div><div class="sheet-hero-sub">用分类整理发给客户的资料结构</div></div></div><div class="form-sec form-sec-card"><div class="fg" style="margin-bottom:0"><label class="fl">分类名称</label><input class="fi" id="efCatName" value="' + (cat ? cat.name : '') + '"></div></div><div class="ma">' + (cat ? '<button class="bt bt-dr" onclick="A.delRCat(\'' + cat.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveRCat(\'' + (id || '') + '\')">保存</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
  });
};

A.saveRCat = function (id) {
  var name = document.getElementById('efCatName').value.trim();
  if (!name) { TOAST('请输入名称'); return; }
  if (id) { return IDB.get('rcat', id).then(function (c) { if (c) { c.name = name; return IDB.put('rcat', c); } }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
  else { return IDB.put('rcat', { id: U(), name: name }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
};

A.delRCat = function (id) {
  if (!confirm('删除分类？')) return;
  return IDB.del('rcat', id).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已删除'); });
};

A.editRes = function (id) {
  return IDB.all('rcat').then(function (cats) {
    return IDB.all('res').then(function (items) {
      var item = id ? items.find(function (x) { return x.id === id; }) : null;
      var o = document.createElement('div'); o.className = 'mo';
      o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-folder') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (item ? '编辑资源' : '添加资源') + '</div><div class="sheet-hero-sub">上传给客户查看的资料图与说明</div></div></div><div class="form-sec form-sec-card"><div class="form-sec-hd"><div class="form-sec-title">资源内容</div><div class="form-sec-sub">名称、分类与图片预览保持一致</div></div><div class="fg"><label class="fl">名称</label><input class="fi" id="efResName" value="' + (item ? item.name : '') + '"></div><div class="fg"><label class="fl">分类</label><select class="fs" id="efResCat">' + cats.map(function (c) { return '<option value="' + c.id + '"' + (item && item.catId === c.id ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></div><div class="fg" style="margin-bottom:0"><label class="fl">图片</label><input type="file" class="upload-input" accept="image/*" id="efResImg"><div id="efResPrev" class="preview-pane">' + (item ? '<img src="' + item.img + '">' : '') + '</div></div></div><div class="ma">' + (item ? '<button class="bt bt-dr" onclick="A.delRes(\'' + item.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveRes(\'' + (id || '') + '\',\'' + (item ? item.img || '' : '') + '\')">保存</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
      document.body.appendChild(o);
      o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
      var fi = document.getElementById('efResImg'); if (fi) fi.onchange = function () { A.prevResImg(); };
    });
  });
};

A.prevResImg = function () {
  var f = document.getElementById('efResImg').files[0]; if (!f) return;
  return compressImg(f, 1600, 0.85).then(function (dataUrl) {
    document.getElementById('efResPrev').innerHTML = '<img src="' + dataUrl + '">';
  });
};

A.saveRes = function (id, oldImg) {
  var name = document.getElementById('efResName').value.trim();
  var catId = document.getElementById('efResCat').value;
  var fi = document.getElementById('efResImg');
  var img = oldImg || '';
  var p = fi.files[0] ? compressImg(fi.files[0], 1600, 0.85) : Promise.resolve(img);
  return p.then(function (imgData) {
    if (!name && !imgData) { TOAST('请填写名称或上传图片'); return; }
    if (id) { return IDB.get('res', id).then(function (r) { if (r) { r.name = name; r.catId = catId; r.img = imgData; return IDB.put('res', r); } }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
    else { return IDB.put('res', { id: U(), name: name, catId: catId, img: imgData, createdAt: new Date().toISOString() }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
  });
};

A.delRes = function (id) {
  if (!confirm('确认删除？')) return;
  return IDB.del('res', id).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已删除'); });
};

A.viewRes = function (id) {
  return IDB.get('res', id).then(function (r) {
    if (!r || !r.img) return;
    var v = document.createElement('div'); v.className = 'iv';
    v.innerHTML = '<button class="cv" onclick="this.parentElement.remove()">' + IC('i-close') + '</button><img src="' + r.img + '"><div class="viewer-meta"><div class="viewer-bar"><div class="viewer-copy"><div class="viewer-title">' + (r.name || '未命名资源') + '</div><div class="viewer-sub">资源预览 · 点击放大</div></div><button class="bt bt-xs bt-dr" style="color:#fff;border-color:rgba(255,255,255,.4)" onclick="event.stopPropagation();A.delRes(\'' + r.id + '\');this.closest(\'.iv\').remove()">' + IC('i-trash') + '删除</button></div></div>';
    document.body.appendChild(v);
    var img = v.querySelector('img');
    if (img) {
      img.addEventListener('click', function (e) {
        e.stopPropagation();
        v.classList.toggle('zoomed');
      });
    }
    v.addEventListener('click', function (e) { if (e.target === v) v.remove(); });
  });
};
