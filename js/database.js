/* ============================================================
   database.js — IndexedDB 封装层
   所有数据库操作通过 IDB 全局对象进行
   ============================================================ */

var IDB = {};
IDB.db = null;

/** 初始化数据库，版本2，9个对象存储 */
IDB.init = function () {
  return new Promise(function (ok, no) {
    var r = indexedDB.open('PW2', 2);
    r.onupgradeneeded = function (e) {
      var d = e.target.result;
      var stores = ['proj', 'cust', 'res', 'rcat', 'ref', 'rfcat', 'rep', 'repcat', 'set', 'pkg', 'addon'];
      stores.forEach(function (s) {
        if (!d.objectStoreNames.contains(s)) {
          d.createObjectStore(s, { keyPath: 'id' });
        }
      });
    };
    r.onsuccess = function (e) { IDB.db = e.target.result; ok(); };
    r.onerror = function () { no(r.error); };
  });
};

/** 获取某对象存储的全部记录 */
IDB.all = function (store) {
  return new Promise(function (ok) {
    var t = IDB.db.transaction(store, 'readonly').objectStore(store);
    var r = t.getAll();
    r.onsuccess = function () { ok(r.result || []); };
  });
};

/** 按 ID 获取单条记录 */
IDB.get = function (store, id) {
  return new Promise(function (ok) {
    var t = IDB.db.transaction(store, 'readonly').objectStore(store);
    var r = t.get(id);
    r.onsuccess = function () { ok(r.result); };
  });
};

/** 插入或更新记录 */
IDB.put = function (store, obj) {
  return new Promise(function (ok) {
    var t = IDB.db.transaction(store, 'readwrite').objectStore(store);
    t.put(obj);
    t.transaction.oncomplete = function () { ok(); };
  });
};

/** 删除记录 */
IDB.del = function (store, id) {
  return new Promise(function (ok) {
    var t = IDB.db.transaction(store, 'readwrite').objectStore(store);
    t.delete(id);
    t.transaction.oncomplete = function () { ok(); };
  });
};

/** 清空对象存储 */
IDB.clr = function (store) {
  return new Promise(function (ok) {
    var t = IDB.db.transaction(store, 'readwrite').objectStore(store);
    t.clear();
    t.transaction.oncomplete = function () { ok(); };
  });
};
