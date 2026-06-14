/**
 * 四时植语 · 交互逻辑 v2
 * Layer 4 · 显示层：fetch(content-data.json) → 渲染
 * 
 * 数据流: fetch → filter → group → render
 * 状态: { season, region, month, selectedDay, search }
 */

// ===== State =====
const state = {
  season: 'summer',
  region: 'general',
  month: 6,
  selectedDay: null,
  search: ''
};

// ===== Data Store =====
let DATA = null;

// ===== Init — fetch data then render =====
async function init() {
  try {
    const resp = await fetch('content-data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    DATA = await resp.json();
  } catch (e) {
    console.warn('⚠️ 无法加载 content-data.json，使用内联演示数据', e);
    DATA = getFallbackData();
  }

  // Determine default season from current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSeason = DATA.seasons.find(s => s.months.includes(currentMonth));
  if (currentSeason) {
    state.season = currentSeason.id;
    state.month = currentMonth;
  }

  renderAll();
  bindEvents();
}

// ===== Fallback: inline demo data (for file:// offline/error) =====
// ⚠️ 正式数据在 content-data.json；此 fallback 仅用于本地预览
// 覆盖四季节，确保 file:// 打开也能看到完整交互效果
function getFallbackData() {
  return {"seasons":[{id:"spring","label":"春","icon":"🌸","months":[3,4,5]},{id:"summer","label":"夏","icon":"☀️","months":[6,7,8]},{id:"autumn","label":"秋","icon":"🍂","months":[9,10,11]},{id:"winter","label":"冬","icon":"❄️","months":[12,1,2]}],"regions":[{id:"general","label":"通用","zone":"全温区"},{id:"east","label":"华东","zone":"7-9区"},{id:"south","label":"华南","zone":"10-11区"},{id:"southwest","label":"西南","zone":"8-10区"},{id:"northeast","label":"东北","zone":"3-6区"}],"content":[
{plant:"蓝雪花",season:"summer",region:"east",month:6,type:"plant",summary:"耐热开花机器，华东6月可播种，7-10天出芽",detail:"播种：25-30℃ 温水浸种4小时 → 育苗土 → 7-10天出芽 → 45天开花\n养护：全日照，见干见湿，每周一次花卉肥\n注意：不耐寒，华东11月前入室越冬",tags:["新手友好","花期长","耐热"],why_now:"6月蓝雪花盛夏养护关键期：全日照+勤浇水+每周薄肥=持续爆花。现在不播，夏天少一面花墙",quick_actions:["全日照+勤浇水+每周薄肥=持续爆花","每次花后剪1-2节促新花"],scenario_balcony:"封闭阳台：光照要足。每天至少4-6小时直射光，缺光不开花",scenario_garden:"露台花园党：蓝色花瀑布。地栽或大盆，全日照暴晒促花",scenario_beginner:"新手入门：喜水怕干；全日照！每天至少4-6小时直射",pitfalls:["怕冻，冬季需入室保暖（5℃进屋），霜前完成","别浇太多水！见干见湿即可"],bigbrother_tip:"种植心得：我每年6月初播一批蓝雪花，8月爆花。出芽立刻给全日照，别惯着它",image_hint:"蓝雪花，蓝色开花机器！从春爆到秋，阳台党新手入坑首选",product_keywords:["蓝雪花","花卉营养土","3加仑青山盆"]},
{plant:"太阳花",season:"summer",region:"general",month:6,type:"plant",summary:"死不了系列，越热越开花，撒种就活",detail:"播种：直接撒播，覆薄土，保持湿润 → 3-5天出芽\n养护：全日照，极耐旱，土干透再浇\n花期：6-10月，单朵1天但持续爆花",tags:["新手友好","耐旱","爆花"],why_now:"6月太阳花播种黄金期！撒种就活，越热越开花，新手闭眼入",quick_actions:["直接撒播不覆土","保持湿润等出芽","出芽后全日照暴晒"],scenario_garden:"开放阳台/花园：随便撒，越晒越爆",scenario_beginner:"新手入门：浇水：土干透再浇；光照：全日照",pitfalls:["别浇太多水！耐旱怕涝，土干透再浇"],bigbrother_tip:"推荐理由：死不了系列，越热越开花，撒种就活",product_keywords:["太阳花种子","营养土","花盆"]},
{plant:"月季",season:"summer",region:"general",month:6,type:"care",summary:"花后修剪+追肥，为秋花蓄力",detail:"修剪：花下第3片五叶处下剪，统一朝外芽点\n追肥：花后一周复合肥，两周一次花卉肥\n病害：6月黑斑高发，雨前喷代森锰锌预防",tags:["修剪","追肥","病害预防"],why_now:"6月月季花后修剪决定秋天能不能爆花。现在不剪，秋花又少又小",quick_actions:["花下第3片五叶处下剪","剪完追一次复合肥","雨前喷代森锰锌防黑斑"],scenario_balcony:"封闭阳台：阳台首选微型月季，大花月季占地太大",scenario_garden:"露台花园党：地栽月季花后重剪1/3枝条，保持株型通风防病",scenario_beginner:"新手须知：刚入手的月季先别急着换盆，原盆养两周适应环境再动",pitfalls:["⚠️ 别剪到木质化老枝上！剪口必须朝外芽点","6月黑斑高发，雨后必喷药"],bigbrother_tip:"我的经验：阳台首选微型月季，大花月季占地太大",product_keywords:["月季苗","代森锰锌","花卉型复合肥"]},
{plant:"绣球",season:"summer",region:"general",month:6,type:"care",summary:"无尽夏调蓝最后窗口，7月就来不及了",detail:"调蓝：硫酸铝 5g/L 水，每周灌根一次，连用3周\n浇水：绣球是吸水怪，夏天早晚各浇一次\n遮阴：30℃以上半日照，否则焦叶",tags:["可调蓝","浇水","需遮阴"],why_now:"6月无尽夏调蓝最后窗口！7月就来不及了，现在不调蓝就开粉色",quick_actions:["硫酸铝5g/L水每周灌根","夏天早晚各浇一次","30℃以上半日照遮阴"],scenario_balcony:"封闭阳台：盆越大花球越大，需每天浇水",scenario_garden:"露台花园党：地栽壮观，需遮阴防焦叶",scenario_beginner:"新手须知：无尽夏新老枝都开花，最好养",pitfalls:["⚠️ 30℃以上暴晒必焦叶！夏天必须遮阴","缺水就蔫，夏天一天不浇就倒"],bigbrother_tip:"我的经验：调蓝从5月中开始，硫酸铝连用3周，7月就定色了",product_keywords:["绣球苗","硫酸铝调蓝剂","花卉型水溶肥"]},
{plant:"百合",season:"summer",region:"general",month:6,type:"bloom",summary:"6月正是百合盛花期，香气满园",detail:"品种：OT百合（树百合）最推荐，高1.5m+花大香浓\n花后：剪残花留叶片，正常浇水施肥养球\n复花：地栽每年复花，盆栽需每年换土",tags:["香花","球根","多年生"],why_now:"6月百合盛花期！现在种春百合来不及了，但可以赏花+花后养球等明年",quick_actions:["开完花的剪残花留叶片","继续浇水施肥养球","盆栽每年换一次土"],scenario_balcony:"封闭阳台：选矮生品种，盆深20cm以上",scenario_garden:"露台花园党：地栽每年复花，OT百合能长1.5m高",scenario_beginner:"新手入门：选OT百合（树百合）最推荐，高1.5m+花大香浓",pitfalls:["花后千万别剪光叶子！叶子是养球的关键"],bigbrother_tip:"推荐理由：OT百合（树百合）最推荐，高1.5m+花大香浓",product_keywords:["百合种球","有机肥骨粉","深花盆"]},
{plant:"三角梅",season:"summer",region:"south",month:6,type:"bloom",summary:"华南三角梅全年开花，6月盛花期",detail:"控水促花：叶子微蔫再浇，反复3次出花芽\n修剪：花后剪掉1/3枝条\n注意：华南可地栽，华东需盆栽入室",tags:["耐热","全年开花","新手友好"],why_now:"6月三角梅盛花期！控水促花正当时，叶子微蔫再浇=爆花",quick_actions:["叶子微蔫再浇反复3次","花后剪掉1/3枝条","全日照暴晒促花"],scenario_balcony:"封闭阳台：光照要超足，非全日照不开花",scenario_garden:"花园：华南一年开300天，暴晒就爆花",scenario_beginner:"新手入门：光照是开花唯一变量；每天6小时直射光",pitfalls:["⚠️ 缺光只长叶不开花！三角梅是日照狂魔"],bigbrother_tip:"种植心得：控水是关键——叶子微蔫再浇，反复3次必出花芽",product_keywords:["三角梅苗","缓释肥","控根盆"]},
{plant:"铁线莲",season:"spring",region:"general",month:4,type:"care",summary:"藤本皇后春季修剪指南，剪错了整年不开花",detail:"一类修剪（早花大花组）：花后轻剪残花即可\n二类修剪（晚花大花组）：2月底重剪留2-3节\n三类修剪（全缘/意大利组）：冬季贴地重剪",tags:["藤本","修剪","多年生"],why_now:"4月铁线莲生长旺季，修剪和牵引决定整年花量。剪错了整年不开花",quick_actions:["确定品种修剪类型","早花组花后轻剪残花","晚花组追肥促芽"],scenario_balcony:"封闭阳台：选矮生品种，盆深30cm以上，搭支撑架",scenario_garden:"露台花园党：地栽爬满拱门/围栏，效果震撼",scenario_beginner:"新手须知：先确认品种修剪类型，一类不重剪、二类轻剪、三类重剪",pitfalls:["⚠️ 不清楚品种千万别乱剪！铁线莲剪错类型=全年无花"],bigbrother_tip:"我的经验：新手从三类修剪品种入手（如波兰精神），冬季贴地重剪最省心",product_keywords:["铁线莲花苗","攀爬架","缓释肥"]},
{plant:"仙客来",season:"winter",region:"general",month:12,type:"care",summary:"年宵花养护，浇水只能浸盆",detail:"浇水：浸盆法从底部给水，千万不能浇到球心\n温度：低温可延长花期，远离暖气出风口\n施肥：花期每两周一次薄磷钾肥",tags:["年宵花","耐寒","多年生"],why_now:"12月仙客来盛花期！浇水只能浸盆从底部给水，浇到球心必死",quick_actions:["浸盆法从底部给水","远离暖气出风口","每两周一次薄磷钾肥"],scenario_balcony:"封闭阳台：散射光就行，怕晒怕热，室内明亮处即可",scenario_beginner:"新手须知：浇水只能浸盆从底部给水！浇到球心必死",pitfalls:["⚠️ 千万不能浇到球心！只能浸盆从底部给水","高于25℃就休眠，夏天叶子枯了别扔"],bigbrother_tip:"我的经验：冬天放冷凉处花期最长，远离暖气，一盆能看半年花",product_keywords:["仙客来成品花","磷钾薄肥","陶盆"]},
{plant:"郁金香",season:"spring",region:"general",month:3,type:"bloom",summary:"3月郁金香陆续开放，球根花卉王者",detail:"品种推荐：重瓣系列花期更长，达尔文系列最经典\n养护：花后剪残花保留叶，继续养球至6月叶黄收球\n注意：需5℃以下低温春化6周以上",tags:["球根","需春化","多年生"],why_now:"3月郁金香陆续开放！花后养球决定明年能不能复花",quick_actions:["花后剪残花保留叶片","继续浇水施肥养球","6月叶黄后收球冷藏"],scenario_balcony:"封闭阳台：选矮生品种，盆深15cm以上，密植效果佳",scenario_garden:"花园：地栽群植效果震撼，早春第一抹色彩",scenario_beginner:"新手须知：需5℃以下低温春化6周以上，华南需冰箱处理",pitfalls:["⚠️ 花后千万别剪叶子！叶子养球，剪了明年不开花","华南自然低温不够需冰箱冷藏春化"],bigbrother_tip:"推荐理由：重瓣系列花期更长，达尔文系列最经典",product_keywords:["郁金香种球","球根专用土","骨粉底肥"]},
{plant:"菊花",season:"autumn",region:"general",month:9,type:"care",summary:"9月开始控水促花，秋菊打顶最后期限",detail:"打顶：9月10日前最后一次打顶，之后任其开花\n施肥：改施磷钾肥促花，停氮肥\n支撑：株高30cm以上需插杆防倒伏",tags:["打顶","促花","多年生"],why_now:"9月秋菊打顶最后期限！9月10日前必须完成最后打顶，之后只能等开花",quick_actions:["9月10日前完成打顶","改施磷钾肥促花","株高30cm以上插杆支撑"],scenario_balcony:"封闭阳台：选矮生品种盆栽，株高控制在40cm以内",scenario_garden:"花园：地栽成片效果震撼，秋冬主角",scenario_beginner:"新手须知：9月10日前最后一次打顶，之后任其开花",pitfalls:["⚠️ 9月10日后别再打顶！再打就错过花期了"],bigbrother_tip:"种植心得：我的菊花每年9月初最后一打，10月底准时爆花",product_keywords:["菊花苗","磷钾肥","支撑杆"]}
]};
}

function renderAll() {
  renderSeasonCards();
  renderMonthPicker();
  renderRegions();
  renderContent();
}

// ===== Render Season Cards =====
function renderSeasonCards() {
  const el = document.getElementById('seasonStrip');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSeason = DATA.seasons.find(s => s.months.includes(currentMonth));

  el.innerHTML = DATA.seasons.map(s => `
    <div class="season-card${s.id === state.season ? ' active' : ''}"
         data-season="${s.id}" onclick="selectSeason('${s.id}')">
      <span class="icon">${s.icon}</span>
      <span class="label">${s.label}</span>
      <span class="months">${s.months[0]}-${s.months[2]}月</span>
      ${s.id === (currentSeason ? currentSeason.id : '') ? '<span class="season-badge">当季</span>' : ''}
    </div>
  `).join('');
}

// ===== Select Season =====
function selectSeason(id) {
  state.season = id;
  const s = DATA.seasons.find(x => x.id === id);
  state.month = s.months[0];
  state.selectedDay = null;
  renderSeasonCards();
  renderMonthPicker();
  renderRegions();
  renderContent();
}

// ===== Render Month Picker =====
function renderMonthPicker() {
  const s = DATA.seasons.find(x => x.id === state.season);
  const now = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth()+1, d: now.getDate() };

  document.getElementById('monthLabel').textContent = `${state.month}月`;

  document.getElementById('prevMonth').onclick = () => {
    const idx = s.months.indexOf(state.month);
    if (idx > 0) { state.month = s.months[idx-1]; state.selectedDay = null; renderMonthPicker(); renderContent(); }
  };
  document.getElementById('nextMonth').onclick = () => {
    const idx = s.months.indexOf(state.month);
    if (idx < s.months.length-1) { state.month = s.months[idx+1]; state.selectedDay = null; renderMonthPicker(); renderContent(); }
  };

  // Mini calendar
  const year = today.m === state.month ? today.y : 2026;
  const firstDay = new Date(year, state.month-1, 1).getDay();
  const daysInMonth = new Date(year, state.month, 0).getDate();

  const contentDays = new Set();
  DATA.content.forEach(c => {
    if (c.season === state.season && (c.region === state.region || c.region === 'general')) {
      contentDays.add(c.month);
    }
  });

  let calHTML = '<div class="cal-weekdays">';
  ['日','一','二','三','四','五','六'].forEach(d => calHTML += `<span>${d}</span>`);
  calHTML += '</div><div class="cal-grid">';

  for (let i = 0; i < firstDay; i++) calHTML += '<div class="cal-cell empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    let cls = 'cal-cell';
    if (contentDays.has(d)) cls += ' has-content';
    if (today.m === state.month && d === today.d) cls += ' today';
    if (state.selectedDay === d) cls += ' active';
    calHTML += `<div class="${cls}" onclick="selectDay(${d})" data-day="${d}">${d}</div>`;
  }
  calHTML += '</div>';
  document.getElementById('miniCal').innerHTML = calHTML;

  // Month tabs
  document.getElementById('monthTabs').innerHTML = s.months.map(m =>
    `<div class="month-tab${m === state.month ? ' active' : ''}" onclick="switchMonth(${m})">${m}月</div>`
  ).join('');

  // Disable prev/next at bounds
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  prevBtn.style.opacity = s.months.indexOf(state.month) === 0 ? '0.3' : '1';
  nextBtn.style.opacity = s.months.indexOf(state.month) === s.months.length-1 ? '0.3' : '1';
}

