/* ============================================================
   replies.js — 话术库
   ============================================================ */

A.rRep = function (ct) {
  return IDB.all('repcat').then(function (cats) {
    return IDB.all('rep').then(function (items) {
      // 缓存内容以供同步复制
      A._repCache = {};
      for (var ci = 0; ci < items.length; ci++) { A._repCache[items[ci].id] = items[ci].content; }

      var sq = A._repSrch || '';
      var html = '<div class="lib-panel"><div class="lib-head"><div class="lib-top"><div><div class="lib-title">话术库</div><div class="lib-sub">整理前期沟通、交付提醒和售后表达</div></div></div></div><input class="fi" id="repSrch" placeholder="搜索标题或内容..." value="' + sq.replace(/"/g, '&quot;') + '" style="margin-bottom:10px"><div class="lib-filters">';
      html += '<button class="bt bt-gh bt-s' + (!A.rpf ? ' active' : '') + '" data-rc="" onclick="A.rpf=null;A._repSrch=document.getElementById(\'repSrch\').value;A.rLib()">全部</button>';
      for (var i = 0; i < cats.length; i++) { html += '<button class="bt bt-gh bt-s' + (A.rpf === cats[i].id ? ' active' : '') + '" data-rc="' + cats[i].id + '" onclick="A.rpf=\'' + cats[i].id + '\';A._repSrch=document.getElementById(\'repSrch\').value;A.rLib()">' + cats[i].name + '</button>'; }
      html += '</div><div class="lib-actions"><button class="bt bt-o bt-s bt-fw" onclick="A.editRep()">' + IC('i-plus') + '添加话术</button></div>';

      var f = items;
      if (sq) { var sqLower = sq.toLowerCase(); f = f.filter(function (x) { return x.title.toLowerCase().indexOf(sqLower) >= 0 || x.content.toLowerCase().indexOf(sqLower) >= 0; }); }
      if (A.rpf) f = f.filter(function (x) { return x.catId === A.rpf; });

      if (f.length === 0) { html += '<div class="emp lib-empty"><div class="ei">' + IC('i-message') + '</div>暂无话术</div>'; }
      else {
        for (var j = 0; j < f.length; j++) {
          html += '<div class="rc" onclick="A.viewRep(\'' + f[j].id + '\')"><div class="rc-top"><div class="rc-copy"><div class="rt">' + (f[j].fav ? '<span class="fav-inline">' + IC('i-star') + '</span>' : '') + f[j].title + '</div><div class="rp">' + f[j].content.slice(0, 80) + '...</div></div><button class="bt bt-o bt-xs bt-ic" style="flex-shrink:0" onclick="event.stopPropagation();A.copyRep(\'' + f[j].id + '\')">' + IC('i-copy') + '</button></div><div class="rc-meta"><span class="rc-cat">' + (f[j].catName || '未分类') + '</span><span style="color:var(--tx3);font-size:11px">' + (f[j].fav ? '重点收藏' : '点击查看全文') + '</span></div></div>';
        }
      }
      html += '</div>';
      ct.innerHTML = html;
      setTimeout(function () {
        var sr = document.getElementById('repSrch');
        if (sr) {
          sr.value = A._repSrch || '';
          // 使用DOM过滤而非重绘，避免手机键盘关闭
          sr.oninput = function () {
            A._repSrch = this.value;
            var q = this.value.toLowerCase();
            var cards = ct.querySelectorAll('.rc');
            for (var ci2 = 0; ci2 < cards.length; ci2++) {
              var t2 = cards[ci2].textContent || cards[ci2].innerText || '';
              cards[ci2].style.display = t2.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
            }
          };
        }
      }, 100);
    });
  });
};

A.copyRep = function (id) {
  var text = (A._repCache && A._repCache[id]) || '';
  if (!text) { IDB.get('rep', id).then(function (r) { if (r) _fallbackCopy(r.content); }); return; }
  _fallbackCopy(text);
};

function _fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'; ta.style.top = '-9999px';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); TOAST('已复制'); } catch (e) { TOAST('复制失败，请手动复制'); }
  document.body.removeChild(ta);
}

A.editRep = function (id) {
  return IDB.all('repcat').then(function (cats) {
    return IDB.all('rep').then(function (items) {
      var item = id ? items.find(function (x) { return x.id === id; }) : null;
      var o = document.createElement('div'); o.className = 'mo';
      o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-message') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + (item ? '编辑话术' : '添加话术') + '</div><div class="sheet-hero-sub">整理前期沟通、提醒和售后模板</div></div></div><div class="form-sec form-sec-card"><div class="form-sec-hd"><div class="form-sec-title">话术内容</div><div class="form-sec-sub">标题清晰，内容方便直接复制发送</div></div><div class="fg"><label class="fl">标题</label><input class="fi" id="efRepT" value="' + (item ? item.title : '') + '"></div><div class="fg"><label class="fl">分类</label><select class="fs" id="efRepC">' + cats.map(function (c) { return '<option value="' + c.id + '"' + (item && item.catId === c.id ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></div><div class="fg" style="margin-bottom:0"><label class="fl">内容</label><textarea class="ft" id="efRepCt" style="min-height:140px">' + (item ? item.content : '') + '</textarea></div></div><div class="ma">' + (item ? '<button class="bt bt-dr" onclick="A.delRep(\'' + item.id + '\')">删除</button>' : '') + '<button class="bt bt-p" onclick="A.saveRep(\'' + (id || '') + '\')">保存</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">取消</button></div>';
      document.body.appendChild(o);
      o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    });
  });
};

A.saveRep = function (id) {
  var title = document.getElementById('efRepT').value.trim();
  var content = document.getElementById('efRepCt').value.trim();
  if (!title) { TOAST('请输入标题'); return; }
  var catId = document.getElementById('efRepC').value;
  return IDB.all('repcat').then(function (cats) {
    var catName = (cats.find(function (c) { return c.id === catId; }) || {}).name || '';
    if (id) { return IDB.get('rep', id).then(function (r) { if (r) { r.title = title; r.content = content; r.catId = catId; r.catName = catName; return IDB.put('rep', r); } }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
    else { return IDB.put('rep', { id: U(), title: title, content: content, catId: catId, catName: catName, fav: false, createdAt: new Date().toISOString() }).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已保存'); }); }
  });
};

A.delRep = function (id) {
  if (!confirm('确认删除？')) return;
  return IDB.del('rep', id).then(function () { document.querySelector('.mo').remove(); A.rLib(); TOAST('已删除'); });
};

A.viewRep = function (id) {
  return IDB.get('rep', id).then(function (r) {
    if (!r) return;
    var o = document.createElement('div'); o.className = 'mo';
    o.innerHTML = '<div class="ms"><div class="sheet-hero"><div class="sheet-hero-icon">' + IC('i-message') + '</div><div class="sheet-hero-copy"><div class="sheet-hero-title">' + r.title + '</div><div class="sheet-hero-sub">' + (r.catName || '未分类话术') + '</div></div></div><div class="copy-pane">' + r.content + '</div><div class="ma"><button class="bt bt-o" onclick="A.copyRep(\'' + r.id + '\')">' + IC('i-copy') + '复制</button><button class="bt bt-p" onclick="this.closest(\'.mo\').remove();A.editRep(\'' + r.id + '\')">' + IC('i-edit') + '编辑</button></div><button class="bt bt-gh bt-fw" style="margin-top:8px" onclick="this.closest(\'.mo\').remove()">关闭</button></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
  });
};
