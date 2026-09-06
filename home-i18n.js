(()=>{
        const i18n = {
          en: {
            pageTitle: "XXX Aurora",
            pageDescription: "XXX Aurora personal gateway: project overview and contact.",
            navHello: "Intro",
            navProjects: "Projects",
            navPlayground: "Playground",
            navContact: "Contact",
            heroTitle: "Curious by nature.",
            heroAccent: "Builder by choice.",
            heroBody:
              "I’m Max, an AI student at King’s College London. I turn curious ideas into intelligent systems and playful experiments. Build first, understand later.",
            heroBtnProjects: "View projects",
            heroBtnPlayground: "See playground",
            projectsTitle: "Selected work",
            projectsSub: "Exploring intelligence, one project at a time.",
            potemkinTitle: "Project Potemkin",
            potemkinTag: "AI Agent & Memory Systems",
            potemkinBody:
              "An AI companion system with persistent memory and autonomous behavior, exploring long-term human-AI interaction and intelligent agents that evolve over time.",
            starmaxTitle: "StarMax",
            starmaxTag: "SC2 Macro Coach / Human-AI Collaboration",
            starmaxBody:
              "A human-AI collaborative macro coaching system for StarCraft II, focused on interpretable state abstractions and actionable suggestions.",
            quickAidTitle: "Quick-Aid",
            quickAidTag: "Emergency Navigation AI",
            quickAidBody:
              "An emergency navigation app that helps users choose the fastest suitable A&E by combining urgency, insurance access, travel time, and expected waits.",
            viewDetails: "View details",
            playgroundTitle: "Playground",
            playgroundSub: "Small fun experiments and quirky tools built for testing ideas.",
            soulspiritTitle: "SoulSpirit",
            soulspiritTag: "Cocktail Test Lab",
            soulspiritBody:
              "A playful testing program for customizing cocktails by mood and taste preferences.",
            soulspiritNote:
              "Currently used for idea testing and recipe prototyping.",
            cybermasterTitle: "CyberMaster",
            cybermasterTag: "Cyber Fortune Teller",
            cybermasterBody:
              "A fun cyber divination app that generates themed fortunes and playful personality readings.",
            cybermasterNote: "Built as an entertainment-only experiment.",
            playgroundViewDetails: "View details",
            playgroundLaunch: "Launch app",
            contactTitle: "Let’s connect",
            contactLead: "If you'd like to discuss projects, writing, or collaboration, email me at",
            contactTail: "."
          },
          zh: {
            pageTitle: "XXX Aurora 个人导航",
            pageDescription: "XXX Aurora 的个人导航页：项目总览与联系方式。",
            navHello: "简介",
            navProjects: "项目",
            navPlayground: "游乐场",
            navContact: "联系",
            heroTitle: "由好奇心出发。",
            heroAccent: "用创造来回答。",
            heroBody:
              "我是 Max，伦敦国王学院的人工智能专业学生。把脑海里的好奇，变成智能系统和有趣的实验。先动手创造，再慢慢理解。",
            heroBtnProjects: "查看项目",
            heroBtnPlayground: "查看游乐场",
            projectsTitle: "精选项目",
            projectsSub: "在一次次构建中，探索智能的可能。",
            potemkinTitle: "Project Potemkin",
            potemkinTag: "人工智能体 与记忆系统",
            potemkinBody:
              "一个具有长期记忆能力与自主行为的 人工智能体 系统，探索人与人工智能 的长期交互以及智能体随时间成长的可能性。",
            starmaxTitle: "StarMax",
            starmaxTag: "星际争霸Ⅱ宏观教练 / 人机协作",
            starmaxBody:
              "一个面向星际争霸 II 的人机协作宏观教练系统，强调可解释的游戏状态抽象和可执行建议。",
            quickAidTitle: "Quick-Aid",
            quickAidTag: "智能应急就医导航",
            quickAidBody:
              "一个应急就医导航应用，综合紧急程度、保险可及性、路程时间与候诊时长，帮助用户更快选择合适的 急诊医院。",
            viewDetails: "查看详情",
            playgroundTitle: "游乐场",
            playgroundSub: "放一些好玩的实验程序和小工具，用来测试新想法。",
            soulspiritTitle: "SoulSpirit",
            soulspiritTag: "定制鸡尾酒测试程序",
            soulspiritBody:
              "一个用于测试定制鸡尾酒的小程序，会根据心情和口味偏好生成玩法与配方方向。",
            soulspiritNote:
              "当前用于快速试验创意和配方原型。",
            cybermasterTitle: "CyberMaster",
            cybermasterTag: "赛博算命大师",
            cybermasterBody:
              "一个偏娱乐向的赛博算命程序，会生成主题化运势和趣味人格解读。",
            cybermasterNote: "目前作为娱乐实验项目运行。",
            playgroundViewDetails: "查看详情",
            playgroundLaunch: "进入项目",
            contactTitle: "聊聊新想法",
            contactLead: "如果你想交流项目、内容或合作，请发邮件到",
            contactTail: "。"
          }
        };


const buttons = document.querySelectorAll('[data-lang-btn]');
function applyLanguage(lang) {
  window.applySharedLanguage(lang);
  const dict = i18n[lang] || i18n.en;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = dict.pageTitle;
  document.querySelector('meta[name="description"]').content = dict.pageDescription;
  document.querySelectorAll('[data-i18n]').forEach(node => {
    if (dict[node.dataset.i18n]) node.textContent = dict[node.dataset.i18n];
  });
  buttons.forEach(button => {
    const active = button.dataset.langBtn === lang;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  try { localStorage.setItem('site-lang', lang); } catch {}
}
buttons.forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.langBtn)));
let language = 'en';
try { if (localStorage.getItem('site-lang') === 'zh') language = 'zh'; } catch {}
applyLanguage(language);
})();
