interface RegisterSeedItem {
  simplified: string; // Chinese characters (must match hsk_words.simplified exactly)
  register?: "formal" | "colloquial" | "written" | "chengyu" | "slang"; // only non-neutral words
  cultural_note?: string; // optional, English, 1-2 sentences max
}

export const REGISTER_SEED: RegisterSeedItem[] = [
  // ─── Chengyu (成语) ──────────────────────────────────────────────────────────
  {
    simplified: "一石二鸟",
    register: "chengyu",
    cultural_note:
      "Literally 'one stone, two birds' — equivalent to the English idiom 'kill two birds with one stone.' Chengyu like this are a hallmark of educated, literary Chinese and their use signals cultural sophistication.",
  },
  {
    simplified: "马到成功",
    register: "chengyu",
    cultural_note:
      "Literally 'the horse arrives, success follows.' Originally from military campaigns where cavalry arrival signaled victory; today it is a common blessing shouted before someone starts a new venture.",
  },
  {
    simplified: "半途而废",
    register: "chengyu",
  },
  {
    simplified: "一帆风顺",
    register: "chengyu",
    cultural_note:
      "Literally 'one sail, smooth winds.' A popular blessing for travel, new projects, or life milestones — the sailing imagery comes from China's long seafaring and merchant tradition.",
  },
  {
    simplified: "走马观花",
    register: "chengyu",
  },
  {
    simplified: "异口同声",
    register: "chengyu",
  },
  {
    simplified: "实事求是",
    register: "chengyu",
    cultural_note:
      "Literally 'seek truth from facts.' Adopted as an official Communist Party slogan under Deng Xiaoping to justify pragmatic economic reforms, making it politically significant beyond its general meaning.",
  },
  {
    simplified: "自相矛盾",
    register: "chengyu",
    cultural_note:
      "Literally 'spear and shield contradict each other.' The story comes from the pre-Qin philosopher Han Fei Zi: a merchant claimed his spear could pierce anything and his shield could block everything — the logical paradox became a timeless phrase.",
  },
  {
    simplified: "一举两得",
    register: "chengyu",
  },
  {
    simplified: "南辕北辙",
    register: "chengyu",
  },
  {
    simplified: "亡羊补牢",
    register: "chengyu",
    cultural_note:
      "Literally 'mend the pen after the sheep is lost.' The phrase acknowledges a mistake while emphasizing that correcting it is still worthwhile — a pragmatic, face-saving way to discuss errors.",
  },
  {
    simplified: "四面八方",
    register: "chengyu",
  },
  {
    simplified: "大惊小怪",
    register: "chengyu",
  },
  {
    simplified: "大吃一惊",
    register: "chengyu",
  },
  {
    simplified: "半斤八两",
    register: "chengyu",
    cultural_note:
      "Literally 'half a jin and eight liang' — in the old system these were equal weights (one jin = 16 liang), so the phrase means 'six of one, half a dozen of the other.' The old imperial measurement system underpins this idiom.",
  },
  {
    simplified: "无所不知",
    register: "chengyu",
  },
  {
    simplified: "知己知彼",
    register: "chengyu",
    cultural_note:
      "Literally 'know yourself, know your enemy.' From Sun Tzu's The Art of War (孙子兵法); this chengyu is one of the most widely quoted phrases from that classic and appears in business, sports, and everyday strategy talk.",
  },
  {
    simplified: "守株待兔",
    register: "chengyu",
    cultural_note:
      "Literally 'guard a tree stump waiting for a rabbit.' Based on a fable about a farmer who saw a rabbit die by running into a stump, then stopped farming to wait for more rabbits — used to criticize passivity and wishful thinking.",
  },
  {
    simplified: "画蛇添足",
    register: "chengyu",
    cultural_note:
      "Literally 'draw a snake and add feet.' From a story about a competition where the winner, having extra time, ruined his winning snake drawing by adding unnecessary feet — a vivid warning against overdoing things.",
  },
  {
    simplified: "掩耳盗铃",
    register: "chengyu",
    cultural_note:
      "Literally 'cover your ears while stealing a bell.' From the Lüshi Chunqiu: a thief covered his own ears thinking others couldn't hear — used to describe self-deception or foolish attempts to hide obvious wrongdoing.",
  },
  {
    simplified: "杯水车薪",
    register: "chengyu",
  },
  {
    simplified: "欲速则不达",
    register: "chengyu",
    cultural_note:
      "Literally 'wanting speed leads to not arriving.' From the Analects of Confucius, spoken to a student governing a district — one of many chengyu rooted directly in Confucian texts, giving it high literary prestige.",
  },
  {
    simplified: "不可思议",
    register: "chengyu",
    cultural_note:
      "Originally a Buddhist term meaning something beyond human thought or imagination; imported from Sanskrit Buddhist texts. It has since secularized to mean simply 'incredible' or 'unbelievable' in modern usage.",
  },
  {
    simplified: "一如既往",
    register: "chengyu",
  },
  {
    simplified: "将计就计",
    register: "chengyu",
  },
  {
    simplified: "置之不理",
    register: "chengyu",
  },
  {
    simplified: "见多识广",
    register: "chengyu",
  },
  {
    simplified: "一鸣惊人",
    register: "chengyu",
    cultural_note:
      "Literally 'one cry astonishes everyone.' From a historical story about King Wei of Qi, who appeared idle for years then suddenly proved his brilliance — used to describe someone who makes a stunning debut after a long quiet period.",
  },
  {
    simplified: "精益求精",
    register: "chengyu",
    cultural_note:
      "Literally 'already excellent, seek further excellence.' From the Book of Songs (诗经); it reflects the Confucian ideal of ceaseless self-improvement and is frequently used in educational and professional contexts.",
  },
  {
    simplified: "得意忘形",
    register: "chengyu",
  },
  {
    simplified: "半信半疑",
    register: "chengyu",
  },
  {
    simplified: "千方百计",
    register: "chengyu",
  },
  {
    simplified: "三心二意",
    register: "chengyu",
  },
  {
    simplified: "五花八门",
    register: "chengyu",
  },
  {
    simplified: "不知不觉",
    register: "chengyu",
  },
  {
    simplified: "津津有味",
    register: "chengyu",
  },
  {
    simplified: "一目了然",
    register: "chengyu",
  },
  {
    simplified: "手忙脚乱",
    register: "chengyu",
  },

  // ─── Colloquial ──────────────────────────────────────────────────────────────
  {
    simplified: "行",
    register: "colloquial",
    cultural_note:
      "In informal speech 行 (xíng) replaces 好 or 可以 as an all-purpose 'OK / sure / fine.' It is extremely common in spoken Mandarin but rarely appears in formal writing.",
  },
  {
    simplified: "棒",
    register: "colloquial",
  },
  {
    simplified: "帅",
    register: "colloquial",
    cultural_note:
      "Primarily means 'handsome' for men, but colloquially extends to 'cool' or 'awesome' for things and actions. Younger speakers in particular use it as a general compliment.",
  },
  {
    simplified: "厉害",
    register: "colloquial",
    cultural_note:
      "Literally 'fierce/sharp,' but in everyday speech it is the go-to word for praising someone's skill or ability — roughly 'amazing' or 'impressive.' Overusing it in a formal essay would sound out of place.",
  },
  {
    simplified: "没事",
    register: "colloquial",
    cultural_note:
      "Serves as 'no problem,' 'it's fine,' or 'never mind' in spoken Chinese. Responding with 没事 after someone apologizes is the culturally expected way to restore harmony and signal no hard feelings.",
  },
  {
    simplified: "算了",
    register: "colloquial",
    cultural_note:
      "Means 'forget it' or 'let it go.' Saying 算了 is a common face-saving move — it lets both parties move past a disagreement without requiring a formal apology or explicit resolution.",
  },
  {
    simplified: "随便",
    register: "colloquial",
    cultural_note:
      "Literally 'as you like / whatever.' While convenient for indicating indifference, overusing 随便 in response to questions can come across as dismissive or lacking consideration for others.",
  },
  {
    simplified: "还好",
    register: "colloquial",
  },
  {
    simplified: "挺",
    register: "colloquial",
  },
  {
    simplified: "蛮",
    register: "colloquial",
    cultural_note:
      "A Southern Chinese (especially Shanghai and Jiangnan) intensifier meaning 'quite' or 'rather.' Its use can signal regional origin; Northerners more commonly use 挺 or 很.",
  },
  {
    simplified: "超",
    register: "colloquial",
  },
  {
    simplified: "破",
    register: "colloquial",
  },
  {
    simplified: "烦",
    register: "colloquial",
  },
  {
    simplified: "废话",
    register: "colloquial",
  },
  {
    simplified: "搞",
    register: "colloquial",
    cultural_note:
      "An extremely versatile colloquial verb meaning 'to do, make, handle, get' — comparable to English 'do' or 'sort out.' It rarely appears in formal writing but is indispensable in everyday spoken Mandarin.",
  },
  {
    simplified: "瞧",
    register: "colloquial",
  },
  {
    simplified: "吓",
    register: "colloquial",
  },
  {
    simplified: "逗",
    register: "colloquial",
  },
  {
    simplified: "馋",
    register: "colloquial",
  },
  {
    simplified: "傻",
    register: "colloquial",
  },
  {
    simplified: "闹",
    register: "colloquial",
  },
  {
    simplified: "牛",
    register: "colloquial",
    cultural_note:
      "Literally 'cow/bull,' but in slang it means 'awesome' or 'badass.' Especially popular among younger generations; the origin lies in admiring the ox's strength, though it is now fully detached from that meaning.",
  },
  {
    simplified: "凑合",
    register: "colloquial",
    cultural_note:
      "Means 'to make do' or 'passable.' Telling a guest 凑合吃吧 ('just make do with this meal') is a form of humble hospitality that invites them to relax — the host is underplaying their effort as a courtesy.",
  },
  {
    simplified: "靠",
    register: "colloquial",
  },
  {
    simplified: "瞎",
    register: "colloquial",
  },
  {
    simplified: "磨蹭",
    register: "colloquial",
  },
  {
    simplified: "捣乱",
    register: "colloquial",
  },
  {
    simplified: "没劲",
    register: "colloquial",
  },

  // ─── Written (classical particles / literary words) ──────────────────────────
  {
    simplified: "于",
    register: "written",
    cultural_note:
      "A classical Chinese preposition meaning 'at, in, on, from, than.' In modern written Chinese it replaces 在/从/比 in formal and literary contexts; it is a marker of elevated register.",
  },
  {
    simplified: "以",
    register: "written",
    cultural_note:
      "Classical preposition meaning 'by means of, with, because of.' Ubiquitous in classical texts and modern formal writing; in speech it is largely replaced by 用 or 因为.",
  },
  {
    simplified: "其",
    register: "written",
    cultural_note:
      "Classical third-person pronoun/possessive meaning 'his, her, its, their.' Appearing frequently in official documents, legal texts, and academic writing, it adds a formal, impersonal tone absent from spoken 他的/她的.",
  },
  {
    simplified: "之",
    register: "written",
    cultural_note:
      "The classical possessive and nominalizing particle, equivalent to modern 的 in many contexts. Its presence in a text is often the clearest single marker of literary or classical Chinese register.",
  },
  {
    simplified: "乃",
    register: "written",
  },
  {
    simplified: "则",
    register: "written",
  },
  {
    simplified: "乎",
    register: "written",
    cultural_note:
      "A classical sentence-final particle indicating a question or exclamation. It appears throughout the Analects and classical literature; using it today is deliberately archaic and literary.",
  },
  {
    simplified: "焉",
    register: "written",
  },
  {
    simplified: "矣",
    register: "written",
    cultural_note:
      "A classical sentence-final particle indicating completion or assertion. Reading classical texts aloud with 矣 gives them their characteristic rhythmic, authoritative tone.",
  },
  {
    simplified: "曰",
    register: "written",
    cultural_note:
      "Classical verb meaning 'said/says,' used exclusively in quoted speech within classical texts. The Analects (论语) opens with 子曰 ('The Master said') — making this character inseparable from Confucian literary tradition.",
  },
  {
    simplified: "若",
    register: "written",
    cultural_note:
      "Classical conditional conjunction meaning 'if' or 'like.' In modern written Chinese it still appears in formal conditionals (若…则…) as a more elevated alternative to 如果.",
  },

  // ─── Formal (polite / official / business register) ──────────────────────────
  {
    simplified: "贵",
    register: "formal",
    cultural_note:
      "Used as an honorific prefix for institutions or things belonging to the other party (e.g., 贵公司 'your esteemed company'). It is a crucial feature of formal Chinese correspondence and business etiquette.",
  },
  {
    simplified: "敬",
    register: "formal",
    cultural_note:
      "Prefix meaning 'respectfully,' used in formal closing phrases such as 敬请回复 or 敬祝健康. It signals deep respect and is common in business letters and official communications.",
  },
  {
    simplified: "谨",
    register: "formal",
  },
  {
    simplified: "悉",
    register: "formal",
  },
  {
    simplified: "欣",
    register: "formal",
  },
  {
    simplified: "阁下",
    register: "formal",
    cultural_note:
      "An honorific form of address meaning 'Your Excellency' or simply 'you' in very formal contexts. Primarily used in diplomatic correspondence and formal letters; using it in casual conversation would sound stiff or ironic.",
  },
  {
    simplified: "函",
    register: "formal",
    cultural_note:
      "Means 'official letter' or 'correspondence.' Used in bureaucratic and diplomatic contexts (e.g., 来函 'your letter received'); it distinguishes a formal written communication from a casual 信.",
  },
  {
    simplified: "谨此",
    register: "formal",
  },
  {
    simplified: "拜托",
    register: "formal",
    cultural_note:
      "Literally 'I respectfully entrust you' — used when asking a favor in a polished, deferential way. Though common in everyday Taiwanese and mainland usage, its origins are in formal letter-writing.",
  },
  {
    simplified: "荣幸",
    register: "formal",
    cultural_note:
      "Meaning 'honored / it is my honor.' Essential in formal speeches and introductions; saying 很荣幸认识您 signals that you are elevating the other person's status — a key move in Chinese social protocol.",
  },
  {
    simplified: "惠顾",
    register: "formal",
    cultural_note:
      "A commercial honorific meaning 'your patronage / your valued custom.' Seen in storefronts and business communications; using 惠 (grace/favor) shows that the customer's choice is treated as a gift.",
  },
  {
    simplified: "莅临",
    register: "formal",
    cultural_note:
      "Means 'your gracious presence / to honor with a visit.' Used in formal invitations and announcements (e.g., 欢迎莅临指导 'welcome to grace us with your guidance'), it elevates the visitor's status.",
  },
  {
    simplified: "恭喜",
    register: "formal",
    cultural_note:
      "Literally 'respectfully congratulate.' While 恭喜 is widely used in everyday life (especially 恭喜发财 at New Year), the 恭 prefix gives it a ceremonial weight appropriate for speeches and formal cards.",
  },
  {
    simplified: "致函",
    register: "formal",
  },
  {
    simplified: "兹",
    register: "formal",
    cultural_note:
      "A classical adverb meaning 'hereby' used in official notices and legal documents (e.g., 兹证明 'this hereby certifies'). Its presence immediately marks a document as official or bureaucratic.",
  },
  {
    simplified: "敬请",
    register: "formal",
  },
  {
    simplified: "特此",
    register: "formal",
  },
  {
    simplified: "谨启",
    register: "formal",
  },

  // ─── Cultural notes on neutral-register words ────────────────────────────────
  {
    simplified: "红",
    cultural_note:
      "Red is the color of luck, joy, and celebration in Chinese culture — used at weddings, New Year, and auspicious occasions. Wearing red or decorating with red is believed to ward off evil and attract good fortune.",
  },
  {
    simplified: "白",
    cultural_note:
      "White symbolizes mourning and funerals in traditional Chinese culture, the opposite of its Western connotation of purity. Wearing white to a Chinese wedding or giving white flowers can be deeply inappropriate.",
  },
  {
    simplified: "龙",
    cultural_note:
      "Dragons are auspicious symbols of power, imperial authority, and good fortune in China — a stark contrast to the fearsome creatures of Western mythology. Emperors were called 'sons of the dragon,' and dragon imagery remains a national symbol of pride.",
  },
  {
    simplified: "面子",
    cultural_note:
      "\"Face\" (社会 reputation and dignity) is a crucial concept in Chinese social life. Causing someone to lose face publicly — even unintentionally — can seriously damage relationships, so interactions are often carefully managed to protect everyone's 面子.",
  },
  {
    simplified: "关系",
    cultural_note:
      "Personal connections and networks are fundamental to navigating Chinese society — in business, bureaucracy, and daily life. Building and maintaining good 关系 through mutual favors and social investment often matters more than formal qualifications.",
  },
  {
    simplified: "茶",
    cultural_note:
      "Tea is central to Chinese daily life, hospitality, and ceremony. Offering tea to a guest is one of the most basic acts of respect; in traditional wedding ceremonies, the couple serves tea to elders as a formal gesture of respect and acceptance into the family.",
  },
  {
    simplified: "功夫",
    cultural_note:
      "While known globally for martial arts, 功夫 literally means 'skill acquired through sustained hard work and time' and can refer to any mastery — cooking, calligraphy, or music. The martial arts meaning is just one application of this broader concept.",
  },
  {
    simplified: "饺子",
    cultural_note:
      "Dumplings are eaten at Chinese New Year, especially in Northern China; their crescent shape resembles ancient gold ingots (元宝), symbolizing wealth. Some families hide a coin inside one dumpling — whoever gets it will have good luck in the coming year.",
  },
  {
    simplified: "八",
    cultural_note:
      "Eight is the luckiest number in Chinese culture because its pronunciation (bā) sounds similar to 发 (fā), meaning prosperity or getting rich. Phone numbers, license plates, and wedding dates with multiple 8s command a premium price.",
  },
  {
    simplified: "四",
    cultural_note:
      "Four is considered unlucky because its pronunciation (sì) sounds nearly identical to 死 (sǐ), meaning death. Many Chinese buildings skip floor 4 (and sometimes 14, 24, etc.), much as Western buildings sometimes omit floor 13.",
  },
  {
    simplified: "孝",
    cultural_note:
      "Filial piety — deep respect for parents, elders, and ancestors — is a cornerstone of Confucian ethics and remains deeply embedded in Chinese society. It influences everything from family living arrangements to national policies on elder care.",
  },
  {
    simplified: "缘分",
    cultural_note:
      "A fated connection or destined bond, used for relationships that feel meant to be — friendships, romantic partners, even chance encounters. Rooted in Buddhist notions of karma, 缘分 is invoked to explain inexplicable closeness or serendipitous meetings.",
  },
  {
    simplified: "春节",
    cultural_note:
      "Chinese New Year (Spring Festival) is the most important holiday in Chinese culture, centered on family reunion. The annual 春运 (Chunyun) migration — the world's largest human movement — sees hundreds of millions travel home for the celebration.",
  },
  {
    simplified: "礼",
    cultural_note:
      "Courtesy and ritual propriety are core Confucian concepts governing all social behavior. 礼 encompasses not just politeness but the entire system of rites, social roles, and obligations that Confucius believed held society together.",
  },
  {
    simplified: "和",
    cultural_note:
      "Harmony is a central value in Chinese culture, politics, and philosophy. The ideal of 和谐 (harmony) shapes interpersonal communication — direct conflict is often avoided in favor of face-saving compromise — and is enshrined in official political rhetoric.",
  },
  {
    simplified: "福",
    cultural_note:
      "福 means luck and blessings, and is one of the most displayed characters during Chinese New Year. It is famously hung upside-down (倒贴福) because 倒 (dào, upside-down) is a homophone of 到 (dào, arrived) — meaning 'luck has arrived.'",
  },
  {
    simplified: "阴阳",
    cultural_note:
      "The complementary opposites — dark/light, feminine/masculine, earth/heaven, rest/activity — that underlie Chinese cosmology, traditional medicine, and philosophy. Maintaining 阴阳 balance is the goal in everything from diet to geomancy (风水).",
  },
  {
    simplified: "红包",
    cultural_note:
      "Red envelopes containing money are given as gifts at New Year, weddings, and birthdays to convey good wishes. WeChat's digital 红包 feature, launched in 2014, modernized the tradition and now sees billions of transfers during every Spring Festival.",
  },
  {
    simplified: "差不多",
    cultural_note:
      "Literally 'about the same / close enough,' this phrase reflects a cultural pragmatism and tolerance for approximation over rigid exactness. Some observers see it as a cultural mindset; its overuse can frustrate those expecting precise answers.",
  },
  {
    simplified: "马上",
    cultural_note:
      "Literally 'on horseback' (i.e., immediately), from cavalry commands where speed was critical. In modern usage it often means 'soon' rather than 'right this instant,' so the urgency can be softer than its literal meaning suggests.",
  },
  {
    simplified: "没关系",
    cultural_note:
      "Literally 'there is no relationship [between us and a problem]' — meaning 'it doesn't matter / no worries.' Responding with 没关系 after an apology is the culturally expected way to restore harmony and signal goodwill.",
  },
  {
    simplified: "保重",
    cultural_note:
      "A warm farewell expression meaning 'take care of yourself' — literally 'preserve your weight/health.' Using 保重 shows genuine concern for the other person's wellbeing and is considered more heartfelt than a casual goodbye.",
  },
  {
    simplified: "辛苦了",
    cultural_note:
      "Literally 'you have suffered bitterness/hardship' — used to acknowledge and validate someone's effort or hard work. Saying 辛苦了 to a colleague, service worker, or family member is an important social gesture of respect and recognition in Chinese culture.",
  },
  {
    simplified: "喝茶",
    cultural_note:
      "Literally 'drink tea,' but colloquially it is a well-known euphemism for being summoned by police or government authorities for an informal interrogation. The phrase allows both parties to maintain a veneer of civility around a coercive encounter.",
  },
  {
    simplified: "笑",
    cultural_note:
      "Smiling or laughing in Chinese culture can communicate embarrassment, nervousness, or the desire to defuse tension — not just happiness. This means a smile in response to bad news or criticism should not automatically be read as indifference or disrespect.",
  },
  {
    simplified: "筷子",
    cultural_note:
      "Chopsticks carry strong taboos: never stick them upright in a bowl of rice (resembles incense at a funeral), and never pass food chopstick-to-chopstick (recalls the passing of cremated bones). These rules are taken seriously across generations.",
  },
  {
    simplified: "年",
    cultural_note:
      "In Chinese legend, 年 (Nián) is a fearsome beast that emerges each New Year's Eve — loud noises (firecrackers), red decorations, and bright lights were used to scare it away. This mythology underpins most major Spring Festival traditions.",
  },
  {
    simplified: "酒",
    cultural_note:
      "Alcohol plays an important social role in Chinese business and banquet culture. Toasting (干杯, 'dry the cup') is a key ritual for building trust and 关系; refusing a toast from a senior figure can be seen as disrespectful.",
  },
  {
    simplified: "中",
    cultural_note:
      "The character 中 (center/middle) is embedded in China's self-conception: 中国 (Middle Kingdom) reflects the ancient belief that China was the cultural and geographic center of the world. This idea has shaped Chinese foreign policy attitudes for centuries.",
  },
  {
    simplified: "祖先",
    cultural_note:
      "Ancestor veneration is a deeply rooted practice in Chinese culture, blending Confucian filial piety with folk religion. Offerings of food, incense, and paper goods at ancestral shrines during festivals maintain the bond between the living and the dead.",
  },
];
