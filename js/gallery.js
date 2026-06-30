/* ============================================================
   gallery.js — 参考图库（灵感收集）
   ============================================================ */

A.rRef = function (ct) {
  return IDB.all('rfcat').then(function (cats) {
    return IDB.all('ref').then(function (items) {
      var html = '<div class="lib-panel"><div class="lib-head"><div class="lib-top"><div><div class="lib-title">参考图库</div><div class="lib-sub">收集拍摄风格、构图和灵感片段</div></div><button class="bt bt-p bt-s" onclick="A.editRFCat()">' + IC('i-plus') + '分类</button></div></div><div class="lib-filters">';
      html += '<button class="bt bt-gh bt-s' + (!A.refCf ? ' active' : '') + '" onclick="A.refCf=null;A.rLib()">全部</button>';
      for (var i = 0; i < cats.length; i++) { html += '<button class="bt bt-gh bt-s' + (A.refCf === cats[i].id ? ' active' : '') + '" onclick="if(A.refCf===\'' + cats[i].id + '\')A.editRFCat(\'' + cats[i].id + '\');else{A.refCf=\'' + cats[i].id + '\';A.rLib()}">' + cats[i].name + '</button>'; }
      html += '</div>';
      html += '<div class="lib-actions"><button class="bt bt-o bt-s bt-fw" onclick="document.getElementById(\'refUp\').click()">' + IC('i-upload') + '上传参考图</button></div><input type="file" id="refUp" accept="image/*" multiple style="display:none">';
      var f = A.refCf ? items.filter(function (x) { return (x.catIds || []).indexOf(A.refCf) >= 0; }) : items;
      if (f.length === 0) { html += '<div class="emp lib-empty"><div class="ei">' + IC('i-images') + '</div>暂无参考图</div>'; }
      else {
        html += '<div class="lib-grid">';
        for (var j = 0; j < f.length; j++) {
          html += '<div class="im" onclick="A.viewRef(\'' + f[j].id + '\')"><img src="' + f[j].img + '" alt="">' + (f[j].notes ? '<div class="il">' + f[j].notes + '</div>' : '') + (f[j].fav ? '<div class="fav-badge">' + IC('i-star') + '</div>' : '') + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
      ct.innerHTML = html;
      setTimeout(function () { var up = document.getElementById('refUp'); if (up) up.onchange = function (e) { A.upRefs(e); }; }, 100);
    });
  });
};

A.editRFCat = function (id) {
  return IDB.all('rfcat').then(function (cats) {
    var cat = id ? cats.find(function (c) { return c.id === id; }) : null;
    var o = document.createElement('div'); o.className = 'mo';
    o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-images') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (cat ? '编辑分类' : '新增分类') + '</div><div class="sheet-hero-sub">整理参考图库的风格、题材和场景标签</div></div></div><div class="form-sec form-sec-card"><div class="fg" style="margin-bottom:0"><label class="fl">分类名称</label><input class="fi" id="efRFCatName" value="' + (cat ? cat.name : '') + '"></div></div><div class="ma">' + (cat ? '<button class="bt bt-dr" onclick="A.delRFCat(\'' + cat.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveRFCat(\'' + (id || '') + '\')">保存</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
  });
};

A.saveRFCat = function (id) {
  var name = document.getElementById('efRFCatName').value.trim();
  if (!name) { TOAST('请输入名称'); return; }
  if (id) { return IDB.get('rfcat', id).then(function (c) { if (c) { c.name = name; return IDB.put('rfcat', c); } }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
  else { return IDB.put('rfcat', { id: U(), name: name }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
};

A.delRFCat = function (id) {
  if (!confirm('删除分类？')) return;
  return IDB.del('rfcat', id).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已删除'); });
};

A.upRefs = function (e) {
  var files = e.target.files; if (!files.length) return;
  var ps = [];
  for (var i = 0; i < files.length; i++) {
    ps.push(compressImg(files[i], 1400, 0.85).then(function (dataUrl) {
      return IDB.put('ref', { id: U(), catIds: [], img: dataUrl, notes: '', fav: false, createdAt: new Date().toISOString() });
    }));
  }
  return Promise.all(ps).then(function () { e.target.value = ''; A.rLib(); TOAST('已添加 ' + files.length + ' 张'); });
};

A.viewRef = function (id) {
  return IDB.get('ref', id).then(function (r) {
    if (!r) return;
    return IDB.all('rfcat').then(function (cats) {
      var v = document.createElement('div'); v.className = 'iv';
      var html = '<button class="cv" onclick="this.parentElement.remove()">' + IC('i-close') + '</button><img src="' + r.img + '" ondblclick="var iv=this.closest('.iv');if(iv)iv.classList.toggle('zoomed')" title="双击放大/缩小"><div class="viewer-meta">';
      html += '<div class="viewer-tags">';
      for (var i = 0; i < cats.length; i++) {
        var sel = (r.catIds || []).indexOf(cats[i].id) >= 0;
        html += '<button class="bt bt-xs ' + (sel ? 'bt-p' : 'bt-o') + '" style="font-size:11px" onclick="A.togRefCat(\'' + r.id + '\',\'' + cats[i].id + '\')">' + cats[i].name + '</button>';
      }
      html += '</div><input class="fi" id="vrNote" value="' + (r.notes || '') + '" placeholder="记录构图、光线或关键词..." style="background:rgba(255,255,255,.9)"><div class="viewer-actions"><button class="bt bt-xs ' + (r.fav ? 'bt-p' : 'bt-o') + '" onclick="A.togRefFav(\'' + r.id + '\')">' + IC('i-star') + (r.fav ? '已收藏' : '收藏') + '</button><button class="bt bt-xs bt-dr" onclick="A.delRef(\'' + r.id + '\');this.closest(\'.iv\').remove()">' + IC('i-trash') + '删除</button></div></div>';
      v.innerHTML = html;
      document.body.appendChild(v);
      v.addEventListener('click', function (e) { if (e.target === v) v.remove(); });
      setTimeout(function () {
        var n = document.getElementById('vrNote'); if (n) n.onchange = function () { A.setRefNote(r.id, this.value); };
      }, 100);
    });
  });
};

A.togRefCat = function (refId, catId) {
  return IDB.get('ref', refId).then(function (r) {
    if (!r) return;
    var ids = r.catIds || [];
    if (ids.indexOf(catId) >= 0) r.catIds = ids.filter(function (x) { return x !== catId; });
    else r.catIds = ids.concat([catId]);
    return IDB.put('ref', r).then(function () { document.querySelector('.iv').remove(); A.viewRef(refId); A.rLib(); });
  });
};

A.setRefNote = function (id, note) {
  return IDB.get('ref', id).then(function (r) { if (r) { r.notes = note; return IDB.put('ref', r); } });
};

A.togRefFav = function (id) {
  return IDB.get('ref', id).then(function (r) { if (r) { r.fav = !r.fav; return IDB.put('ref', r).then(function () { document.querySelector('.iv').remove(); A.viewRef(id); }); } });
};

A.delRef = function (id) {
  return IDB.del('ref', id).then(function () { A.rLib(); TOAST('已删除'); });
};
