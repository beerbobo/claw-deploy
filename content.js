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
{plant:"蓝雪花",season:"summer",region:"east",month:6,type:"plant",summary:"耐热开花机器，华东6月可播种，7-10天出芽",detail:"播种：25-30℃ 温水浸种4小时 → 育苗土 → 7-10天出芽 → 45天开花\n养护：全日照，见干见湿，每周一次花卉肥\n注意：不耐寒，华东11月前入室越冬",tags:["新手友好","花期长","耐热"]},
{plant:"太阳花",season:"summer",region:"general",month:6,type:"plant",summary:"死不了系列，越热越开花，撒种就活",detail:"播种：直接撒播，覆薄土，保持湿润 → 3-5天出芽\n养护：全日照，极耐旱，土干透再浇\n花期：6-10月，单朵1天但持续爆花",tags:["新手友好","耐旱","爆花"]},
{plant:"茉莉花",season:"summer",region:"east",month:6,type:"plant",summary:"六月茉莉香，华东阳台必备香花",detail:"选购：挑花苞多的苗，不要买光杆\n养护：全日照，喜酸性土，每月硫酸亚铁一次\n花期：6-9月，花后及时修剪促分枝",tags:["香花","多年生","耐热"]},
{plant:"牵牛花",season:"summer",region:"general",month:6,type:"plant",summary:"爬藤速度快，遮阳+赏花一举两得",detail:"播种：种子锉一下皮，温水泡一晚 → 直播 → 3-5天出芽\n养护：全日照，土表干了就浇，每周薄肥",tags:["藤本","新手友好","遮阳"]},
{plant:"月季",season:"summer",region:"general",month:6,type:"care",summary:"花后修剪+追肥，为秋花蓄力",detail:"修剪：花下第3片五叶处下剪，统一朝外芽点\n追肥：花后一周复合肥，两周一次花卉肥\n病害：6月黑斑高发，雨前喷代森锰锌预防",tags:["修剪","追肥","病害预防"]},
{plant:"绣球",season:"summer",region:"general",month:6,type:"care",summary:"无尽夏调蓝最后窗口，7月就来不及了",detail:"调蓝：硫酸铝 5g/L 水，每周灌根一次，连用3周\n浇水：绣球是吸水怪，夏天早晚各浇一次\n遮阴：30℃以上半日照，否则焦叶",tags:["可调蓝","浇水","需遮阴"]},
{plant:"百子莲",season:"summer",region:"east",month:6,type:"bloom",summary:"蓝色烟花，华东6月准时绽放",detail:"观赏：花球直径可达20cm，蓝紫色渐变\n养护：花后剪掉残花，保留叶片养球\n注意：不耐积水，盆底垫陶粒",tags:["球根","多年生","花期长"]},
{plant:"百合",season:"summer",region:"general",month:6,type:"bloom",summary:"6月正是百合盛花期，香气满园",detail:"品种：OT百合（树百合）最推荐，高1.5m+花大香浓\n花后：剪残花留叶片，正常浇水施肥养球\n复花：地栽每年复花，盆栽需每年换土",tags:["香花","球根","多年生"]},
{plant:"三角梅",season:"summer",region:"south",month:6,type:"bloom",summary:"华南三角梅全年开花，6月盛花期",detail:"控水促花：叶子微蔫再浇，反复3次出花芽\n修剪：花后剪掉1/3枝条\n注意：华南可地栽，华东需盆栽入室",tags:["耐热","全年开花","新手友好"]},
{plant:"郁金香",season:"spring",region:"general",month:3,type:"bloom",summary:"3月郁金香陆续开放，球根花卉王者",detail:"品种推荐：重瓣系列花期更长，达尔文系列最经典\n养护：花后剪残花保留叶，继续养球至6月叶黄收球\n注意：需5℃以下低温春化6周以上",tags:["球根","需春化","多年生"]},
{plant:"玛格丽特",season:"spring",region:"general",month:3,type:"plant",summary:"春天必入草花，3月播种正好",detail:"播种：20℃左右直播，5-7天出芽\n养护：全日照，勤打顶促分枝，成球效果\n花期：4-6月爆花，夏季休眠",tags:["新手友好","爆花","春季限定"]},
{plant:"角堇",season:"spring",region:"general",month:3,type:"plant",summary:"早春播种，4月就能看花",detail:"播种：18-22℃，覆土遮光，7天出芽\n养护：半日照即可，耐-5℃低温\n花期：4-6月，秋天还可再播一批",tags:["新手友好","耐寒","花期长"]},
{plant:"铁线莲",season:"spring",region:"general",month:4,type:"care",summary:"藤本皇后春季修剪指南，剪错了整年不开花",detail:"一类修剪（早花大花组）：花后轻剪残花即可\n二类修剪（晚花大花组）：2月底重剪留2-3节\n三类修剪（全缘/意大利组）：冬季贴地重剪",tags:["藤本","修剪","多年生"]},
{plant:"报春/樱草",season:"spring",region:"general",month:3,type:"bloom",summary:"早春爆款，阳台必备报春花",detail:"养护：半日照，保持湿润，开花期每周薄肥\n品种：玫瑰报春、陕西羽叶报春、安徽羽叶报春\n注意：怕暴晒，花后留种可自播",tags:["新手友好","春季限定","爆花"]},
{plant:"蝴蝶兰",season:"spring",region:"general",month:4,type:"bloom",summary:"4月蝴蝶兰换盆最佳时机",detail:"换盆：花谢后立即换盆，剪掉空根烂根\n植料：水苔或树皮，透气沥水为第一\n养护：明亮散射光，保持湿润不积水",tags:["年宵花","花期长","多年生"]},
{plant:"菊花",season:"autumn",region:"general",month:9,type:"care",summary:"9月开始控水促花，秋菊打顶最后期限",detail:"打顶：9月10日前最后一次打顶，之后任其开花\n施肥：改施磷钾肥促花，停氮肥\n支撑：株高30cm以上需插杆防倒伏",tags:["打顶","促花","多年生"]},
{plant:"角堇",season:"autumn",region:"general",month:10,type:"plant",summary:"秋冬草花王者，10月播种正好",detail:"播种：18-22℃，覆土遮光，7天出芽\n养护：半日照即可，耐-5℃低温\n花期：11月-次年5月，长江流域可室外越冬",tags:["新手友好","耐寒","花期长"]},
{plant:"仙客来",season:"autumn",region:"general",month:10,type:"bloom",summary:"秋冬室内开花女王，10月开始打花苞",detail:"养护：散射光即可，浇水只能浸盆从底部给\n温度：10-18℃最适，高于25℃休眠\n花期：12月-次年4月，一盆点亮整个冬天",tags:["年宵花","花期长","新手友好"]},
{plant:"水仙",season:"winter",region:"general",month:12,type:"plant",summary:"12月水仙雕刻，春节刚好开花",detail:"选购：挑漳州水仙球，球大花箭多\n水培：剥皮→刻伤→清水养，每2天换水\n花期控制：12月下水→40-45天开花，正好春节",tags:["年宵花","球根","新手友好"]},
{plant:"蜡梅",season:"winter",region:"general",month:1,type:"bloom",summary:"寒冬腊月蜡梅香，-15℃无压力",detail:"品种：素心蜡梅最香，狗牙蜡梅花小味淡\n养护：喜阳耐寒，-15℃无压力，随便种\n修剪：花后及时修剪整形",tags:["香花","耐寒","多年生"]},
{plant:"蝴蝶兰",season:"winter",region:"general",month:1,type:"care",summary:"冬季花期管理，延长观赏期到半年",detail:"温度：保持15-25℃，低于10℃掉花苞\n浇水：水苔表面干了再浇，约7-10天一次\n光照：明亮散射光，不可暴晒",tags:["年宵花","花期长","多年生"]},
{plant:"仙客来",season:"winter",region:"general",month:12,type:"care",summary:"年宵花养护，浇水只能浸盆",detail:"浇水：浸盆法从底部给水，千万不能浇到球心\n温度：低温可延长花期，远离暖气出风口\n施肥：花期每两周一次薄磷钾肥",tags:["年宵花","耐寒","多年生"]}
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
          <span class="plant-name">${item.plant}</span>
          <span class="plant-arrow">▶</span>
        </div>
        <div class="card-summary">${escapeHTML(item.summary)}</div>
        <div class="card-tags">${(item.tags||[]).map(t => `<span class="card-tag">${escapeHTML(t)}</span>`).join('')}</div>
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
  navigator.clipboard.writeText(`【${name}】\n${detail}`).then(() => {
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
