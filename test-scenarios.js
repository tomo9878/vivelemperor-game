/**
 * test-scenarios.js
 * 砲撃・近接戦闘のテストシナリオ定義
 *
 * 使い方: index.html でロードし、`window.loadTestScenario(id)` を呼ぶと
 * units 配列・地形・河川が書き換えられて即テスト可能な状態になる。
 */

/* ============================================================
   テストシナリオ定義
   各シナリオは以下のプロパティを持つ:
   - id         : 識別子
   - category   : 'bombard' | 'melee'
   - title      : 表示名
   - desc       : 期待動作の説明
   - setup()    : ユニット・地形・河川を設定する関数
   ============================================================ */

// ---- ユニット雛形ファクトリ ----
function mkUnit(overrides) {
  return Object.assign({
    id: 'test_unit',
    col: 10, row: 8,
    type: 'infantry',
    army: 'french',
    small: false,
    imageHref: 'images/cooke_I_front.png',
    sp: 4, af: 0, er: 4,
    hits: 0, battleworn: false,
    isHeavyArtillery: false,
    isDetachment: false,
  }, overrides);
}

// ---- 地形ヘルパー ----
function setTestTerrain(addr, types) {
  setTerrainTypes(addr, types);
}
function clearTestTerrain(addr) {
  setTerrainTypes(addr, []);
}
function clearAllTestTerrain(addrList) {
  for (const a of addrList) clearTestTerrain(a);
}

// ---- 河川ヘルパー ----
function addTestRiver(a, b) {
  if (!isRiverHexside(a, b)) toggleRiverHexside(a, b);
}
function removeTestRiver(a, b) {
  if (isRiverHexside(a, b)) toggleRiverHexside(a, b);
}

// ---- ユニット置き換えヘルパー ----
function replaceUnits(newUnits) {
  units.length = 0;
  newUnits.forEach(u => units.push(u));
  // 既存のハイライト・選択をリセット
  if (typeof deselect === 'function') deselect();
  if (typeof drawAllUnits === 'function') drawAllUnits();
}

/* ============================================================
   シナリオカタログ
   ============================================================ */

