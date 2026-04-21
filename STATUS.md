# Vive l'Empereur — 実装状況サマリー
> 最終更新: 2026-04-21　最新コミット: e5510cc

---

## リポジトリ

| 用途 | URL |
|------|-----|
| ゲーム本体（このリポジトリ） | git@github.com:tomo9878/vivelemperor-game.git |
| ヘックスグリッド共通ライブラリ | https://github.com/tomo9878/common-myhexgame |

---

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `index.html` | ゲーム本体（5,458行） |
| `hex-lib.js` | ヘックスグリッド共通関数（Cube座標・BFS・Dijkstra・LOS・SVG） |
| `chit-pull.js` | チットプルシステム（カップ管理・テーブルロール） |
| `vle-terrain.json` | 地形データ（terrain 100ヘックス + rivers 29ヘックスサイド） |
| `vle-units-allied.json` | 連合軍ユニットデータ |
| `vle-units-prussian.json` | プロイセン軍ユニットデータ |
| `test-runner.html` | ホワイトボックステストランナー |
| `test-scenarios.js` | テストシナリオ集 |

---

## 実装済み機能（コミット履歴より）

### ヘックスグリッド基盤
- Pointy-top、Cube座標、SVGオーバーレイ
- 1-indexed座標系（`0101`〜）、Vassal実測値（dx=109.2, dy=125.3）に合わせたピクセル計算
- パン＆ズーム対応

### ユニット管理
- `units` 配列：`{ id, col, row, type, army, small, sp, af, er, hits, battleworn, isHeavyArtillery, corps, offMap }`
- 軍色アンダーバー（仏=青、連合=赤、プロイセン=グレー）
- ステータスバッジ：赤ライン(Battleworn)、S/D角バッジ、ヒット数ドット
- 連合軍・プロイセン軍の初期配置データ実装済み（JSONファイル）

### 地形システム
- 複合地形対応（1ヘックスに複数地形タイプ配列）
- `ridge` / `woods` / `buildings` / `walled_buildings` の4種
- 地形設定UI（チェックボックス方式、即時反映）
- `isUphill(from, to)` — flat→ridge 判定
- `isDifficultTerrain(addr)` — woods / buildings / walled_buildings で停止必須

### 河川ヘックスサイド
- 29ヘックスサイド（Dyle川支流系）データ入力済み
- `isRiverCrossing(a, b)` — 橋なし河川越えをブロック
- SVG河川レイヤー（青実線）、橋設定UI（青破線）

### 移動ロジック
- `getMA(type)` — infantry/artillery=2、HC=3、LC=4
- `computeReachable(unit)` — BFSで到達可能ヘックスを計算
  - flat→ridge で移動コスト2（Slowing Terrain）
  - woods/buildings 進入で停止必須
  - Enemy Threat（敵ユニット隣接ヘックス）で停止必須
  - 河川越えブロック
  - 道路経由で難地形停止免除
  - Prussian Zone Restriction（プロイセン未展開時、仏軍19/20列進入不可）
  - スタックルール（smallユニット同士のみ2体まで）
- `hex-reachable`（青）/ `hex-stop`（オレンジ）2色ハイライト

### LOS計算
- `calcLOS(fromAddr, toAddr)` — ε双方向ナッジによるhexline
- ルールA: 両Flat間のRidgeが遮断
- ルールB: 同一高度間のwoods/buildingsが遮断
- ルールC: 異高度（flat↔ridge）でRidge上の遮蔽地形が遮断
- ルールD: hexside通過時に両ヘックスをチェック

### 砲撃戦闘
- `getValidBombardmentTargets(attacker)` — 射程（HA=4, 他=3）・LOS・AF>0
- `calcBombardmentDice(attacker, target, opts)` — 基本=AF、Plunging/Canister/Target in Square/Desultory修正
- `calcBombardmentTargetNumber(addr, unit)` — Clear=4、Woods/Buildings=5、WB=6、Cavalry-1
- `resolveBombardment()` — ダイスロール・成功/Partial判定・1Hit上限
- `applyHit(unit)` — ステップロス（3rd HitでBattleworn転換）
- Detachment特殊処理（6が2個で1成功）

