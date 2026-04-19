export interface CollocationSeedItem {
  word_simplified: string;
  sentence_zh: string;
  sentence_en: string;
  known_words: string[];
}

export const COLLOCATION_SEED: CollocationSeedItem[] = [
  // ─── HSK 3 ───────────────────────────────────────────────────────────────

  // 打算 (plan to)
  { word_simplified: "打算", sentence_zh: "你打算去哪里？", sentence_en: "Where do you plan to go?", known_words: ["你", "去", "哪里"] },
  { word_simplified: "打算", sentence_zh: "我打算明天学中文。", sentence_en: "I plan to study Chinese tomorrow.", known_words: ["我", "明天", "学", "中文"] },
  { word_simplified: "打算", sentence_zh: "他打算买一本书。", sentence_en: "He plans to buy a book.", known_words: ["他", "买", "一", "书"] },

  // 觉得 (feel / think)
  { word_simplified: "觉得", sentence_zh: "我觉得今天很好。", sentence_en: "I think today is very good.", known_words: ["我", "今天", "很", "好"] },
  { word_simplified: "觉得", sentence_zh: "你觉得这个怎么样？", sentence_en: "What do you think of this?", known_words: ["你", "这个", "怎么样"] },
  { word_simplified: "觉得", sentence_zh: "她觉得学习很有意思。", sentence_en: "She thinks studying is very interesting.", known_words: ["她", "学习", "很"] },

  // 帮助 (help / assist)
  { word_simplified: "帮助", sentence_zh: "老师帮助我学习。", sentence_en: "The teacher helps me study.", known_words: ["老师", "我", "学习"] },
  { word_simplified: "帮助", sentence_zh: "朋友帮助我做作业。", sentence_en: "My friend helps me do homework.", known_words: ["朋友", "我", "做"] },
  { word_simplified: "帮助", sentence_zh: "我想帮助你。", sentence_en: "I want to help you.", known_words: ["我", "想", "你"] },

  // 相信 (believe)
  { word_simplified: "相信", sentence_zh: "我相信你说的话。", sentence_en: "I believe what you said.", known_words: ["我", "你", "说"] },
  { word_simplified: "相信", sentence_zh: "他不相信这件事。", sentence_en: "He doesn't believe this.", known_words: ["他", "不", "这"] },
  { word_simplified: "相信", sentence_zh: "我相信我们能做到。", sentence_en: "I believe we can do it.", known_words: ["我", "我们", "能", "做"] },

  // 发现 (discover / find)
  { word_simplified: "发现", sentence_zh: "我发现他不在家。", sentence_en: "I found that he was not at home.", known_words: ["我", "他", "不", "家"] },
  { word_simplified: "发现", sentence_zh: "她发现了一本好书。", sentence_en: "She discovered a good book.", known_words: ["她", "一", "好", "书"] },
  { word_simplified: "发现", sentence_zh: "你发现什么问题了吗？", sentence_en: "Did you find any problems?", known_words: ["你", "什么", "了", "吗"] },

  // 变化 (change n.)
  { word_simplified: "变化", sentence_zh: "今年的变化很大。", sentence_en: "The changes this year are very big.", known_words: ["今年", "很", "大"] },
  { word_simplified: "变化", sentence_zh: "我看到了很多变化。", sentence_en: "I see a lot of changes.", known_words: ["我", "看到", "很多"] },
  { word_simplified: "变化", sentence_zh: "天气变化很快。", sentence_en: "The weather changes very quickly.", known_words: ["天气", "很", "快"] },

  // 关系 (relationship)
  { word_simplified: "关系", sentence_zh: "我们的关系很好。", sentence_en: "Our relationship is very good.", known_words: ["我们", "的", "很", "好"] },
  { word_simplified: "关系", sentence_zh: "他们是好朋友关系。", sentence_en: "They have a close friendship.", known_words: ["他们", "是", "好", "朋友"] },
  { word_simplified: "关系", sentence_zh: "这件事和我没有关系。", sentence_en: "This matter has nothing to do with me.", known_words: ["这", "和", "我", "没有"] },

  // 结果 (result)
  { word_simplified: "结果", sentence_zh: "考试结果怎么样？", sentence_en: "How were the exam results?", known_words: ["考试", "怎么样"] },
  { word_simplified: "结果", sentence_zh: "他努力学习，结果考了很好。", sentence_en: "He studied hard and as a result did very well.", known_words: ["他", "学习", "考", "很", "好"] },
  { word_simplified: "结果", sentence_zh: "我不知道结果是什么。", sentence_en: "I don't know what the result is.", known_words: ["我", "不", "知道", "是", "什么"] },

  // 教 (teach)
  { word_simplified: "教", sentence_zh: "老师教我们说中文。", sentence_en: "The teacher teaches us to speak Chinese.", known_words: ["老师", "我们", "说", "中文"] },
  { word_simplified: "教", sentence_zh: "他教我做饭。", sentence_en: "He teaches me how to cook.", known_words: ["他", "我", "做饭"] },
  { word_simplified: "教", sentence_zh: "你可以教我吗？", sentence_en: "Can you teach me?", known_words: ["你", "可以", "我", "吗"] },

  // 决定 (decide)
  { word_simplified: "决定", sentence_zh: "我决定明天去。", sentence_en: "I decided to go tomorrow.", known_words: ["我", "明天", "去"] },
  { word_simplified: "决定", sentence_zh: "他决定不买那个。", sentence_en: "He decided not to buy that.", known_words: ["他", "不", "买", "那个"] },
  { word_simplified: "决定", sentence_zh: "我们决定一起学习。", sentence_en: "We decided to study together.", known_words: ["我们", "一起", "学习"] },

  // ─── HSK 4 ───────────────────────────────────────────────────────────────

  // 完成 (complete)
  { word_simplified: "完成", sentence_zh: "我完成了今天的作业。", sentence_en: "I finished today's homework.", known_words: ["我", "了", "今天", "作业"] },
  { word_simplified: "完成", sentence_zh: "他很快完成了工作。", sentence_en: "He completed the work very quickly.", known_words: ["他", "很", "快", "工作"] },
  { word_simplified: "完成", sentence_zh: "你完成了吗？", sentence_en: "Did you finish?", known_words: ["你", "了", "吗"] },

  // 影响 (influence / affect)
  { word_simplified: "影响", sentence_zh: "天气影响我们的生活。", sentence_en: "The weather affects our lives.", known_words: ["天气", "我们", "生活"] },
  { word_simplified: "影响", sentence_zh: "他的话影响了我。", sentence_en: "His words influenced me.", known_words: ["他", "话", "了", "我"] },
  { word_simplified: "影响", sentence_zh: "这件事对你有影响吗？", sentence_en: "Does this matter affect you?", known_words: ["这", "对", "你", "有", "吗"] },

  // 提高 (improve)
  { word_simplified: "提高", sentence_zh: "我想提高我的中文水平。", sentence_en: "I want to improve my Chinese level.", known_words: ["我", "想", "中文"] },
  { word_simplified: "提高", sentence_zh: "多学习可以提高能力。", sentence_en: "Studying more can improve your ability.", known_words: ["多", "学习", "可以", "能力"] },
  { word_simplified: "提高", sentence_zh: "他的成绩提高了很多。", sentence_en: "His grades improved a lot.", known_words: ["他", "了", "很多"] },

  // 出发 (set off / depart)
  { word_simplified: "出发", sentence_zh: "我们明天早上出发。", sentence_en: "We set off tomorrow morning.", known_words: ["我们", "明天", "早上"] },
  { word_simplified: "出发", sentence_zh: "他们八点出发去学校。", sentence_en: "They set off at eight o'clock for school.", known_words: ["他们", "去", "学校"] },
  { word_simplified: "出发", sentence_zh: "你什么时候出发？", sentence_en: "When are you setting off?", known_words: ["你", "什么", "时候"] },

  // 解决 (solve)
  { word_simplified: "解决", sentence_zh: "我们一起解决这个问题。", sentence_en: "Let's solve this problem together.", known_words: ["我们", "一起", "这个"] },
  { word_simplified: "解决", sentence_zh: "老师帮我解决了难题。", sentence_en: "The teacher helped me solve the difficult problem.", known_words: ["老师", "帮", "我", "了"] },
  { word_simplified: "解决", sentence_zh: "这个问题很难解决。", sentence_en: "This problem is very hard to solve.", known_words: ["这个", "很", "难"] },

  // 包括 (include)
  { word_simplified: "包括", sentence_zh: "我们班包括二十个学生。", sentence_en: "Our class includes twenty students.", known_words: ["我们", "班", "学生"] },
  { word_simplified: "包括", sentence_zh: "这里包括很多好吃的东西。", sentence_en: "This includes a lot of delicious things.", known_words: ["这里", "很多", "好吃", "东西"] },
  { word_simplified: "包括", sentence_zh: "作业包括看书和写字。", sentence_en: "The homework includes reading and writing.", known_words: ["作业", "看书", "和", "写字"] },

  // 表示 (indicate / express)
  { word_simplified: "表示", sentence_zh: "他点头表示同意。", sentence_en: "He nodded to show agreement.", known_words: ["他", "同意"] },
  { word_simplified: "表示", sentence_zh: "她的笑表示她很高兴。", sentence_en: "Her smile shows she is very happy.", known_words: ["她", "很", "高兴"] },
  { word_simplified: "表示", sentence_zh: "我想表示感谢。", sentence_en: "I want to express gratitude.", known_words: ["我", "想", "感谢"] },

  // 产生 (produce / generate)
  { word_simplified: "产生", sentence_zh: "学习中文让我产生了兴趣。", sentence_en: "Learning Chinese sparked my interest.", known_words: ["学习", "中文", "让", "我", "了"] },
  { word_simplified: "产生", sentence_zh: "这件事产生了很大影响。", sentence_en: "This matter produced a great impact.", known_words: ["这", "了", "很大"] },
  { word_simplified: "产生", sentence_zh: "新问题产生了。", sentence_en: "A new problem has arisen.", known_words: ["新", "了"] },

  // 进行 (carry out / conduct)
  { word_simplified: "进行", sentence_zh: "老师在进行考试。", sentence_en: "The teacher is conducting an exam.", known_words: ["老师", "在", "考试"] },
  { word_simplified: "进行", sentence_zh: "我们正在进行学习。", sentence_en: "We are currently carrying out our studies.", known_words: ["我们", "正在", "学习"] },
  { word_simplified: "进行", sentence_zh: "工作正在进行中。", sentence_en: "The work is currently in progress.", known_words: ["工作", "正在", "中"] },

  // 重要 (important)
  { word_simplified: "重要", sentence_zh: "学习中文很重要。", sentence_en: "Learning Chinese is very important.", known_words: ["学习", "中文", "很"] },
  { word_simplified: "重要", sentence_zh: "朋友对我很重要。", sentence_en: "Friends are very important to me.", known_words: ["朋友", "对", "我", "很"] },
  { word_simplified: "重要", sentence_zh: "这件事非常重要。", sentence_en: "This matter is extremely important.", known_words: ["这", "非常"] },

  // ─── HSK 5 ───────────────────────────────────────────────────────────────

  // 坚持 (persist)
  { word_simplified: "坚持", sentence_zh: "你要坚持每天学习。", sentence_en: "You must persist in studying every day.", known_words: ["你", "要", "每天", "学习"] },
  { word_simplified: "坚持", sentence_zh: "他坚持跑步三年了。", sentence_en: "He has persisted in running for three years.", known_words: ["他", "跑步", "三", "年", "了"] },
  { word_simplified: "坚持", sentence_zh: "坚持下去就能成功。", sentence_en: "If you keep going, you will succeed.", known_words: ["下去", "就", "能"] },

  // 实现 (achieve / realize)
  { word_simplified: "实现", sentence_zh: "我想实现我的目标。", sentence_en: "I want to achieve my goal.", known_words: ["我", "想"] },
  { word_simplified: "实现", sentence_zh: "努力工作可以实现梦想。", sentence_en: "Working hard can help you realize your dreams.", known_words: ["工作", "可以", "梦想"] },
  { word_simplified: "实现", sentence_zh: "她实现了自己的愿望。", sentence_en: "She achieved her own wish.", known_words: ["她", "了", "自己"] },

  // 认为 (think / believe)
  { word_simplified: "认为", sentence_zh: "我认为这样做是对的。", sentence_en: "I think doing it this way is correct.", known_words: ["我", "这样", "做", "是", "对"] },
  { word_simplified: "认为", sentence_zh: "他认为学中文很有用。", sentence_en: "He thinks learning Chinese is very useful.", known_words: ["他", "学", "中文", "很", "有用"] },
  { word_simplified: "认为", sentence_zh: "你认为怎么样？", sentence_en: "What do you think?", known_words: ["你", "怎么样"] },

  // 表现 (performance / behave)
  { word_simplified: "表现", sentence_zh: "他今天的表现很好。", sentence_en: "His performance today is very good.", known_words: ["他", "今天", "很", "好"] },
  { word_simplified: "表现", sentence_zh: "学生的表现让老师高兴。", sentence_en: "The students' behavior made the teacher happy.", known_words: ["学生", "让", "老师", "高兴"] },
  { word_simplified: "表现", sentence_zh: "你要好好表现。", sentence_en: "You need to perform well.", known_words: ["你", "要", "好好"] },

  // 发展 (develop)
  { word_simplified: "发展", sentence_zh: "中国发展得很快。", sentence_en: "China has developed very quickly.", known_words: ["中国", "得", "很", "快"] },
  { word_simplified: "发展", sentence_zh: "学习有助于发展能力。", sentence_en: "Study helps develop one's abilities.", known_words: ["学习", "有助于", "能力"] },
  { word_simplified: "发展", sentence_zh: "这个城市发展很好。", sentence_en: "This city is developing very well.", known_words: ["这个", "城市", "很", "好"] },

  // 机会 (opportunity)
  { word_simplified: "机会", sentence_zh: "这是一个好机会。", sentence_en: "This is a good opportunity.", known_words: ["这", "是", "一个", "好"] },
  { word_simplified: "机会", sentence_zh: "我没有机会去中国。", sentence_en: "I don't have a chance to go to China.", known_words: ["我", "没有", "去", "中国"] },
  { word_simplified: "机会", sentence_zh: "他想要一个学习的机会。", sentence_en: "He wants an opportunity to study.", known_words: ["他", "想", "要", "一个", "学习"] },

  // 效果 (effect / result)
  { word_simplified: "效果", sentence_zh: "这个方法效果很好。", sentence_en: "This method has a very good effect.", known_words: ["这个", "很", "好"] },
  { word_simplified: "效果", sentence_zh: "学习的效果让老师满意。", sentence_en: "The learning results satisfied the teacher.", known_words: ["学习", "让", "老师"] },
  { word_simplified: "效果", sentence_zh: "你觉得效果怎么样？", sentence_en: "What do you think of the effect?", known_words: ["你", "觉得", "怎么样"] },

  // 严格 (strict)
  { word_simplified: "严格", sentence_zh: "老师对我们很严格。", sentence_en: "The teacher is very strict with us.", known_words: ["老师", "对", "我们", "很"] },
  { word_simplified: "严格", sentence_zh: "他严格要求自己学习。", sentence_en: "He strictly demands that he study hard.", known_words: ["他", "要求", "自己", "学习"] },
  { word_simplified: "严格", sentence_zh: "这里有很严格的规定。", sentence_en: "There are very strict rules here.", known_words: ["这里", "有", "很"] },

  // 目标 (goal / target)
  { word_simplified: "目标", sentence_zh: "我的目标是学好中文。", sentence_en: "My goal is to learn Chinese well.", known_words: ["我", "是", "学好", "中文"] },
  { word_simplified: "目标", sentence_zh: "你的学习目标是什么？", sentence_en: "What is your study goal?", known_words: ["你", "学习", "是", "什么"] },
  { word_simplified: "目标", sentence_zh: "他每天努力达到目标。", sentence_en: "He works hard every day to reach his goal.", known_words: ["他", "每天", "达到"] },

  // 努力 (work hard)
  { word_simplified: "努力", sentence_zh: "你要努力学习。", sentence_en: "You must study hard.", known_words: ["你", "要", "学习"] },
  { word_simplified: "努力", sentence_zh: "她努力工作，生活变好了。", sentence_en: "She worked hard and her life got better.", known_words: ["她", "工作", "生活", "好", "了"] },
  { word_simplified: "努力", sentence_zh: "我们需要努力才能成功。", sentence_en: "We need to work hard to succeed.", known_words: ["我们", "需要", "才能"] },

  // ─── HSK 6 ───────────────────────────────────────────────────────────────

  // 贡献 (contribute)
  { word_simplified: "贡献", sentence_zh: "他对学校做出了很大贡献。", sentence_en: "He made a great contribution to the school.", known_words: ["他", "对", "学校", "做出", "很大"] },
  { word_simplified: "贡献", sentence_zh: "我想为社会做贡献。", sentence_en: "I want to contribute to society.", known_words: ["我", "想", "为", "社会", "做"] },
  { word_simplified: "贡献", sentence_zh: "老师的贡献让学生受益。", sentence_en: "The teacher's contributions benefit the students.", known_words: ["老师", "让", "学生"] },

  // 逐渐 (gradually)
  { word_simplified: "逐渐", sentence_zh: "他逐渐学会了说中文。", sentence_en: "He gradually learned to speak Chinese.", known_words: ["他", "学会", "了", "说", "中文"] },
  { word_simplified: "逐渐", sentence_zh: "天气逐渐变冷了。", sentence_en: "The weather is gradually getting colder.", known_words: ["天气", "变", "冷", "了"] },
  { word_simplified: "逐渐", sentence_zh: "我的中文水平逐渐提高。", sentence_en: "My Chinese level is gradually improving.", known_words: ["我", "中文", "水平"] },

  // 具体 (specific / concrete)
  { word_simplified: "具体", sentence_zh: "你能说得更具体吗？", sentence_en: "Can you be more specific?", known_words: ["你", "能", "说", "得", "更", "吗"] },
  { word_simplified: "具体", sentence_zh: "老师给了我们具体的建议。", sentence_en: "The teacher gave us specific advice.", known_words: ["老师", "给", "了", "我们"] },
  { word_simplified: "具体", sentence_zh: "我需要一个具体的计划。", sentence_en: "I need a specific plan.", known_words: ["我", "需要", "一个"] },

  // 强调 (emphasize)
  { word_simplified: "强调", sentence_zh: "老师强调要认真学习。", sentence_en: "The teacher emphasized the need to study carefully.", known_words: ["老师", "要", "认真", "学习"] },
  { word_simplified: "强调", sentence_zh: "他一直强调健康很重要。", sentence_en: "He always emphasizes that health is very important.", known_words: ["他", "一直", "健康", "很"] },
  { word_simplified: "强调", sentence_zh: "我们强调做好工作。", sentence_en: "We emphasize doing our work well.", known_words: ["我们", "做好", "工作"] },

  // 联系 (contact / connect)
  { word_simplified: "联系", sentence_zh: "你能和他联系吗？", sentence_en: "Can you get in touch with him?", known_words: ["你", "能", "和", "他", "吗"] },
  { word_simplified: "联系", sentence_zh: "我们要保持联系。", sentence_en: "We should keep in touch.", known_words: ["我们", "要", "保持"] },
  { word_simplified: "联系", sentence_zh: "朋友之间要多联系。", sentence_en: "Friends should keep in contact more often.", known_words: ["朋友", "之间", "要", "多"] },
];