function switchMonth(m) {
  state.month = m;
  state.selectedDay = null;
  renderMonthPicker();
  renderContent();
}

function selectDay(d) {
  state.selectedDay = state.selectedDay === d ? null : d;
  renderMonthPicker();
  renderContent();
  document.getElementById('contentArea').scrollIntoView({ behavior: 'smooth' });
}

// ===== Render Regions =====
function renderRegions() {
  const el = document.getElementById('regionStrip');
  el.innerHTML = DATA.regions.map(r =>
    `<div class="region-chip${r.id === state.region ? ' active' : ''}"
         onclick="selectRegion('${r.id}')">
      ${r.label} <span class="zone">${r.zone}</span>
    </div>`
  ).join('');
}

function selectRegion(id) {
  state.region = id;
  renderRegions();
  renderMonthPicker();
  renderContent();
}

// ===== Render Content =====
function renderContent() {
  const el = document.getElementById('contentArea');
  const s = DATA.seasons.find(x => x.id === state.season);

  // Filter
  let items = DATA.content.filter(c => {
    return c.season === state.season
      && (!state.selectedDay || c.month === state.selectedDay)
      && (c.region === state.region || c.region === 'general')
      && (!state.search || c.plant.includes(state.search)
        || c.summary.includes(state.search) || c.detail.includes(state.search));
  });

  // Context label
  const monthStr = state.selectedDay ? `${state.month}月${state.selectedDay}日` : `${state.month}月`;
  document.getElementById('ctxLabel').textContent = `${s.icon} ${s.label} · ${monthStr}`;
  document.getElementById('ctxCount').textContent = `${items.length} 条内容`;

  // Group by type
  const groups = {
    plant: { icon:'🌱', label:'当月可种' },
    care: { icon:'✂️', label:'当月养护' },
    bloom: { icon:'🌸', label:'当月开花' }
  };

  let html = '';
  for (const [type, meta] of Object.entries(groups)) {
    const groupItems = items.filter(i => i.type === type);
    if (groupItems.length === 0) continue;
    html += `<div class="content-group">
      <div class="content-group-title">${meta.icon} ${meta.label} · ${groupItems.length}种</div>`;
    groupItems.forEach((item, idx) => {
      html += `
      <div class="plant-card" id="card-${type}-${idx}" onclick="toggleCard('card-${type}-${idx}')">
        <div class="card-header">
          <span class="plant-icon">${meta.icon}</span>
          <span class="plant-name">${escapeHTML(item.plant)}</span>
          <span class="plant-arrow">▶</span>
        </div>
        <div class="card-summary">${escapeHTML(item.summary)}</div>`;

      // v3 新增：🎯 为什么现在该做
      if (item.why_now) {
        html += `<div class="card-why-now">🎯 ${escapeHTML(item.why_now)}</div>`;
      }

      // 标签行（原有）
      html += `<div class="card-tags">${(item.tags||[]).map(t => `<span class="card-tag">${escapeHTML(t)}</span>`).join('')}</div>`;

      // v3 新增：🏠🌳🌱 场景建议
      if (item.scenario_balcony || item.scenario_garden || item.scenario_beginner) {
        html += '<div class="card-scenarios">';
        if (item.scenario_balcony) html += `<span class="scenario-tag">🏠 ${escapeHTML(item.scenario_balcony)}</span>`;
        if (item.scenario_garden) html += `<span class="scenario-tag">🌳 ${escapeHTML(item.scenario_garden)}</span>`;
        if (item.scenario_beginner) html += `<span class="scenario-tag">🌱 ${escapeHTML(item.scenario_beginner)}</span>`;
        html += '</div>';
      }

      // v3 新增：⚠️ 避坑提醒
      if (item.pitfalls && item.pitfalls.length > 0) {
        html += '<div class="card-pitfalls">';
        item.pitfalls.forEach(p => {
          html += `<span class="pitfall-item">⚠️ ${escapeHTML(p)}</span>`;
        });
        html += '</div>';
      }

      // v3 新增：💬 大大经验
      if (item.bigbrother_tip) {
        html += `<div class="card-bigbrother">💬 ${escapeHTML(item.bigbrother_tip)}</div>`;
      }

      // v3 新增：🔗 相关好物
      if (item.product_keywords && item.product_keywords.length > 0) {
        html += '<div class="card-products"><span class="prod-label">🔗 相关好物</span>';
        item.product_keywords.forEach(kw => {
          html += `<span class="prod-kw">${escapeHTML(kw)}</span>`;
        });
        html += '</div>';
      }

      // 原有：详情 + 复制（展开态）
      html += `
        <div class="card-detail">${escapeHTML(item.detail || '')}</div>
        <button class="copy-btn" onclick="event.stopPropagation();copyContent('card-${type}-${idx}')">📋 复制话术</button>
      </div>`;
    });
    html += '</div>';
  }

  if (items.length === 0) {
    html = `<div class="empty-state">
      <span class="icon">🍃</span>
      <span class="text">这个时间段暂无养护内容<br>试试切换区域或月份</span>
    </div>`;
  }

  el.innerHTML = html;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function toggleCard(id) {
  const card = document.getElementById(id);
  card.classList.toggle('expanded');
}

function copyContent(cardId) {
  const card = document.getElementById(cardId);
  const name = card.querySelector('.plant-name').textContent;
  const detail = card.querySelector('.card-detail').textContent;

  // 组合富文本话术：why_now + detail
  const whyNow = card.querySelector('.card-why-now');
  const bigBroTip = card.querySelector('.card-bigbrother');
  let copyText = `【${name}】\n`;
  if (whyNow) copyText += `${whyNow.textContent}\n\n`;
  copyText += detail;
  if (bigBroTip) copyText += `\n\n${bigBroTip.textContent}`;

  navigator.clipboard.writeText(copyText).then(() => {
    const btn = card.querySelector('.copy-btn');
    btn.textContent = '✅ 已复制';
    btn.classList.add('copied');
    showToast('✅ 已复制到剪贴板');
    setTimeout(() => { btn.textContent = '📋 复制话术'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    // Clipboard API 不可用时静默失败
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== Bind Events =====
function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', function(e) {
    state.search = e.target.value.trim();
    renderContent();
  });
}

// ===== Boot =====
init();