const TEST_SCENARIOS = [

  // ============================================================
  // 砲撃テストシナリオ
  // ============================================================

  {
    id: 'b01',
    category: 'bombard',
    title: '①Clear→Clear 基本砲撃 (AF=2, TN=4)',
    desc: 'AF=2のArtilleryが3ヘックス先のInfantryを砲撃。ダイス2個、TN=4。成功1個以上で1Hit。',
    setup() {
      clearAllTestTerrain(['1008', '1108', '1208', '1308']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:13, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b02',
    category: 'bombard',
    title: '②Plunging Fire（攻撃側Ridge・目標Flat）+1ダイス',
    desc: '攻撃側がRidgeヘックス、目標がFlatヘックス → Plunging Fire +1（AF=2→3ダイス）。',
    setup() {
      setTestTerrain('1008', ['ridge']);
      clearTestTerrain('1308');
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:13, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b03',
    category: 'bombard',
    title: '③Canister（隣接射撃）+1ダイス',
    desc: '隣接（距離1）に砲撃 → Canister +1（AF=2→3ダイス）。TN=4。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b04',
    category: 'bombard',
    title: '④目標がCavalry（TN -1 = 3）',
    desc: '目標がCavalry → TN=4-1=3。ダイス2個、TN=3。',
    setup() {
      clearAllTestTerrain(['1008', '1308']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_cav', col:13, row:8, type:'HC',        army:'allied',
                 sp:4, af:0, er:5, imageHref:'images/somerset_CC_front.png' }),
      ]);
    },
  },

  {
    id: 'b05',
    category: 'bombard',
    title: '⑤Woods内目標（TN=5）',
    desc: '目標がWoodsヘックス → TN=5。',
    setup() {
      clearTestTerrain('1008');
      setTestTerrain('1308', ['woods']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:13, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b06',
    category: 'bombard',
    title: '⑥Walled Buildings通常ユニット（TN=6）',
    desc: '目標がWalled Buildingsヘックスの通常Infantry → TN=6。',
    setup() {
      clearTestTerrain('1008');
      setTestTerrain('1308', ['walled_buildings']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:3, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:13, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b07',
    category: 'bombard',
    title: '⑦Walled Buildings Detachment（6が2個必要）',
    desc: 'isDetachment=true のユニットをWB内から砲撃 → 6が2個で1成功。AF=3、TN=6。',
    setup() {
      clearTestTerrain('1008');
      setTestTerrain('1308', ['walled_buildings']);
      replaceUnits([
        mkUnit({ id: 'atk_art',  col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:3, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_det',  col:13, row:8, type:'infantry',  army:'allied',
                 sp:2, af:0, er:5, isDetachment:true,
                 imageHref:'images/hougoumount_detachment_front.png' }),
      ]);
    },
  },

  {
    id: 'b08',
    category: 'bombard',
    title: '⑧AF=0ユニットは砲撃不可',
    desc: 'AF=0のInfantryを選択 → 「砲撃」ボタンが表示されないことを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1308']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:0, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:13, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b09',
    category: 'bombard',
    title: '⑨LOS遮断（間にRidge）',
    desc: '攻撃側Flat → 中間Ridgeあり → 目標Flat → LOS遮断で射撃不可。ターゲットが赤くならないことを確認。',
    setup() {
      clearTestTerrain('1008');
      setTestTerrain('1208', ['ridge']);
      clearTestTerrain('1408');
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:14, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b10',
    category: 'bombard',
    title: '⑩射程外（4ヘックス超）',
    desc: '通常砲（射程3）から5ヘックス先の敵 → 射撃不可。ターゲットが赤くならないことを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1508']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:2, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:15, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b11',
    category: 'bombard',
    title: '⑪Partial×2→1Hit / Partial×1→Hit無し',
    desc: 'AF=4で多数ダイス。TN=4。Partial（=4）が何個出るか確認。2個で1成功。',
    setup() {
      clearAllTestTerrain(['1008', '1308']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:4, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:13, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'b12',
    category: 'bombard',
    title: '⑫複数Success→最大1Hit',
    desc: 'AF=5で大量ダイス。複数Success出てもHitは1つのみなことを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1208']);
      replaceUnits([
        mkUnit({ id: 'atk_art', col:10, row:8, type:'artillery', army:'french',
                 sp:0, af:5, er:4, imageHref:'images/horse_art_R_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:12, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  // ============================================================
  // 近接戦闘テストシナリオ
  // ============================================================

  {
    id: 'm01',
    category: 'melee',
    title: '①Close to Contact 成功→通常戦闘',
    desc: 'ER=4の Infantry が Close to Contact Test を実施。成功で戦闘へ進む。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm02',
    category: 'melee',
    title: '②Close to Contact 失敗 Infantry→Desultory Fire',
    desc: 'ER=1（Disrupted等で低ER）→ 失敗が出やすい。失敗時に Desultory Fire ボタンが表示されることを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:2, er:1, hits:2,  // Disrupted（ER実効=1→失敗しやすい）
                 imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm03',
    category: 'melee',
    title: '③Close to Contact 失敗 Cavalry→攻撃不可',
    desc: 'ER=1のCavalry → 失敗しやすい。失敗時に「攻撃不可」と閉じるボタンのみ表示を確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_cav', col:10, row:8, type:'LC', army:'french',
                 sp:2, af:0, er:1, hits:2,  // Disrupted
                 imageHref:'images/vivian_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm04',
    category: 'melee',
    title: '④Confident（ER差+2以上）→+1ダイス',
    desc: '攻撃側ER=6、防御側ER=4（差=2）→ Close to Contact 成功時に Confident +1ダイス表示を確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:5, af:1, er:6, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm05',
    category: 'melee',
    title: '⑤Cavalry Withdrawal（French Cavalry ← Allied Infantry）',
    desc: 'Allied Infantry が French LC を攻撃 → LC側が「撤退する」を選択可能なことを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
        mkUnit({ id: 'def_cav', col:11, row:8, type:'LC',       army:'french',
                 sp:2, af:0, er:4, imageHref:'images/vivian_CC_front.png' }),
      ]);
    },
  },

  {
    id: 'm06',
    category: 'melee',
    title: '⑥Form Square 成功→防御ER+2',
    desc: 'French LC → Allied Infantry。Form Square Test成功で「防御側ER+2」と表示されることを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_cav', col:10, row:8, type:'LC', army:'french',
                 sp:2, af:0, er:4, imageHref:'images/vivian_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm07',
    category: 'melee',
    title: '⑦Form Square 失敗→防御ER-2',
    desc: 'French HC → Allied Infantry（ER=1なので失敗しやすい）。Form Square Fail → 防御側TN低下を確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_cav', col:10, row:8, type:'HC', army:'french',
                 sp:4, af:0, er:5, imageHref:'images/somerset_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:1, hits:2,  // Disrupted→低ER
                 imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm08',
    category: 'melee',
    title: '⑧Heavy Cavalry攻撃→+2ダイス',
    desc: 'HC → Infantry。攻撃ダイス数が SP + Heavy Cavalry +2 になることを確認（SP=4→6ダイス）。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_hc',  col:10, row:8, type:'HC',       army:'french',
                 sp:4, af:0, er:5, imageHref:'images/somerset_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry',  army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm09',
    category: 'melee',
    title: '⑨Blown Horses（Cavalry攻撃後に攻撃側1Hit）',
    desc: 'French HC が Allied Infantry を攻撃。戦闘後に攻撃側Cavalryに Blown Horses 1Hitが付くことを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_hc',  col:10, row:8, type:'HC',      army:'french',
                 sp:4, af:0, er:5, imageHref:'images/somerset_CC_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:2, af:0, er:3, imageHref:'images/vincke_RC_front.png' }),  // 弱めの防御
      ]);
    },
  },

  {
    id: 'm10',
    category: 'melee',
    title: '⑩Enfilade×1（隣接友軍1体）→+1ダイス',
    desc: '攻撃側の隣接ヘックスに友軍1体 → Enfilade +1ダイス。攻撃ダイス計算欄で確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108', '1009']);
      replaceUnits([
        mkUnit({ id: 'atk_inf',    col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'flank_inf',  col:10, row:9, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/lambert_RC_front.png' }),  // 防御側の隣接友軍
        mkUnit({ id: 'def_inf',    col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm11',
    category: 'melee',
    title: '⑪Enfilade×2（隣接友軍2体）→+2ダイス（上限）',
    desc: '攻撃側の隣接に友軍2体 → Enfilade +2ダイス（上限）。3体以上でも+2止まりを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108', '1009', '1007']);
      replaceUnits([
        mkUnit({ id: 'atk_inf',   col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'flank1',    col:10, row:9, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/lambert_RC_front.png' }),
        mkUnit({ id: 'flank2',    col:10, row:7, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/halkett_II_front.png' }),
        mkUnit({ id: 'def_inf',   col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm12',
    category: 'melee',
    title: '⑫Downhill Fire（防御Ridge・攻撃Flat）→防御+1ダイス',
    desc: '防御側がRidgeヘックス、攻撃側がFlatヘックス → 防御ダイス数 +1。',
    setup() {
      clearTestTerrain('1008');
      setTestTerrain('1108', ['ridge']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm13',
    category: 'melee',
    title: '⑬Cover（Woods）→防御ER+1',
    desc: '防御側がWoodsヘックス → 防御側ER+1。ダイスロール欄のTN表示で確認。',
    setup() {
      clearTestTerrain('1008');
      setTestTerrain('1108', ['woods']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm14',
    category: 'melee',
    title: '⑭Heavy Cover（WB Detachment）→防御ER+2',
    desc: '防御側がWalled BuildingsのDetachment → 防御ER+2（ER=5→7→上限6）。',
    setup() {
      setTestTerrain('1108', ['walled_buildings']);
      clearTestTerrain('1008');
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_det', col:11, row:8, type:'infantry', army:'allied',
                 sp:2, af:0, er:5, isDetachment:true,
                 imageHref:'images/hougoumount_detachment_front.png' }),
      ]);
    },
  },

  {
    id: 'm15',
    category: 'melee',
    title: '⑮River Barrier越え攻撃→防御ER+1',
    desc: '攻撃側・防御側の間に河川 → 防御ER+1。河川を引いてからテスト。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      addTestRiver('1008', '1108');
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:4, af:1, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
    // ※ Cavalry の場合はriver越え突撃禁止なので注意
  },

  {
    id: 'm16',
    category: 'melee',
    title: '⑯攻撃側多数Success→攻撃側勝利・防御側2hex後退',
    desc: 'SP=6の強Infantry vs SP=2の弱Infantry → 攻撃側勝利、防御側後退を確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108', '1208', '1308']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:6, af:2, er:6, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:2, af:0, er:2, imageHref:'images/vincke_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm17',
    category: 'melee',
    title: '⑰同数Success→防御側勝利（引き分け）',
    desc: '攻撃側SP=3、防御側SP=3+AF=0で均衡。引き分け→攻撃側は元のヘックスに留まる。',
    setup() {
      clearAllTestTerrain(['1008', '1108']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:3, af:0, er:4, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:3, af:0, er:4, imageHref:'images/picton_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm18',
    category: 'melee',
    title: '⑱最大Hit上限（3Hit）確認',
    desc: '強力な攻撃（SP=8）vs 弱い防御 → 成功が3を超えても適用Hitは3のみを確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108', '1208', '1308']);
      replaceUnits([
        mkUnit({ id: 'atk_inf', col:10, row:8, type:'infantry', army:'french',
                 sp:8, af:2, er:6, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf', col:11, row:8, type:'infantry', army:'allied',
                 sp:1, af:0, er:1, imageHref:'images/vincke_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm19',
    category: 'melee',
    title: '⑲敗者後退中に敵隣接→1Hit追加',
    desc: '防御側後退先ヘックスの周囲に敵を置く → 通過時1Hit追加を確認。',
    setup() {
      clearAllTestTerrain(['1008', '1108', '1208', '1308', '1307', '1309']);
      replaceUnits([
        mkUnit({ id: 'atk_inf',  col:10, row:8, type:'infantry', army:'french',
                 sp:6, af:2, er:6, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf',  col:11, row:8, type:'infantry', army:'allied',
                 sp:2, af:0, er:2, imageHref:'images/vincke_RC_front.png' }),
        // 後退経路（12,8）の隣（12,7）に友軍なし → 敵が隣接
        mkUnit({ id: 'block_fr', col:12, row:7, type:'infantry', army:'french',
                 sp:4, af:1, er:4, imageHref:'images/lambert_RC_front.png' }),
      ]);
    },
  },

  {
    id: 'm20',
    category: 'melee',
    title: '⑳後退不可→未後退分Hit・消滅確認',
    desc: '防御側の後退経路を全て敵・友軍で塞ぐ → 後退不能Hit → Battleworn → 消滅フロー確認。',
    setup() {
      // def_inf を包囲して後退不能にする
      clearAllTestTerrain(['1108']);
      replaceUnits([
        mkUnit({ id: 'atk_inf',  col:10, row:8, type:'infantry',  army:'french',
                 sp:6, af:2, er:6, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'def_inf',  col:11, row:8, type:'infantry',  army:'allied',
                 sp:2, af:0, er:2, hits:2,  // Disrupted → 次HitでBattleworn
                 imageHref:'images/vincke_RC_front.png' }),
        // 周囲をフランス軍で囲む（後退先候補すべて敵占有）
        mkUnit({ id: 'block1', col:12, row:8, type:'infantry', army:'french',
                 sp:4, af:1, er:4, small:true, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'block2', col:11, row:7, type:'infantry', army:'french',
                 sp:4, af:1, er:4, small:true, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'block3', col:11, row:9, type:'infantry', army:'french',
                 sp:4, af:1, er:4, small:true, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'block4', col:12, row:7, type:'infantry', army:'french',
                 sp:4, af:1, er:4, small:true, imageHref:'images/cooke_I_front.png' }),
        mkUnit({ id: 'block5', col:12, row:9, type:'infantry', army:'french',
                 sp:4, af:1, er:4, small:true, imageHref:'images/cooke_I_front.png' }),
      ]);
    },
  },
];

/* ============================================================
   シナリオロード関数（index.html から呼び出す）
   ============================================================ */

window.TEST_SCENARIOS = TEST_SCENARIOS;

window.loadTestScenario = function(id) {
  const scenario = TEST_SCENARIOS.find(s => s.id === id);
  if (!scenario) { console.warn('Scenario not found:', id); return; }
  // 河川リセット（全削除）
  riverHexsides.length = 0;
  bridgeHexsides.length = 0;
  renderRiverLayer();
  // テスト地形をリセット（全ヘックスをFlatに）
  for (const addr of terrainFillEls.keys()) clearTestTerrain(addr);
  // シナリオのsetupを実行
  scenario.setup();
  // 河川描画
  renderRiverLayer();
  // ログ表示
  addCombatLog(`[テスト] ${scenario.title}`);
  console.log(`[テスト ${id}] ${scenario.title}\n→ ${scenario.desc}`);
};
