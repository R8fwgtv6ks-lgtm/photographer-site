/* ============================================================
   seed.js — 首次使用时预置数据
   只在对应存储为空时执行，不会覆盖已有数据
   ============================================================ */

async function seed() {
  /* ---- 话术 ---- */
  var reps = await IDB.all('rep');
  if (reps.length === 0) {
    var cats = [
      { id: 'rc1', name: '拍摄前' },
      { id: 'rc2', name: '拍摄后' },
      { id: 'rc3', name: '售后' }
    ];
    for (var i = 0; i < cats.length; i++) await IDB.put('repcat', cats[i]);

    var items = [
      { id: 'r1', catId: 'rc1', catName: '拍摄前', title: '套餐介绍',
        content: '你好呀～这是我的拍摄套餐：\n\n📸 基础套餐 499/半小时\n📸 标准套餐 799/一小时\n📸 尊享套餐 999/两小时\n\n包含精修+底片全送，具体可以看套餐详情哦～', fav: true },
      { id: 'r2', catId: 'rc1', catName: '拍摄前', title: '定金说明',
        content: '确认拍摄后需要支付200元定金锁定档期哦～\n\n定金可抵拍摄费用，提前3天可免费改期。\n期待和你见面呀✨', fav: true },
      { id: 'r3', catId: 'rc1', catName: '拍摄前', title: '拍摄须知',
        content: '拍摄前小贴士💡\n\n1. 前一天早点休息，保持好状态\n2. 可以准备2-3套服装备用\n3. 妆容以自然为主\n4. 拍摄当天保持好心情最重要！', fav: false },
      { id: 'r4', catId: 'rc1', catName: '拍摄前', title: '拍摄提醒',
        content: 'Hi～明天别忘了拍摄哦！\n今晚早点休息，我们明天见🌸', fav: true },
      { id: 'r5', catId: 'rc2', catName: '拍摄后', title: '选片通知',
        content: '照片已经整理好啦！请查收链接选片，选好后告诉我序号即可～\n预计精修周期为7-10个工作日✨', fav: false },
      { id: 'r6', catId: 'rc2', catName: '拍摄后', title: '尾款提醒',
        content: '精修片已完成，麻烦确认一下没有问题后支付尾款哦～\n支付后我会尽快发高清原图给你💛', fav: false },
      { id: 'r7', catId: 'rc3', catName: '售后', title: '交付通知',
        content: '全部成片已发送！感谢你的信任和配合，和你一起工作的过程真的很开心✨\n如果喜欢的话，欢迎推荐给朋友哦～', fav: false },
      { id: 'r8', catId: 'rc3', catName: '售后', title: '售后回访',
        content: 'Hi～照片还满意吗？有任何问题随时和我说～期待下次再见🌿', fav: false }
    ];
    for (var j = 0; j < items.length; j++) await IDB.put('rep', items[j]);
  }

  /* ---- 拍摄清单 ---- */
  var cl = await IDB.get('set', 'checklist');
  if (!cl) {
    await IDB.put('set', { id: 'checklist', val: [
      { t: '查看参考图', d: false },
      { t: '电池充电', d: false },
      { t: '检查 SD 卡', d: false },
      { t: '检查镜头', d: false },
      { t: '提醒客户早点休息', d: false },
      { t: '查看天气', d: false },
      { t: '查看交通', d: false }
    ]});
  }

  /* ---- 套餐 ---- */
  var pkgs = await IDB.all('pkg');
  if (pkgs.length === 0) {
    await IDB.put('pkg', { id: 'p1', name: '基础套餐', price: 499, unit: '半小时', desc: '适合快速记录重要时刻', features: '30分钟拍摄\n精修15张\n底片全送\n1个场景', featured: false });
    await IDB.put('pkg', { id: 'p2', name: '标准套餐', price: 799, unit: '一小时', desc: '最受欢迎的选择', features: '60分钟拍摄\n精修30张\n底片全送\n2个场景\n1套服装造型建议', featured: true });
    await IDB.put('pkg', { id: 'p3', name: '尊享套餐', price: 999, unit: '两小时', desc: '全面记录，不留遗憾', features: '120分钟拍摄\n精修50张\n底片全送\n3个场景\n2套服装造型建议\n包含全家福', featured: false });
  }

  /* ---- 附加项 ---- */
  var addons = await IDB.all('addon');
  if (addons.length === 0) {
    await IDB.put('addon', { id: 'a1', name: '花絮视频', price: 299, desc: '1-2分钟精剪花絮视频' });
  }

  /* ---- 备份时间 ---- */
  var lb = await IDB.get('set', 'lastBackup');
  if (!lb) await IDB.put('set', { id: 'lastBackup', val: '' });
}
