// 共享文字保留原有节点和排版，首页与详情使用同一套语言切换。
(() => {
  const copy = {
  "/ PERSONAL UNIVERSE": [
    "/ PERSONAL UNIVERSE",
    "/ 个人宇宙"
  ],
  "A LITTLE CURIOSITY. ENDLESS POSSIBILITIES.": [
    "A LITTLE CURIOSITY. ENDLESS POSSIBILITIES.",
    "一点好奇，无限可能。"
  ],
  "Build first. Understand later.": [
    "Build first. Understand later.",
    "先动手创造，再慢慢理解。"
  ],
  "Choose your language to enter / 选择语言进入": [
    "Choose your language to enter",
    "选择语言进入"
  ],
  "English": [
    "English",
    "英文"
  ],
  "中文": [
    "Chinese",
    "中文"
  ],
  "EN": [
    "EN",
    "英文"
  ],
  "IDEAS → EXPERIMENTS → POSSIBILITIES": [
    "IDEAS → EXPERIMENTS → POSSIBILITIES",
    "想法 → 实验 → 可能"
  ],
  "Skip intro / 跳过": [
    "Skip intro",
    "跳过开场"
  ],
  "Skip to content / 跳转至内容": [
    "Skip to content",
    "跳转至内容"
  ],
  "GitHub ↗": [
    "GitHub ↗",
    "代码主页 ↗"
  ],
  "GitHub": [
    "GitHub",
    "代码仓库"
  ],
  "EXPLORING THE POSSIBLE": [
    "EXPLORING THE POSSIBLE",
    "探索可能"
  ],
  "MAX / AI STUDENT & CREATIVE BUILDER": [
    "MAX / AI STUDENT & CREATIVE BUILDER",
    "MAX / 人工智能学生与创作者"
  ],
  "KING’S COLLEGE LONDON · ARTIFICIAL INTELLIGENCE": [
    "KING’S COLLEGE LONDON · ARTIFICIAL INTELLIGENCE",
    "伦敦国王学院 · 人工智能"
  ],
  "SCROLL TO EXPLORE": [
    "SCROLL TO EXPLORE",
    "向下探索"
  ],
  "01 / SELECTED WORK": [
    "01 / SELECTED WORK",
    "01 / 精选作品"
  ],
  "A FEW THINGS I’VE BUILT / 2026": [
    "A FEW THINGS I’VE BUILT / 2026",
    "我的一些创作 / 2026"
  ],
  "MEMORY SYSTEMS": [
    "MEMORY SYSTEMS",
    "记忆系统"
  ],
  "More than": [
    "More than",
    "不止"
  ],
  "a conversation.": [
    "a conversation.",
    "一次对话。"
  ],
  "A continuum.": [
    "A continuum.",
    "让记忆延续。"
  ],
  "A MEMORY THAT STAYS.": [
    "A MEMORY THAT STAYS.",
    "让记忆留下来。"
  ],
  "01 / INPUT": [
    "01 / INPUT",
    "01 / 输入"
  ],
  "Conversation": [
    "Conversation",
    "对话"
  ],
  "02 / CONTEXT": [
    "02 / CONTEXT",
    "02 / 上下文"
  ],
  "Short-term memory": [
    "Short-term memory",
    "短期记忆"
  ],
  "03 / CONTINUITY": [
    "03 / CONTINUITY",
    "03 / 延续"
  ],
  "Long-term memory": [
    "Long-term memory",
    "长期记忆"
  ],
  "HUMAN ↔ AGENT": [
    "HUMAN ↔ AGENT",
    "人与智能体"
  ],
  "PERSISTENT BY DESIGN ↗": [
    "PERSISTENT BY DESIGN ↗",
    "为长久陪伴而设计 ↗"
  ],
  "HUMAN + AI": [
    "HUMAN + AI",
    "人机协作"
  ],
  "Think": [
    "Think",
    "思考"
  ],
  "one move": [
    "one move",
    "领先"
  ],
  "ahead": [
    "ahead",
    "一步"
  ],
  "REPLAY": [
    "REPLAY",
    "回放"
  ],
  "STATE": [
    "STATE",
    "状态"
  ],
  "NEXT ACTION": [
    "NEXT ACTION",
    "下一步行动"
  ],
  "STARCRAFT II": [
    "STARCRAFT II",
    "星际争霸Ⅱ"
  ],
  "MACRO COACHING": [
    "MACRO COACHING",
    "宏观决策教练"
  ],
  "CARE, CONNECTED": [
    "CARE, CONNECTED",
    "连接你与医疗服务"
  ],
  "Less searching.": [
    "Less searching.",
    "少一些寻找。"
  ],
  "Closer to care.": [
    "Closer to care.",
    "离就医更近。"
  ],
  "YOU": [
    "YOU",
    "你"
  ],
  "URGENCY": [
    "URGENCY",
    "紧急程度"
  ],
  "TRAVEL TIME": [
    "TRAVEL TIME",
    "路程时间"
  ],
  "EXPECTED WAIT": [
    "EXPECTED WAIT",
    "预计候诊"
  ],
  "A&E NAVIGATION": [
    "A&E NAVIGATION",
    "急诊导航"
  ],
  "FIND A SUITABLE ROUTE ↗": [
    "FIND A SUITABLE ROUTE ↗",
    "找到合适的就医路径 ↗"
  ],
  "02 / SIDE QUESTS": [
    "02 / SIDE QUESTS",
    "02 / 趣味实验"
  ],
  "TASTE EXPERIMENT NO. 01": [
    "TASTE EXPERIMENT NO. 01",
    "风味实验 · 第一号"
  ],
  "In good": [
    "In good",
    "微醺"
  ],
  "spirits.": [
    "spirits.",
    "恰好。"
  ],
  "SILKY": [
    "SILKY",
    "丝滑"
  ],
  "CRISP ↗": [
    "CRISP ↗",
    "清冽 ↗"
  ],
  "SPARKLING": [
    "SPARKLING",
    "气泡"
  ],
  "A LITTLE MOOD. A LITTLE MIXOLOGY.": [
    "A LITTLE MOOD. A LITTLE MIXOLOGY.",
    "一点心情，一点调酒灵感。"
  ],
  "ANCIENT × DIGITAL": [
    "ANCIENT × DIGITAL",
    "古老智慧 × 数字体验"
  ],
  "问": [
    "ASK",
    "问"
  ],
  "卦": [
    "FATE",
    "卦"
  ],
  "AN OLD QUESTION.": [
    "AN OLD QUESTION.",
    "古老的问题。"
  ],
  "A NEW INTERFACE.": [
    "A NEW INTERFACE.",
    "全新的界面。"
  ],
  "CHANCE, WITH CHARACTER.": [
    "CHANCE, WITH CHARACTER.",
    "偶然之中，自有趣味。"
  ],
  "FOR THE FUN OF IT ↗": [
    "FOR THE FUN OF IT ↗",
    "只为有趣 ↗"
  ],
  "03 / SAY HELLO": [
    "03 / SAY HELLO",
    "03 / 打个招呼"
  ],
  "BUILD FIRST. UNDERSTAND LATER.": [
    "BUILD FIRST. UNDERSTAND LATER.",
    "先动手创造，再慢慢理解。"
  ],
  "Replay intro / 重播开场 ↗": [
    "Replay intro ↗",
    "重播开场 ↗"
  ],
  "Language selector": [
    "Language selector",
    "语言选择"
  ],
  "Homepage navigation": [
    "Homepage navigation",
    "主页导航"
  ],
  "XxXAurora home": [
    "XxXAurora home",
    "XxXAurora 主页"
  ],
  "Project Potemkin trailer": [
    "Project Potemkin trailer",
    "Project Potemkin 宣传片"
  ]
};
  const records = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, [data-i18n]')) continue;
    const source = node.textContent.trim();
    if (copy[source]) records.push({ node, values: copy[source], before: node.textContent.match(/^\s*/)[0], after: node.textContent.match(/\s*$/)[0] });
  }
  const attributes = [];
  document.querySelectorAll('[aria-label], [title], [alt]').forEach(node => {
    ['aria-label', 'title', 'alt'].forEach(name => {
      const value = node.getAttribute(name);
      if (copy[value]) attributes.push({ node, name, values: copy[value] });
    });
  });
  window.applySharedLanguage = lang => {
    const index = lang === 'zh' ? 1 : 0;
    records.forEach(({ node, values, before, after }) => { node.textContent = before + values[index] + after; });
    attributes.forEach(({ node, name, values }) => node.setAttribute(name, values[index]));
  };
})();