### 近接戦闘
- Close to Contact Test（Elan Test）
- `calcMeleeDice(attacker, defender, opts)` — SP基本値 + Confident/Enfilade/Downhill修正
- `calcMeleeTargetNumber(attacker, defender)` — 相手ER、Cover/Heavy Cover/River Barrier修正
- Form Square Test（Cavalry→Infantry時）
- Blown Horses（Cavalry攻撃後1Hit）
- 3Hit上限、敗者2ヘックス後退

### チットプルシステム
- カップ管理（初期15枚）、Napoleon自動保持（最大2枚）、Humbugged（仏1枚保持）
- `endTurn()` で全保持マーカーをカップに戻す
- 連合軍・プロイセン共通テーブル（11-66、6結果）
- Wellington Old Nosey Table / Blücher Alte Vorwarts Table
- Napoleon Le Petit Caporal Table（5択アクション）
- プロイセンTRTスケジュール（T10/11/12に自動追加）

### 敵AI自動判定
- 連合軍・プロイセンの全6結果実装（Open Fire×2、Advance、Rally、Reinforce/Recapture、Bad Day）
- Target Priority（最近→最大SP→最小ER→最多Hit）
- Advance: Infantry/Cavalry/Artilleryそれぞれの挙動分岐
- プロイセン到着システム（`deployPrussianCorps`、off-mapキュー）

### Detachment Activation
- Hougoumont / La Haye Sainte / Papelotte それぞれの挙動実装

### フランス展開フェーズ
- Rainy Start判定（ターン1で5-6が出るまで遅延）
- コープス別展開エリア表示

### VP管理
- VPヘックスのFrench Control判定
- ターン終了時のVP集計

### テスト
- `test-runner.html` — スタンドアロンテストランナー
- `test-scenarios.js` — BFS/LOS/戦闘/プロイセン到着/Detachmentなど多数

---

## 既知のバグ（バグチェック中）

| # | 内容 | 深刻度 |
|---|------|--------|
| 1 | **移動済みフラグなし** — ユニット移動後も再選択・再移動が可能（`hasMoved`フラグ未実装） | 高 |
| 2 | **道路+坂道コスト** — 道路経由の flat→ridge でもコスト2のまま（本来は1） | 中 |

### バグ1の詳細
`computeReachable` は常に現在位置からコスト0で再計算するため、移動済みユニットを再クリックすると残MA分のハイライトが再表示される。「坂を登ったのにまだ動ける」ように見える原因。

修正方針：ユニットに `acted` フラグを追加。移動実行後にセットし、アクティベーション終了時にリセット。

### バグ2の詳細
`getMoveCost(from, to)` が道路情報を持たないため、道路上でもflat→ridge=2のまま。

修正方針：
```js
// computeReachable 内 ③を変更
const onRoad   = isOnRoad(addr, nAddr);
const moveCost = (isUphill(addr, nAddr) && !onRoad) ? 2 : 1;
```

---

## 未実装・TODO

| 項目 | 備考 |
|------|------|
| Forced March | +1ヘックス、Elan Test失敗で1Hit |
| 道路データ入力UI | `roadHexes` Set が空のまま |
| 後退処理（Retreat） | 敗者の2ヘックス後退、方向別ルール |
| Rally処理 | マーカー1段階回復 |
| Panic Test自動判定 | 3rd Hit時のElan Test |
| Cavalry Withdrawal | Infantry攻撃時の事前後退 |
| Combined Fire | 複数ユニット合算砲撃 |
| Fresh/Battleworn裏面画像 | 裏返し時の画像切り替え |
| VP計算最終表示 | ゲーム終了時の勝利判定UI |
| 橋データ入力 | bridges リストが空のまま |
