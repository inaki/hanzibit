interface GrammarSeedItem {
  hsk_level: number;
  display_order: number;
  title: string;
  pattern: string;
  explanation: string;
  examples: string;
  reading_passage: string;
  comprehension_question: string;
  journal_prompt: string;
}

export const CURATED_GRAMMAR_POINTS: GrammarSeedItem[] = [
  // ─── HSK 1 ───────────────────────────────────────────────────────────────────
  {
    hsk_level: 1,
    display_order: 1,
    title: "是 (shì) — Equational Sentences",
    pattern: "A + 是 + B",
    explanation:
      "是 links two nouns or noun phrases, stating that A equals or is identified as B. Unlike English 'to be', 是 is not used with adjectives — those use 很 instead.",
    examples: JSON.stringify([
      { zh: "我是学生。", pinyin: "Wǒ shì xuésheng.", en: "I am a student." },
      { zh: "她是我的老师。", pinyin: "Tā shì wǒ de lǎoshī.", en: "She is my teacher." },
      { zh: "这是我的书。", pinyin: "Zhè shì wǒ de shū.", en: "This is my book." },
    ]),
    reading_passage:
      "我叫李明，我是北京人。我的爸爸是医生，我的妈妈是老师。我有一个哥哥，他是大学生。我们是一家人，我很爱我的家。",
    comprehension_question: "What does Li Ming's father do for work?",
    journal_prompt:
      "Write 3–4 sentences introducing yourself and your family members. Use 是 to describe who each person is (their name, job, or relationship).",
  },
  {
    hsk_level: 1,
    display_order: 2,
    title: "有 (yǒu) — Possession and Existence",
    pattern: "A + 有 + B",
    explanation:
      "有 expresses possession ('A has B') or existence ('there is/are B at A'). Its negation is 没有, never 不有.",
    examples: JSON.stringify([
      { zh: "我有一个妹妹。", pinyin: "Wǒ yǒu yī gè mèimei.", en: "I have a younger sister." },
      { zh: "桌子上有一本书。", pinyin: "Zhuōzi shàng yǒu yī běn shū.", en: "There is a book on the table." },
      { zh: "你有没有时间？", pinyin: "Nǐ yǒu méiyǒu shíjiān?", en: "Do you have time?" },
    ]),
    reading_passage:
      "我家有三口人。我有一个爸爸和一个妈妈。我没有兄弟，但是我有一个姐姐。我们家里有一只猫，它叫小白。桌子上有很多书，都是我姐姐的。",
    comprehension_question: "How many people are in the narrator's family, and do they have any siblings?",
    journal_prompt:
      "Write 3–4 sentences about what you have at home — pets, siblings, or objects in a room. Use 有 and 没有 at least once each.",
  },
  {
    hsk_level: 1,
    display_order: 3,
    title: "不 (bù) — Negation",
    pattern: "不 + verb / adjective",
    explanation:
      "不 is the standard negation word, placed directly before a verb or adjective. Note that 有 is negated with 没, and completed actions use 没 instead of 不.",
    examples: JSON.stringify([
      { zh: "我不喜欢喝咖啡。", pinyin: "Wǒ bù xǐhuān hē kāfēi.", en: "I don't like drinking coffee." },
      { zh: "他今天不来。", pinyin: "Tā jīntiān bù lái.", en: "He is not coming today." },
      { zh: "这个不贵。", pinyin: "Zhège bú guì.", en: "This is not expensive." },
    ]),
    reading_passage:
      "今天我不舒服，不想去学校。我不喜欢吃药，但是妈妈说要吃。今天天气不好，外面很冷。我不出去，在家休息。明天我会好的。",
    comprehension_question: "Why does the narrator stay home today, and what does the mother say?",
    journal_prompt:
      "Write 3–4 sentences about things you do not like or do not want to do today. Use 不 with at least three different verbs or adjectives.",
  },
  {
    hsk_level: 1,
    display_order: 4,
    title: "吗 (ma) — Yes/No Questions",
    pattern: "Statement + 吗？",
    explanation:
      "Adding 吗 to the end of a statement turns it into a yes/no question. No word order changes are needed — just append 吗 and raise your intonation.",
    examples: JSON.stringify([
      { zh: "你是中国人吗？", pinyin: "Nǐ shì Zhōngguórén ma?", en: "Are you Chinese?" },
      { zh: "她喜欢猫吗？", pinyin: "Tā xǐhuān māo ma?", en: "Does she like cats?" },
      { zh: "你有哥哥吗？", pinyin: "Nǐ yǒu gēgē ma?", en: "Do you have an older brother?" },
    ]),
    reading_passage:
      "小红问她的朋友：「你喜欢看电影吗？」朋友说：「喜欢！你呢？」小红说：「我也喜欢。你今天有时间吗？我们一起去看吗？」朋友很高兴，说：「好啊！」",
    comprehension_question: "What does Xiao Hong invite her friend to do, and how does the friend respond?",
    journal_prompt:
      "Write a short 3–4 sentence dialogue between two people. Have one person ask at least two yes/no questions using 吗, and have the other person answer.",
  },
  {
    hsk_level: 1,
    display_order: 5,
    title: "也 (yě) — Also / Too",
    pattern: "Subject + 也 + predicate",
    explanation:
      "也 means 'also' or 'too' and always comes before the verb or adjective, never at the end of the sentence as in English. It signals that the same statement applies to an additional subject.",
    examples: JSON.stringify([
      { zh: "我也是学生。", pinyin: "Wǒ yě shì xuésheng.", en: "I am also a student." },
      { zh: "他也喜欢吃火锅。", pinyin: "Tā yě xǐhuān chī huǒguō.", en: "He also likes eating hot pot." },
      { zh: "我也不知道。", pinyin: "Wǒ yě bù zhīdào.", en: "I don't know either." },
    ]),
    reading_passage:
      "我喜欢学中文，我的朋友玛丽也喜欢学中文。我们一起去上课。老师很好，我们也很努力。玛丽会说法语，我也会说一点法语。我们是好朋友。",
    comprehension_question: "What language does Mary know besides Chinese, and does the narrator know it too?",
    journal_prompt:
      "Write 3–4 sentences about things you and a friend or family member both like or both do. Use 也 in each sentence.",
  },
  {
    hsk_level: 1,
    display_order: 6,
    title: "都 (dōu) — All / Both",
    pattern: "Subject + 都 + predicate",
    explanation:
      "都 means 'all' or 'both' and always appears before the verb, referring back to a plural subject or a list of items already mentioned. It can combine with 也 as 也都.",
    examples: JSON.stringify([
      { zh: "我们都是学生。", pinyin: "Wǒmen dōu shì xuésheng.", en: "We are all students." },
      { zh: "他们都喜欢踢足球。", pinyin: "Tāmen dōu xǐhuān tī zúqiú.", en: "They all like playing soccer." },
      { zh: "这些菜都很好吃。", pinyin: "Zhèxiē cài dōu hěn hǎochī.", en: "All of these dishes are delicious." },
    ]),
    reading_passage:
      "我们班有二十个学生，我们都喜欢我们的汉语老师。今天老师带来了很多中国食物，大家都很高兴。同学们都尝了一点，都说好吃。我们都想学更多中国文化。",
    comprehension_question: "What did the teacher bring to class today, and how did the students react?",
    journal_prompt:
      "Write 3–4 sentences describing what everyone in your family or class has in common. Use 都 at least twice.",
  },
  {
    hsk_level: 1,
    display_order: 7,
    title: "很 (hěn) + Adjective Predicates",
    pattern: "Subject + 很 + adjective",
    explanation:
      "In Chinese, adjectives directly serve as predicates without a linking verb. 很 is placed before the adjective not only to mean 'very' but also as a required filler when no contrast or emphasis is intended — a 'bare' adjective implies comparison.",
    examples: JSON.stringify([
      { zh: "今天很热。", pinyin: "Jīntiān hěn rè.", en: "Today is (very) hot." },
      { zh: "她的汉语很好。", pinyin: "Tā de Hànyǔ hěn hǎo.", en: "Her Chinese is very good." },
      { zh: "这本书很有意思。", pinyin: "Zhè běn shū hěn yǒuyìsi.", en: "This book is very interesting." },
    ]),
    reading_passage:
      "今天是周末，天气很好，不冷也不热。我们去了一个公园，公园里的花很漂亮。我们走了很久，有点儿累，但是很开心。下午我们吃了冰淇淋，很甜，很好吃。",
    comprehension_question: "How was the weather during the weekend outing, and how did the narrator feel afterward?",
    journal_prompt:
      "Describe your room, your neighborhood, or today's weather in 3–4 sentences. Use 很 + adjective in each sentence, choosing different adjectives each time.",
  },
  {
    hsk_level: 1,
    display_order: 8,
    title: "在 (zài) — Location: At / In",
    pattern: "Subject + 在 + place",
    explanation:
      "在 indicates that someone or something is located at a place. As a verb it means 'to be at'; as a preposition it precedes a place word and comes before the main verb.",
    examples: JSON.stringify([
      { zh: "我在图书馆。", pinyin: "Wǒ zài túshūguǎn.", en: "I am at the library." },
      { zh: "他在家里学习。", pinyin: "Tā zài jiā lǐ xuéxí.", en: "He studies at home." },
      { zh: "书在桌子上。", pinyin: "Shū zài zhuōzi shàng.", en: "The book is on the table." },
    ]),
    reading_passage:
      "我现在在学校的图书馆。图书馆在学校的右边，很安静。我的朋友小明也在这里，他在旁边看书。我们在图书馆学习，不说话。下课以后，我们在外面的咖啡厅喝咖啡。",
    comprehension_question: "Where is the narrator studying, and where is the narrator's friend?",
    journal_prompt:
      "Write 3–4 sentences describing where you are right now and where different objects or people around you are located. Use 在 with a place word in each sentence.",
  },
  {
    hsk_level: 1,
    display_order: 9,
    title: "的 (de) — Possessive Modifier",
    pattern: "Noun / Pronoun + 的 + Noun",
    explanation:
      "的 links a modifier to the noun it describes, most commonly showing possession ('my book', 'teacher's office'). When the possessor is a personal pronoun and the noun is a close relationship or group, 的 is often omitted in speech.",
    examples: JSON.stringify([
      { zh: "这是我的手机。", pinyin: "Zhè shì wǒ de shǒujī.", en: "This is my cell phone." },
      { zh: "老师的办公室在哪里？", pinyin: "Lǎoshī de bàngōngshì zài nǎlǐ?", en: "Where is the teacher's office?" },
      { zh: "他的中文名字很好听。", pinyin: "Tā de Zhōngwén míngzì hěn hǎotīng.", en: "His Chinese name sounds very nice." },
    ]),
    reading_passage:
      "这是我的房间。我的床在窗户旁边，床上有我的毯子和枕头。桌子上是我的电脑和我的书。墙上有我朋友的照片，我很喜欢。我的房间不大，但是很舒服。",
    comprehension_question: "What is on the narrator's wall, and how does the narrator feel about the room?",
    journal_prompt:
      "Write 3–4 sentences describing your bedroom or workspace. Use 的 to show that at least four different objects belong to you or someone else.",
  },
  {
    hsk_level: 1,
    display_order: 10,
    title: "Time Words Before Verbs",
    pattern: "Subject + time word + verb + object",
    explanation:
      "In Chinese, time expressions come before the verb (and usually after the subject), unlike English where they can appear at the end. This applies to clock times, days, and time adverbs like 现在, 今天, 明天.",
    examples: JSON.stringify([
      { zh: "我每天七点起床。", pinyin: "Wǒ měitiān qī diǎn qǐchuáng.", en: "I get up at seven every day." },
      { zh: "她明天去北京。", pinyin: "Tā míngtiān qù Běijīng.", en: "She is going to Beijing tomorrow." },
      { zh: "我们下午两点开会。", pinyin: "Wǒmen xiàwǔ liǎng diǎn kāihuì.", en: "We have a meeting at 2 p.m." },
    ]),
    reading_passage:
      "我每天早上六点半起床，七点吃早饭。上午我在学校上课，下午两点回家。晚上我先做作业，然后看一会儿电视。我周末不上课，可以睡懒觉。我很喜欢周末。",
    comprehension_question: "What time does the narrator wake up on weekdays, and what does the narrator do on weekends?",
    journal_prompt:
      "Write 4–5 sentences describing your daily schedule. Include at least four different time expressions (e.g., 早上, 下午, 每天, 晚上) and place each one before its verb.",
  },

  // ─── HSK 2 ───────────────────────────────────────────────────────────────────
  {
    hsk_level: 2,
    display_order: 1,
    title: "了 (le) — Verb Completion",
    pattern: "Verb + 了 + object",
    explanation:
      "Verb + 了 indicates that an action has been completed. It marks a bounded event and is often used with a specific object or quantity. Sentence-final 了 signals a change of state; both can appear together.",
    examples: JSON.stringify([
      { zh: "我吃了早饭。", pinyin: "Wǒ chī le zǎofàn.", en: "I ate breakfast (and I'm done)." },
      { zh: "她买了三本书。", pinyin: "Tā mǎi le sān běn shū.", en: "She bought three books." },
      { zh: "我们看了一个电影。", pinyin: "Wǒmen kàn le yī gè diànyǐng.", en: "We watched a movie." },
    ]),
    reading_passage:
      "昨天我去了超市，买了很多东西。我买了水果、牛奶和面包。晚上我做了一顿晚饭，朋友们来了，大家都吃了很多。饭后我们喝了茶，聊了很久。那是很快乐的一个晚上。",
    comprehension_question: "What did the narrator buy at the supermarket, and what happened in the evening?",
    journal_prompt:
      "Write 4–5 sentences describing what you did yesterday or last weekend. Use verb + 了 for each completed action, and try to include specific objects or quantities.",
  },
  {
    hsk_level: 2,
    display_order: 2,
    title: "过 (guò) — Past Experience",
    pattern: "Verb + 过",
    explanation:
      "过 after a verb indicates that the speaker has had a certain experience at some unspecified point in the past. Unlike 了, it emphasizes that the experience happened, not when or how many times.",
    examples: JSON.stringify([
      { zh: "我去过日本两次。", pinyin: "Wǒ qù guò Rìběn liǎng cì.", en: "I've been to Japan twice." },
      { zh: "你吃过北京烤鸭吗？", pinyin: "Nǐ chī guò Běijīng kǎoyā ma?", en: "Have you ever had Peking duck?" },
      { zh: "我没学过法语。", pinyin: "Wǒ méi xué guò Fǎyǔ.", en: "I have never studied French." },
    ]),
    reading_passage:
      "我去过很多地方，但是我最喜欢上海。我在那里住过一个月，认识了很多朋友。我吃过很多上海菜，味道非常好。我也爬过附近的山，风景很美。我想再去一次。",
    comprehension_question: "How long did the narrator stay in Shanghai, and what activities did they do there?",
    journal_prompt:
      "Write 4–5 sentences about places you have been to or experiences you have had. Use verb + 过 for experiences and 没 + verb + 过 for things you have not yet done.",
  },
  {
    hsk_level: 2,
    display_order: 3,
    title: "能 (néng) — Physical Capability / Permission",
    pattern: "能 + verb",
    explanation:
      "能 expresses ability based on circumstances, physical capacity, or permission. It differs from 会 (a learned skill) — you use 能 when asking if conditions allow something ('Can you come?' / 'Are you able to?').",
    examples: JSON.stringify([
      { zh: "你能帮我吗？", pinyin: "Nǐ néng bāng wǒ ma?", en: "Can you help me?" },
      { zh: "我今天不能来。", pinyin: "Wǒ jīntiān bù néng lái.", en: "I can't come today." },
      { zh: "这里能停车吗？", pinyin: "Zhèlǐ néng tíng chē ma?", en: "Can you park here?" },
    ]),
    reading_passage:
      "我的朋友王芳生病了，不能来上课。老师说，她能在家休息，但是要把作业发给我们。我能帮她带作业，不是问题。她的病不严重，明天可能就能回来了。",
    comprehension_question: "Why can Wang Fang not come to class, and what does the narrator offer to do?",
    journal_prompt:
      "Write 3–4 sentences about things you are able or unable to do this week because of circumstances (weather, time, health, etc.). Use 能 and 不能.",
  },
  {
    hsk_level: 2,
    display_order: 4,
    title: "会 (huì) — Learned Ability",
    pattern: "会 + verb",
    explanation:
      "会 describes a skill or ability that was acquired through learning or practice. It is also used to express likelihood or probability about a future event ('it will probably…').",
    examples: JSON.stringify([
      { zh: "她会说三种语言。", pinyin: "Tā huì shuō sān zhǒng yǔyán.", en: "She can speak three languages." },
      { zh: "你会开车吗？", pinyin: "Nǐ huì kāi chē ma?", en: "Can you drive?" },
      { zh: "我不会做饭。", pinyin: "Wǒ bù huì zuò fàn.", en: "I don't know how to cook." },
    ]),
    reading_passage:
      "我哥哥会很多东西。他会弹钢琴，也会画画。他还会做各种中国菜，每次做饭大家都很高兴。我不会弹钢琴，但是我会唱歌。哥哥说，只要努力练习，什么都能学会。",
    comprehension_question: "Name three skills the narrator's older brother has.",
    journal_prompt:
      "Write 4–5 sentences about skills you have learned and skills you have not yet learned. Use 会 and 不会, and mention how you learned (or plan to learn) one of them.",
  },
  {
    hsk_level: 2,
    display_order: 5,
    title: "已经…了 — Already",
    pattern: "已经 + verb/adj + 了",
    explanation:
      "已经…了 frames an action or state as already having occurred or being in effect. 已经 precedes the verb and sentence-final 了 reinforces the change of state or completed fact.",
    examples: JSON.stringify([
      { zh: "我已经吃了。", pinyin: "Wǒ yǐjīng chī le.", en: "I have already eaten." },
      { zh: "他已经回家了。", pinyin: "Tā yǐjīng huí jiā le.", en: "He has already gone home." },
      { zh: "这本书我已经看完了。", pinyin: "Zhè běn shū wǒ yǐjīng kàn wán le.", en: "I have already finished reading this book." },
    ]),
    reading_passage:
      "妈妈打电话问我到哪里了。我说我已经到学校了，不用担心。作业也已经做完了，我正在复习。她说饭已经做好了，叫我早点回家。我说好的，晚上六点我已经会在家了。",
    comprehension_question: "What two things has the narrator already done when the mother calls?",
    journal_prompt:
      "Write 3–4 sentences describing things you have already done or accomplished today or this week. Use 已经…了 for each one.",
  },
  {
    hsk_level: 2,
    display_order: 6,
    title: "先…再/然后… — Sequence of Actions",
    pattern: "先 + V1，再/然后 + V2",
    explanation:
      "先 ('first') and 再/然后 ('then'/'after that') describe a sequence of actions in order. 先…再 implies V2 only happens after V1 is done, especially in instructions. 然后 can also start a new sentence.",
    examples: JSON.stringify([
      { zh: "你先洗手，再吃饭。", pinyin: "Nǐ xiān xǐ shǒu, zài chī fàn.", en: "First wash your hands, then eat." },
      { zh: "我先复习，然后去睡觉。", pinyin: "Wǒ xiān fùxí, rán hòu qù shuìjiào.", en: "I'll review first, then go to sleep." },
      { zh: "我们先去超市，再去公园。", pinyin: "Wǒmen xiān qù chāoshì, zài qù gōngyuán.", en: "We'll go to the supermarket first, then the park." },
    ]),
    reading_passage:
      "每天早上我先刷牙洗脸，然后吃早饭。吃完早饭以后，我先收拾书包，再出门。到了学校，我先和朋友说话，然后进教室坐好。放学以后，我先做作业，然后才可以玩。这是我每天的习惯。",
    comprehension_question: "What does the narrator do before going out the door in the morning?",
    journal_prompt:
      "Write 4–5 sentences describing your morning or evening routine as a sequence of steps. Use 先…然后 or 先…再 at least twice.",
  },
  {
    hsk_level: 2,
    display_order: 7,
    title: "因为…所以… — Cause and Effect",
    pattern: "因为 + cause，所以 + result",
    explanation:
      "因为…所以… expresses a cause-and-effect relationship. Both clauses are often used together, though either one can appear alone. 所以 introduces the result and is roughly 'therefore' or 'so'.",
    examples: JSON.stringify([
      { zh: "因为下雨，所以我没出去。", pinyin: "Yīnwèi xià yǔ, suǒyǐ wǒ méi chūqù.", en: "Because it rained, I didn't go out." },
      { zh: "因为她很努力，所以成绩很好。", pinyin: "Yīnwèi tā hěn nǔlì, suǒyǐ chéngjì hěn hǎo.", en: "Because she works hard, her grades are excellent." },
      { zh: "因为我不舒服，所以今天不去上班。", pinyin: "Yīnwèi wǒ bù shūfu, suǒyǐ jīntiān bù qù shàngbān.", en: "Because I don't feel well, I'm not going to work today." },
    ]),
    reading_passage:
      "今天我迟到了，因为公交车来晚了。老师问我为什么迟到，我解释了原因。因为这是第一次，所以老师没有批评我。因为我很抱歉，所以下课以后我去道歉。老师很好，说没关系。",
    comprehension_question: "Why was the narrator late, and how did the teacher respond?",
    journal_prompt:
      "Write 3–4 sentences explaining things that happened to you recently and why. Use 因为…所以… for each explanation.",
  },
  {
    hsk_level: 2,
    display_order: 8,
    title: "虽然…但是… — Concession",
    pattern: "虽然 + A，但是 + B",
    explanation:
      "虽然…但是… acknowledges a fact (A) while introducing a contrasting or limiting point (B). It is equivalent to 'although A, nevertheless B'. The subject usually comes after 虽然 or 但是, not before 虽然.",
    examples: JSON.stringify([
      { zh: "虽然很累，但是他还是去上班了。", pinyin: "Suīrán hěn lèi, dànshì tā háishì qù shàngbān le.", en: "Although he was tired, he still went to work." },
      { zh: "虽然中文很难，但是我很喜欢学。", pinyin: "Suīrán Zhōngwén hěn nán, dànshì wǒ hěn xǐhuān xué.", en: "Although Chinese is hard, I really enjoy learning it." },
      { zh: "虽然天气不好，但是我们还是去了公园。", pinyin: "Suīrán tiānqì bù hǎo, dànshì wǒmen háishì qùle gōngyuán.", en: "Although the weather was bad, we still went to the park." },
    ]),
    reading_passage:
      "我的朋友阿明虽然工作很忙，但是每天都坚持运动。虽然他每天只能运动三十分钟，但是他说坚持比时间重要。虽然我觉得很难，但是我也想学他。我要从明天开始，虽然不知道能不能坚持。",
    comprehension_question: "What habit does Aming maintain despite being busy, and what does the narrator decide to do?",
    journal_prompt:
      "Write 3–4 sentences about a challenge you face but still work through anyway. Use 虽然…但是… to contrast the difficulty with your effort or attitude.",
  },
  {
    hsk_level: 2,
    display_order: 9,
    title: "一边…一边… — Simultaneous Actions",
    pattern: "一边 + V1，一边 + V2",
    explanation:
      "一边…一边… describes two actions happening at the same time by the same subject. Both verbs are usually brief activities; the construction is neutral about which is the main action.",
    examples: JSON.stringify([
      { zh: "她一边唱歌一边做饭。", pinyin: "Tā yībiān chàng gē yībiān zuò fàn.", en: "She sings while cooking." },
      { zh: "他一边喝咖啡一边看报纸。", pinyin: "Tā yībiān hē kāfēi yībiān kàn bàozhǐ.", en: "He drinks coffee while reading the newspaper." },
      { zh: "我一边走路一边听音乐。", pinyin: "Wǒ yībiān zǒulù yībiān tīng yīnyuè.", en: "I listen to music while walking." },
    ]),
    reading_passage:
      "我爸爸喜欢一边喝茶一边看新闻。妈妈常常一边做饭一边哼歌，厨房里总是很热闹。我自己喜欢一边跑步一边听播客，这样时间过得很快。但是老师说，不应该一边上课一边玩手机。",
    comprehension_question: "What does the narrator's mother do while cooking, and what does the narrator do while running?",
    journal_prompt:
      "Write 3–4 sentences about things you or people you know do simultaneously. Use 一边…一边… for each pair of actions.",
  },
  {
    hsk_level: 2,
    display_order: 10,
    title: "比较 (bǐjiào) — Relatively / Comparatively",
    pattern: "Subject + 比较 + adjective",
    explanation:
      "比较 means 'relatively' or 'rather' and softens a description, indicating that something is more X than the baseline or average. It is weaker than 很 and more objective in tone.",
    examples: JSON.stringify([
      { zh: "这个城市比较安静。", pinyin: "Zhège chéngshì bǐjiào ānjìng.", en: "This city is relatively quiet." },
      { zh: "今天比较冷，要多穿衣服。", pinyin: "Jīntiān bǐjiào lěng, yào duō chuān yīfu.", en: "It's rather cold today; you should wear more clothes." },
      { zh: "这道题比较难，我想一想。", pinyin: "Zhè dào tí bǐjiào nán, wǒ xiǎng yi xiǎng.", en: "This question is fairly difficult; let me think about it." },
    ]),
    reading_passage:
      "我家附近有两家咖啡店。一家比较贵，但是咖啡很好喝；另一家比较便宜，环境也比较安静。我比较喜欢安静的地方，所以我常常去那家便宜的。周末人比较多，但是工作日比较少。",
    comprehension_question: "What are the two differences between the two coffee shops near the narrator's home?",
    journal_prompt:
      "Write 3–4 sentences comparing two places, people, or things you know using 比较. Describe at least two qualities for each.",
  },

  // ─── HSK 3 ───────────────────────────────────────────────────────────────────
  {
    hsk_level: 3,
    display_order: 1,
    title: "把 (bǎ) — Disposal Construction",
    pattern: "Subject + 把 + object + verb + complement/result",
    explanation:
      "把 moves the object before the verb to emphasize what was done to it and with what result. The verb must carry a complement (result, direction, or extent); a bare verb after 把 is ungrammatical.",
    examples: JSON.stringify([
      { zh: "我把作业做完了。", pinyin: "Wǒ bǎ zuòyè zuò wán le.", en: "I finished (did completely) the homework." },
      { zh: "请把门关上。", pinyin: "Qǐng bǎ mén guān shàng.", en: "Please close the door." },
      { zh: "他把那本书借给我了。", pinyin: "Tā bǎ nà běn shū jiè gěi wǒ le.", en: "He lent that book to me." },
    ]),
    reading_passage:
      "今天大扫除，老师让我们把教室打扫干净。我们把桌椅摆整齐，把地板拖干净，还把窗户擦得很亮。最后，我们把垃圾都扔掉了。老师看完非常满意，说我们把工作做得很好。",
    comprehension_question: "What four things did the students do during the classroom clean-up?",
    journal_prompt:
      "Write 3–4 sentences describing chores or tasks you completed, focusing on what you did to the object. Use 把 + object + verb + result complement in each sentence.",
  },
  {
    hsk_level: 3,
    display_order: 2,
    title: "被 (bèi) — Passive Construction",
    pattern: "Subject + 被 + (agent) + verb + result/complement",
    explanation:
      "被 introduces the passive voice, highlighting that the subject received the action. In Chinese, the passive is typically used for adverse or noteworthy events. The verb needs a result or complement, just like 把.",
    examples: JSON.stringify([
      { zh: "我的自行车被偷了。", pinyin: "Wǒ de zìxíngchē bèi tōu le.", en: "My bicycle was stolen." },
      { zh: "那个问题被老师解释清楚了。", pinyin: "Nà gè wèntí bèi lǎoshī jiěshì qīngchǔ le.", en: "That question was explained clearly by the teacher." },
      { zh: "他被雨淋湿了。", pinyin: "Tā bèi yǔ lín shī le.", en: "He got soaked by the rain." },
    ]),
    reading_passage:
      "上周我的手机被我弟弟摔坏了。我很生气，但是他道歉了，说是不小心的。手机被送去修理，要等三天。这三天没有手机，感觉生活不方便多了。后来手机被修好了，我很高兴。",
    comprehension_question: "What happened to the narrator's phone, and how was the situation resolved?",
    journal_prompt:
      "Write 3–4 sentences about things that were done to you or your belongings — lost, broken, borrowed, praised, etc. Use 被 in each sentence.",
  },
  {
    hsk_level: 3,
    display_order: 3,
    title: "比 (bǐ) — Comparison",
    pattern: "A + 比 + B + adjective (+ degree)",
    explanation:
      "比 forms a direct comparison: 'A is more [adj] than B'. The adjective follows directly after B without 很 or 更 (though 更 can be added for emphasis). Negation with 没有 is used for 'not as … as'.",
    examples: JSON.stringify([
      { zh: "今天比昨天冷。", pinyin: "Jīntiān bǐ zuótiān lěng.", en: "Today is colder than yesterday." },
      { zh: "他跑得比我快多了。", pinyin: "Tā pǎo de bǐ wǒ kuài duō le.", en: "He runs much faster than I do." },
      { zh: "这家餐厅比那家贵一点。", pinyin: "Zhè jiā cāntīng bǐ nà jiā guì yīdiǎn.", en: "This restaurant is a little more expensive than that one." },
    ]),
    reading_passage:
      "我和姐姐常常比较。姐姐比我高，但是我跑得比她快。姐姐的成绩比我好，但是我的画画比她好。妈妈说，我们各有各的优点，不要总是比来比去。我觉得她说得有道理。",
    comprehension_question: "In what areas does each sibling outperform the other, and what does the mother say?",
    journal_prompt:
      "Write 4–5 sentences comparing yourself to a friend or family member. Use A + 比 + B + adjective for at least three different qualities, and try adding a degree word like 一点, 多了, or 得多.",
  },
  {
    hsk_level: 3,
    display_order: 4,
    title: "得 (de) — Degree Complement",
    pattern: "Verb + 得 + adjective / how-clause",
    explanation:
      "得 after a verb introduces a degree complement that evaluates the quality or manner of the action. If the verb has an object, the verb must be repeated before 得. Negation goes before the complement: verb + 得 + 不 + adj.",
    examples: JSON.stringify([
      { zh: "她唱歌唱得很好听。", pinyin: "Tā chàng gē chàng de hěn hǎotīng.", en: "She sings very beautifully." },
      { zh: "他说汉语说得很流利。", pinyin: "Tā shuō Hànyǔ shuō de hěn liúlì.", en: "He speaks Chinese very fluently." },
      { zh: "我跑得不够快。", pinyin: "Wǒ pǎo de bù gòu kuài.", en: "I don't run fast enough." },
    ]),
    reading_passage:
      "学校运动会上，我们班的小李跑步跑得最快，得了第一名。王老师跳绳跳得也很好，大家都笑了。我游泳游得不太好，但是我很努力。朋友说我做事做得认真，这让我很开心。",
    comprehension_question: "What did Xiao Li win at the sports day, and how does the narrator do at swimming?",
    journal_prompt:
      "Write 3–4 sentences evaluating how well you or someone you know does various activities. Use verb + 得 + adjective for each one.",
  },
  {
    hsk_level: 3,
    display_order: 5,
    title: "一…就… — As Soon As",
    pattern: "一 + V1，就 + V2",
    explanation:
      "一…就… expresses that V2 happens immediately or directly after V1. It can describe habitual patterns ('every time A happens, B happens') or a single sequence of events.",
    examples: JSON.stringify([
      { zh: "他一回家就睡觉。", pinyin: "Tā yī huí jiā jiù shuìjiào.", en: "He goes to sleep as soon as he gets home." },
      { zh: "我一听到那首歌就想哭。", pinyin: "Wǒ yī tīng dào nà shǒu gē jiù xiǎng kū.", en: "As soon as I hear that song, I feel like crying." },
      { zh: "他一说完，大家就鼓掌了。", pinyin: "Tā yī shuō wán, dàjiā jiù gǔzhǎng le.", en: "As soon as he finished speaking, everyone applauded." },
    ]),
    reading_passage:
      "我妹妹一放学就打开电视。妈妈说，作业没做完不能看电视，但是她一到家就忘了这个规定。我一提醒她，她就不高兴。不过，她一开始做作业，就做得很认真。我一看她认真的样子，就忍不住笑。",
    comprehension_question: "What does the younger sister do the moment she gets home, and what is the mother's rule?",
    journal_prompt:
      "Write 3–4 sentences about automatic reactions or habits — things you do immediately after something else happens. Use 一…就… for each.",
  },
  {
    hsk_level: 3,
    display_order: 6,
    title: "越…越… — The More…The More…",
    pattern: "越 + adj/verb，越 + adj/verb",
    explanation:
      "越…越… expresses a proportional relationship: as one quality or action increases, so does another. Both clauses share the same subject (or the subject appears before the first 越).",
    examples: JSON.stringify([
      { zh: "这本书越看越有意思。", pinyin: "Zhè běn shū yuè kàn yuè yǒuyìsi.", en: "The more I read this book, the more interesting it gets." },
      { zh: "他越说越快，我听不懂了。", pinyin: "Tā yuè shuō yuè kuài, wǒ tīng bù dǒng le.", en: "He spoke faster and faster; I couldn't understand anymore." },
      { zh: "天气越来越冷了。", pinyin: "Tiānqì yuè lái yuè lěng le.", en: "The weather is getting colder and colder." },
    ]),
    reading_passage:
      "我最近开始学做饭。刚开始的时候味道不太好，但是我越做越好。朋友来吃饭，越吃越多，说我做得真好吃。我越听他们夸我，越想做更多新菜。现在我越来越喜欢做饭了，感觉很有成就感。",
    comprehension_question: "How has the narrator's cooking improved, and how do the friends react?",
    journal_prompt:
      "Write 3–4 sentences describing something that keeps getting better (or worse) over time, or a habit that escalates. Use 越…越… at least twice and 越来越 once.",
  },
  {
    hsk_level: 3,
    display_order: 7,
    title: "除了…还/都… — Apart From / Besides",
    pattern: "除了 + A (以外)，还/也/都 + B",
    explanation:
      "除了…还/也… means 'besides A, also B' (additive). 除了…都… means 'apart from A, everything/everyone else is B' (exclusive/subtractive). The meaning depends on whether the second clause is positive or negative.",
    examples: JSON.stringify([
      { zh: "除了英语，他还会说日语。", pinyin: "Chúle Yīngyǔ, tā hái huì shuō Rìyǔ.", en: "Besides English, he can also speak Japanese." },
      { zh: "除了他，大家都来了。", pinyin: "Chúle tā, dàjiā dōu lái le.", en: "Everyone came except him." },
      { zh: "除了跑步，我还喜欢游泳。", pinyin: "Chúle pǎobù, wǒ hái xǐhuān yóuyǒng.", en: "Besides running, I also like swimming." },
    ]),
    reading_passage:
      "我们学校的图书馆除了有很多书，还有电影和音乐资源。除了我，班里其他同学都去过图书馆参观。图书馆除了周一关门，每天都开放。我以前不知道，现在觉得真方便。下次除了借书，我还想借一部电影看。",
    comprehension_question: "What resources does the library have besides books, and when is it closed?",
    journal_prompt:
      "Write 3–4 sentences about your interests, skills, or habits using 除了…还… to add information and 除了…都… to make one exception.",
  },
  {
    hsk_level: 3,
    display_order: 8,
    title: "只有…才… — Only If…Then…",
    pattern: "只有 + condition，才 + result",
    explanation:
      "只有…才… states a necessary condition: only if A is true can B happen. It is stronger and more exclusive than 如果, implying that no other condition will produce the result.",
    examples: JSON.stringify([
      { zh: "只有努力学习，才能考上好大学。", pinyin: "Zhǐyǒu nǔlì xuéxí, cái néng kǎo shàng hǎo dàxué.", en: "Only by studying hard can you get into a good university." },
      { zh: "只有你来，我才去。", pinyin: "Zhǐyǒu nǐ lái, wǒ cái qù.", en: "I'll only go if you come." },
      { zh: "只有见到她本人，我才相信。", pinyin: "Zhǐyǒu jiàn dào tā běnrén, wǒ cái xiāngxìn.", en: "I'll only believe it when I see her in person." },
    ]),
    reading_passage:
      "奶奶常说，只有吃苦，才能成功。她年轻的时候生活很难，但是她努力工作，后来生活变好了。她说，只有健康，才有一切；只有家人在一起，生活才幸福。我听了很感动，觉得她说的很对。",
    comprehension_question: "What life advice does the grandmother give, and what personal experience does she share?",
    journal_prompt:
      "Write 3–4 sentences about things that are necessary in order to achieve a goal or feel a certain way. Use 只有…才… for each.",
  },
  {
    hsk_level: 3,
    display_order: 9,
    title: "是…的 — Emphasis on Circumstance of a Past Event",
    pattern: "是 + time/place/manner/agent + verb + 的",
    explanation:
      "是…的 is used to emphasize a specific detail (when, where, how, or by whom) about an action that is already known to have occurred. 是 can be omitted in speech; 的 is essential and comes at the end.",
    examples: JSON.stringify([
      { zh: "我是昨天来的。", pinyin: "Wǒ shì zuótiān lái de.", en: "I came yesterday (not some other time)." },
      { zh: "这个蛋糕是她亲手做的。", pinyin: "Zhège dàngāo shì tā qīnshǒu zuò de.", en: "This cake was made by her own hands." },
      { zh: "你是坐飞机来的还是坐火车来的？", pinyin: "Nǐ shì zuò fēijī lái de háishi zuò huǒchē lái de?", en: "Did you come by plane or by train?" },
    ]),
    reading_passage:
      "朋友问我是什么时候开始学汉语的。我说，我是三年前开始学的，是在网上报名的课。她问我是一个人学还是跟老师学的。我说，我是跟一位台湾老师学的，是用视频通话上课的。她说她也想这样学。",
    comprehension_question: "When did the narrator start learning Chinese, and how did they take their lessons?",
    journal_prompt:
      "Write 3–4 sentences emphasizing specific details about past events — where you bought something, who gave it to you, or how you got somewhere. Use 是…的 for each.",
  },
  {
    hsk_level: 3,
    display_order: 10,
    title: "为了 (wèile) — In Order To",
    pattern: "为了 + goal，subject + verb",
    explanation:
      "为了 introduces a purpose or goal and appears before the verb phrase or clause it motivates. The subject usually follows 为了 + goal, but when the purpose is obvious or shared, the subject can come first.",
    examples: JSON.stringify([
      { zh: "为了省钱，他每天自己做饭。", pinyin: "Wèile shěng qián, tā měitiān zìjǐ zuò fàn.", en: "In order to save money, he cooks for himself every day." },
      { zh: "为了学好汉语，我每天练习两个小时。", pinyin: "Wèile xué hǎo Hànyǔ, wǒ měitiān liànxí liǎng gè xiǎoshí.", en: "To learn Chinese well, I practice two hours every day." },
      { zh: "她为了孩子放弃了工作。", pinyin: "Tā wèile háizi fàngqì le gōngzuò.", en: "She gave up her job for the sake of her children." },
    ]),
    reading_passage:
      "我的朋友小张为了考研，这个暑假没有出去玩。他每天早上六点起床，为了多争取一点学习时间。为了保持精力，他坚持每天跑步半小时。他说，为了梦想，暂时的牺牲是值得的。我很敬佩他的决心。",
    comprehension_question: "What is Xiao Zhang preparing for, and what sacrifices is he making?",
    journal_prompt:
      "Write 3–4 sentences about goals you are working toward and what you are doing to achieve them. Use 为了 at the start of each sentence.",
  },

  // ─── HSK 4 ───────────────────────────────────────────────────────────────────
  {
    hsk_level: 4,
    display_order: 1,
    title: "既然…就… — Since (Given That)…Then…",
    pattern: "既然 + established fact，就 + conclusion/action",
    explanation:
      "既然…就… is used when drawing a logical conclusion from a fact that is already accepted by both parties. It differs from 因为…所以 in that the premise is mutually acknowledged, often leading to a recommendation or decision.",
    examples: JSON.stringify([
      { zh: "既然你已经决定了，就去做吧。", pinyin: "Jìrán nǐ yǐjīng juédìng le, jiù qù zuò ba.", en: "Since you've already decided, just go ahead and do it." },
      { zh: "既然天气这么好，我们就出去走走吧。", pinyin: "Jìrán tiānqì zhème hǎo, wǒmen jiù chūqù zǒuzǒu ba.", en: "Since the weather is so nice, let's go for a walk." },
      { zh: "既然他不来，我们就不等了。", pinyin: "Jìrán tā bù lái, wǒmen jiù bù děng le.", en: "Since he's not coming, let's not wait any longer." },
    ]),
    reading_passage:
      "同事问我要不要一起去吃午饭。我说我本来想带饭，但是忘了做。他说，既然你忘了带，就跟我们一起去吧，反正也不远。我想了想，觉得他说得对，既然都来了，就顺便多认识几个同事。后来我很高兴去了。",
    comprehension_question: "Why does the narrator decide to join the colleagues for lunch?",
    journal_prompt:
      "Write 3–4 sentences where you or someone else uses an already-established fact to justify a decision or action. Use 既然…就… for each.",
  },
  {
    hsk_level: 4,
    display_order: 2,
    title: "无论/不管…都… — No Matter What",
    pattern: "无论/不管 + question-word clause，都 + result",
    explanation:
      "无论 (formal) and 不管 (colloquial) both mean 'no matter' and introduce all possible conditions. The second clause uses 都 to assert that the outcome holds in every case. A question word (谁, 什么, 怎么, 多) is typically embedded.",
    examples: JSON.stringify([
      { zh: "无论多忙，他都坚持锻炼。", pinyin: "Wúlùn duō máng, tā dōu jiānchí duànliàn.", en: "No matter how busy, he always keeps exercising." },
      { zh: "不管天气怎么样，我们都要出发。", pinyin: "Bùguǎn tiānqì zěnmeyàng, wǒmen dōu yào chūfā.", en: "Regardless of the weather, we are leaving." },
      { zh: "无论你去哪里，我都支持你。", pinyin: "Wúlùn nǐ qù nǎlǐ, wǒ dōu zhīchí nǐ.", en: "No matter where you go, I will support you." },
    ]),
    reading_passage:
      "我的导师说，无论遇到什么困难，都不要轻易放弃。他告诉我，不管别人怎么看你，都要坚持自己的想法。这句话让我想起了我第一次参加比赛的经历。那次我输了，但是不管结果如何，我都学到了很多。",
    comprehension_question: "What two pieces of advice does the mentor give, and what memory does the narrator recall?",
    journal_prompt:
      "Write 3–4 sentences expressing unconditional commitments or truths in your life. Use 无论…都… or 不管…都… for each.",
  },
  {
    hsk_level: 4,
    display_order: 3,
    title: "宁可/宁愿…也不… — Would Rather…Than…",
    pattern: "宁可/宁愿 + preferred option，也不 + rejected option",
    explanation:
      "宁可/宁愿…也不… expresses a strong preference by choosing the lesser of two options — often an unpleasant one — over a worse alternative. It conveys resolve or strong principle.",
    examples: JSON.stringify([
      { zh: "我宁可走路，也不坐那么拥挤的地铁。", pinyin: "Wǒ nìngkě zǒulù, yě bù zuò nàme yōngjǐ de dìtiě.", en: "I'd rather walk than take such a crowded subway." },
      { zh: "她宁愿一个人住，也不跟陌生人合租。", pinyin: "Tā nìngyuàn yī gè rén zhù, yě bù gēn mòshēng rén hézū.", en: "She would rather live alone than share with strangers." },
      { zh: "他宁可少赚钱，也不做违心的事。", pinyin: "Tā nìngkě shǎo zhuàn qián, yě bù zuò wéi xīn de shì.", en: "He would rather earn less money than do things against his conscience." },
    ]),
    reading_passage:
      "朋友问我为什么不去那家薪水更高的公司。我说，那家公司加班很多，我宁可少赚一点，也不牺牲自己的休息时间。我觉得生活质量比收入更重要。朋友说他理解，他宁愿住得远一点，也不住在嘈杂的地方。我们都笑了，说彼此真像。",
    comprehension_question: "Why does the narrator turn down the higher-paying job offer?",
    journal_prompt:
      "Write 2–3 sentences about personal values or trade-offs you would make. Use 宁可/宁愿…也不… to show what you prefer even at a cost.",
  },
  {
    hsk_level: 4,
    display_order: 4,
    title: "甚至 (shènzhì) — Even",
    pattern: "…甚至 + (more extreme example)…",
    explanation:
      "甚至 introduces the most extreme case in a list or argument, equivalent to 'even' or 'going so far as to'. It intensifies a claim by escalating to a surprising or unexpected example.",
    examples: JSON.stringify([
      { zh: "他工作太忙，甚至连饭都没时间吃。", pinyin: "Tā gōngzuò tài máng, shènzhì lián fàn dōu méi shíjiān chī.", en: "He's so busy that he doesn't even have time to eat." },
      { zh: "她非常喜欢猫，甚至给猫买了专用的沙发。", pinyin: "Tā fēicháng xǐhuān māo, shènzhì gěi māo mǎi le zhuānyòng de shāfā.", en: "She loves cats so much she even bought a dedicated sofa for them." },
      { zh: "这部电影太感人了，甚至让我哭了。", pinyin: "Zhè bù diànyǐng tài gǎnrén le, shènzhì ràng wǒ kū le.", en: "This movie was so moving it even made me cry." },
    ]),
    reading_passage:
      "我的室友对学习非常投入。他会在图书馆待到很晚，甚至忘记吃晚饭。上周考试前，他几乎没睡，甚至在厕所里都在背单词。他的成绩很好，但是我担心他的身体。我劝他注意休息，他甚至说睡眠是浪费时间。",
    comprehension_question: "How dedicated is the roommate to studying, and what does the narrator worry about?",
    journal_prompt:
      "Write 2–3 sentences about an extreme case or surprising example that illustrates a point. Use 甚至 to introduce the most unexpected part.",
  },
  {
    hsk_level: 4,
    display_order: 5,
    title: "于是 (yúshì) — And So / As a Result",
    pattern: "Situation A，于是 + response/action B",
    explanation:
      "于是 connects two clauses where B is a natural or logical response to A. It is similar to 所以 but focuses more on a spontaneous decision or action that follows from a situation, and is typically used in narration.",
    examples: JSON.stringify([
      { zh: "下起了雨，于是我们决定留在家里。", pinyin: "Xià qǐ le yǔ, yúshì wǒmen juédìng liú zài jiālǐ.", en: "It started raining, so we decided to stay home." },
      { zh: "他看到朋友很难过，于是过去安慰他。", pinyin: "Tā kàn dào péngyǒu hěn nánguò, yúshì guòqù ānwèi tā.", en: "He saw his friend was upset, so he went over to comfort him." },
      { zh: "地图找不到了，于是我们问了当地人。", pinyin: "Dìtú zhǎo bù dào le, yúshì wǒmen wèn le dāngdì rén.", en: "We couldn't find the map, so we asked a local." },
    ]),
    reading_passage:
      "旅行途中，我们的车坏了。等了一个小时，修车的人还没来。于是我们决定去附近的村子找帮助。村民非常热情，让我们在他家休息，还请我们吃饭。于是一次意外变成了一次难忘的相遇，我们都很感动。",
    comprehension_question: "What problem did the travelers face, and what did they decide to do about it?",
    journal_prompt:
      "Write 3–4 sentences narrating a chain of events where each action was triggered by the previous situation. Use 于是 to connect at least two transitions.",
  },
  {
    hsk_level: 4,
    display_order: 6,
    title: "由于 (yóuyú) — Due To / Owing To",
    pattern: "由于 + cause，result clause",
    explanation:
      "由于 is a formal conjunction meaning 'due to' or 'owing to', used to state objective causes, often in writing, announcements, or explanations. It is more formal than 因为 and typically comes at the start of the sentence.",
    examples: JSON.stringify([
      { zh: "由于天气原因，航班被取消了。", pinyin: "Yóuyú tiānqì yuányīn, hángbān bèi qǔxiāo le.", en: "Due to weather conditions, the flight was cancelled." },
      { zh: "由于工作需要，她搬到了上海。", pinyin: "Yóuyú gōngzuò xūyào, tā bān dào le Shànghǎi.", en: "Owing to work requirements, she moved to Shanghai." },
      { zh: "由于疏忽，他把重要文件弄丢了。", pinyin: "Yóuyú shūhū, tā bǎ zhòngyào wénjiàn nòng diū le.", en: "Due to negligence, he lost an important document." },
    ]),
    reading_passage:
      "由于最近工作压力很大，我的睡眠质量变差了。由于睡眠不足，白天上班时常常感到疲惫。我去看了医生，医生说由于我的生活习惯不规律，身体出现了一些问题。他建议我减少加班，多休息。我决定从这周开始改变。",
    comprehension_question: "What is causing the narrator's sleep problems, and what does the doctor recommend?",
    journal_prompt:
      "Write 3–4 sentences using 由于 to explain objective reasons for situations or decisions — formal in tone. Try to use it in different positions (beginning of clause, beginning of sentence).",
  },
  {
    hsk_level: 4,
    display_order: 7,
    title: "对于 (duìyú) — Regarding / With Respect To",
    pattern: "对于 + topic/person，subject + comment",
    explanation:
      "对于 introduces the topic or target of an evaluation, attitude, or judgment. It is more formal than 对 and is often used in writing. The subject of the main clause evaluates or relates to the 对于 topic.",
    examples: JSON.stringify([
      { zh: "对于这个问题，我还没有想清楚。", pinyin: "Duìyú zhège wèntí, wǒ hái méiyǒu xiǎng qīngchǔ.", en: "Regarding this issue, I haven't thought it through yet." },
      { zh: "对于初学者来说，汉字很难写。", pinyin: "Duìyú chūxuézhě lái shuō, Hànzì hěn nán xiě.", en: "For beginners, Chinese characters are very hard to write." },
      { zh: "对于她的批评，他保持沉默。", pinyin: "Duìyú tā de pīpíng, tā bǎochí chénmò.", en: "In response to her criticism, he remained silent." },
    ]),
    reading_passage:
      "公司讨论了新的工作政策。对于延长工作时间的建议，大多数员工表示反对。对于弹性工作制，大家则普遍表示支持。对于我个人来说，能在家办公是最重要的。最终，管理层决定试行弹性工作制三个月，看看效果如何。",
    comprehension_question: "What are employees' opinions on the two proposals, and what did management decide?",
    journal_prompt:
      "Write 3–4 sentences sharing your views on different topics or proposals. Use 对于…来说 or 对于…我认为… to introduce each topic.",
  },
  {
    hsk_level: 4,
    display_order: 8,
    title: "通过 (tōngguò) — Through / By Means Of",
    pattern: "通过 + method/channel，subject + achieve result",
    explanation:
      "通过 means 'through' or 'by means of' and introduces the method or channel used to achieve something. It can precede a noun or a verb phrase and often appears at the beginning of the sentence.",
    examples: JSON.stringify([
      { zh: "通过努力学习，他考上了名牌大学。", pinyin: "Tōngguò nǔlì xuéxí, tā kǎo shàng le míngpái dàxué.", en: "Through hard study, he got into a prestigious university." },
      { zh: "我是通过朋友介绍认识她的。", pinyin: "Wǒ shì tōngguò péngyǒu jièshào rènshi tā de.", en: "I got to know her through an introduction by a friend." },
      { zh: "通过这次经历，我学到了很多。", pinyin: "Tōngguò zhè cì jīnglì, wǒ xué dào le hěn duō.", en: "Through this experience, I learned a great deal." },
    ]),
    reading_passage:
      "我是通过一个语言交换应用认识我现在的汉语老师的。我们通过视频通话每周练习两次。通过几个月的坚持，我的口语进步了很多。老师说，通过每天写日记，我的写作也会慢慢变好。我很感谢这个认识她的机会。",
    comprehension_question: "How did the narrator meet their Chinese teacher, and what improvement have they seen?",
    journal_prompt:
      "Write 3–4 sentences about how you learned a skill, made a connection, or achieved a goal — focusing on the method. Use 通过 to introduce the means in each sentence.",
  },
  {
    hsk_level: 4,
    display_order: 9,
    title: "随着 (suízhe) — Along With / As … Changes",
    pattern: "随着 + changing factor，result also changes",
    explanation:
      "随着 means 'along with' or 'as (X changes/progresses)' and introduces a factor whose change causes or accompanies a corresponding change in the main clause. It is commonly used in formal or analytical writing.",
    examples: JSON.stringify([
      { zh: "随着科技的发展，人们的生活越来越方便。", pinyin: "Suízhe kējì de fāzhǎn, rénmen de shēnghuó yuè lái yuè fāngbiàn.", en: "As technology advances, people's lives become more and more convenient." },
      { zh: "随着年龄的增长，他变得更加成熟。", pinyin: "Suízhe niánlíng de zēngzhǎng, tā biàn de gèngjiā chéngshú.", en: "As he grew older, he became more mature." },
      { zh: "随着天气变冷，公园里的人越来越少。", pinyin: "Suízhe tiānqì biàn lěng, gōngyuán lǐ de rén yuè lái yuè shǎo.", en: "As the weather turns cold, fewer and fewer people come to the park." },
    ]),
    reading_passage:
      "随着城市的扩张，我们村子附近的农田越来越少。随着年轻人不断涌入城市，村子里的老人越来越多。随着时代的变化，传统的农业生活方式也在慢慢消失。爷爷说，随着时代进步，有些东西失去了，但也得到了很多。",
    comprehension_question: "What changes has urbanization brought to the narrator's village?",
    journal_prompt:
      "Write 3–4 sentences describing how something in your life or society has changed as time or circumstances have shifted. Use 随着 to introduce the driving change.",
  },
  {
    hsk_level: 4,
    display_order: 10,
    title: "反而 (fǎn'ér) — On the Contrary / Instead",
    pattern: "Expected outcome A (did not happen), 反而 + actual (opposite) outcome B",
    explanation:
      "反而 introduces a result that is the opposite of what was expected or intended. It is placed before the verb in the second clause and implies surprise or irony.",
    examples: JSON.stringify([
      { zh: "我以为他会高兴，他反而生气了。", pinyin: "Wǒ yǐwéi tā huì gāoxìng, tā fǎn'ér shēngqì le.", en: "I thought he would be happy; instead, he got angry." },
      { zh: "吃了感冒药，我反而更难受了。", pinyin: "Chī le gǎnmào yào, wǒ fǎn'ér gèng nánshòu le.", en: "After taking the cold medicine, I actually felt worse." },
      { zh: "她越解释，大家反而越不明白。", pinyin: "Tā yuè jiěshì, dàjiā fǎn'ér yuè bù míngbái.", en: "The more she explained, the more confused everyone became." },
    ]),
    reading_passage:
      "我朋友劝我放松，但是我越想放松反而越紧张。考试前我喝了很多咖啡，想提神，结果反而睡不着觉。后来我干脆停止复习，出去散步，反而心情好多了，回来以后脑子也更清楚。看来有时候休息反而比努力更有效。",
    comprehension_question: "What unexpected effects did coffee and rest have on the narrator before the exam?",
    journal_prompt:
      "Write 2–3 sentences about times when the opposite of what you expected happened. Use 反而 to highlight the surprising outcome.",
  },

  // ─── HSK 5 ───────────────────────────────────────────────────────────────────
  {
    hsk_level: 5,
    display_order: 1,
    title: "固然…但是/然而… — Admittedly…But…",
    pattern: "固然 + conceded fact，但是/然而 + contrasting point",
    explanation:
      "固然 acknowledges a point as true but immediately qualifies or contradicts it. More formal and emphatic than 虽然, it is typical in argumentation and essays, implying the writer fully accepts the premise before making a stronger counter-point.",
    examples: JSON.stringify([
      { zh: "金钱固然重要，但并不是一切。", pinyin: "Jīnqián gùrán zhòngyào, dàn bìng bú shì yīqiè.", en: "Money is admittedly important, but it is not everything." },
      { zh: "这个计划固然有风险，然而也有很大潜力。", pinyin: "Zhège jìhuà gùrán yǒu fēngxiǎn, rán'ér yě yǒu hěn dà qiánlì.", en: "This plan admittedly carries risks; however, it also has great potential." },
      { zh: "他的想法固然新颖，但实施起来很困难。", pinyin: "Tā de xiǎngfǎ gùrán xīnyǐng, dàn shíshī qǐlái hěn kùnnán.", en: "His idea is admittedly novel, but putting it into practice is very difficult." },
    ]),
    reading_passage:
      "有人认为人工智能会取代所有工作。人工智能的能力固然令人惊叹，然而它目前仍无法完全复制人类的创造力和情感判断。技术的进步固然带来了效率，但也引发了就业结构的深刻变化。我们固然无法阻止这种趋势，然而可以通过教育来应对挑战。",
    comprehension_question: "What argument does the passage make about AI replacing human work?",
    journal_prompt:
      "Write 2–3 sentences on a topic where you acknowledge a valid opposing point before presenting your own view. Use 固然…但是/然而… to structure the argument.",
  },
  {
    hsk_level: 5,
    display_order: 2,
    title: "何况 (hékuàng) — Let Alone / Much Less / Moreover",
    pattern: "A (easier/less extreme case)，何况 + B (harder/more extreme case)",
    explanation:
      "何况 introduces an extreme or more obvious case to reinforce an argument: 'if A is already true, then B is even more so (or even less possible)'. It can work both in escalating and de-escalating arguments.",
    examples: JSON.stringify([
      { zh: "连小孩都能做到，何况是大人呢？", pinyin: "Lián xiǎohái dōu néng zuò dào, hékuàng shì dàrén ne?", en: "Even children can do it, let alone adults." },
      { zh: "我连母语都不能说清楚，何况外语。", pinyin: "Wǒ lián mǔyǔ dōu bù néng shuō qīngchǔ, hékuàng wàiyǔ.", en: "I can't even speak my mother tongue clearly, let alone a foreign language." },
      { zh: "走路要两个小时，何况带着行李。", pinyin: "Zǒulù yào liǎng gè xiǎoshí, hékuàng dài zhe xínglǐ.", en: "It takes two hours on foot, let alone while carrying luggage." },
    ]),
    reading_passage:
      "参加这次马拉松的最小选手只有十六岁，连很多成年人都跑不了全程，何况是一个少年。但他不仅完成了，还跑进了前五十名。这让很多观众感动。体力固然重要，何况他还有惊人的意志力。这件事提醒我，年龄不是借口。",
    comprehension_question: "What makes the sixteen-year-old's marathon achievement particularly impressive?",
    journal_prompt:
      "Write 2–3 sentences using 何况 to build an argument by escalating from a less extreme case to a more obvious one.",
  },
  {
    hsk_level: 5,
    display_order: 3,
    title: "毕竟 (bìjìng) — After All / When All Is Said and Done",
    pattern: "…，毕竟 + underlying reason or fundamental truth",
    explanation:
      "毕竟 introduces the underlying or decisive reason that ultimately explains or justifies a situation. It concedes complexity but appeals to a basic truth, roughly equivalent to 'after all' or 'in the end'.",
    examples: JSON.stringify([
      { zh: "别太在意他，他毕竟还只是个孩子。", pinyin: "Bié tài zàiyì tā, tā bìjìng hái zhǐ shì gè háizi.", en: "Don't take him too seriously; after all, he is still just a child." },
      { zh: "她虽然不完美，但毕竟是你的朋友。", pinyin: "Tā suīrán bù wánměi, dàn bìjìng shì nǐ de péngyǒu.", en: "She may not be perfect, but she is your friend after all." },
      { zh: "这件事毕竟不那么简单，需要时间。", pinyin: "Zhè jiàn shì bìjìng bù nàme jiǎndān, xūyào shíjiān.", en: "This matter is not that simple after all; it takes time." },
    ]),
    reading_passage:
      "朋友问我为什么不责怪那位同事。我说，他虽然犯了错，但毕竟是第一次，大家都有不小心的时候。而且，他毕竟为团队付出了很多，一个错误不能抹掉他的贡献。朋友说我太宽容了，我说，毕竟我们在一起工作了五年，情谊更重要。",
    comprehension_question: "Why does the narrator choose not to blame the colleague?",
    journal_prompt:
      "Write 2–3 sentences where you explain a decision or attitude by appealing to a fundamental truth. Use 毕竟 to introduce that underlying reason.",
  },
  {
    hsk_level: 5,
    display_order: 4,
    title: "否则 (fǒuzé) — Otherwise / Or Else",
    pattern: "Condition A (must be met)，否则 + negative consequence B",
    explanation:
      "否则 means 'otherwise' or 'or else' and introduces the consequence of not fulfilling the condition in the first clause. It is more formal than 不然 and common in written Chinese.",
    examples: JSON.stringify([
      { zh: "你要赶快出发，否则会迟到。", pinyin: "Nǐ yào gǎnkuài chūfā, fǒuzé huì chídào.", en: "You need to leave quickly, otherwise you'll be late." },
      { zh: "请保持安静，否则会影响他人。", pinyin: "Qǐng bǎochí ānjìng, fǒuzé huì yǐngxiǎng tārén.", en: "Please keep quiet, or else you will disturb others." },
      { zh: "要定期备份文件，否则数据丢失就麻烦了。", pinyin: "Yào dìngqī bèifèn wénjiàn, fǒuzé shùjù diūshī jiù máfan le.", en: "You should back up files regularly; otherwise, losing the data will be a big problem." },
    ]),
    reading_passage:
      "医生叮嘱我，必须按时服药，否则病情会反复。他说，睡眠也很重要，否则免疫力会下降。我决定严格遵守医嘱。回到家，我把药放在显眼的地方，否则我可能忘记。我知道，否则只是一个词，但背后的后果是真实的。",
    comprehension_question: "What two instructions does the doctor give, and what consequence does each carry?",
    journal_prompt:
      "Write 3–4 sentences laying out conditions and their consequences. Use 否则 to introduce at least three different 'or else' scenarios.",
  },
  {
    hsk_level: 5,
    display_order: 5,
    title: "倒 (dào) — Contrary to Expectation",
    pattern: "Expected result A (implied), 倒 + actual (contrasting) result B",
    explanation:
      "倒 (toned dào, distinct from 到 dào meaning 'arrive') is a modal adverb that signals a result contrary to expectation. It often conveys mild surprise or irony and can soften a complaint or point out a reversal.",
    examples: JSON.stringify([
      { zh: "这道题我以为很难，做起来倒挺简单的。", pinyin: "Zhè dào tí wǒ yǐwéi hěn nán, zuò qǐlái dào tǐng jiǎndān de.", en: "I thought this problem would be hard; it actually turned out to be quite simple." },
      { zh: "他没来帮忙，你倒来了，真让我感动。", pinyin: "Tā méi lái bāngmáng, nǐ dào lái le, zhēn ràng wǒ gǎndòng.", en: "He didn't come to help, but you actually did — that really moved me." },
      { zh: "我本来不想去，去了倒很开心。", pinyin: "Wǒ běnlái bù xiǎng qù, qù le dào hěn kāixīn.", en: "I didn't want to go at first; going turned out to be quite enjoyable." },
    ]),
    reading_passage:
      "同事们都说公司的年会无聊，我本来做好了心理准备。但今年的年会倒办得很有趣，有好几个环节让大家都笑了。主持人倒是一个平时很安静的同事，表演起来却非常搞笑。我原以为会坐立不安，倒是待到了最后。",
    comprehension_question: "What surprised the narrator about the company's annual party?",
    journal_prompt:
      "Write 2–3 sentences about times when your expectations were pleasantly or unpleasantly reversed. Use 倒 to highlight the unexpected outcome.",
  },
  {
    hsk_level: 5,
    display_order: 6,
    title: "所 + V — Nominalizing Verb Phrases",
    pattern: "所 + verb (+ 的) + noun",
    explanation:
      "所 is a classical particle that turns a verb phrase into a noun modifier meaning 'that which is V-ed' or 'what is V-ed'. It is common in formal, written, or literary Chinese, often in set phrases like 所有, 所见, 所想.",
    examples: JSON.stringify([
      { zh: "我所知道的都告诉你了。", pinyin: "Wǒ suǒ zhīdào de dōu gàosù nǐ le.", en: "I've told you everything I know." },
      { zh: "他所做的一切都是为了家人。", pinyin: "Tā suǒ zuò de yīqiè dōu shì wèile jiārén.", en: "Everything he has done is for his family." },
      { zh: "这正是我所希望看到的结果。", pinyin: "Zhè zhèng shì wǒ suǒ xīwàng kàn dào de jiéguǒ.", en: "This is exactly the outcome I had hoped to see." },
    ]),
    reading_passage:
      "这位作家在演讲中说，她所写的每一个故事都来自真实的生活经历。她所观察到的社会现象让她感到既痛苦又充满希望。她所相信的是，文学能够改变人心。她的听众所感受到的，是一种深深的共鸣。我也被她所说的深深打动了。",
    comprehension_question: "According to the author, what is the source of her stories and what does she believe literature can do?",
    journal_prompt:
      "Write 3–4 sentences in a reflective or formal style using 所 + verb + 的 to nominalize verb phrases. Describe what you have learned, felt, or seen.",
  },
  {
    hsk_level: 5,
    display_order: 7,
    title: "之所以…是因为… — The Reason…Is That…",
    pattern: "之所以 + result/state，是因为 + cause",
    explanation:
      "之所以…是因为… reverses the normal cause-effect order, starting with the result and then explaining the cause. It is more formal and emphatic than 因为…所以, often used to explain something that has already been observed.",
    examples: JSON.stringify([
      { zh: "我之所以选择这份工作，是因为它有更大的发展空间。", pinyin: "Wǒ zhī suǒyǐ xuǎnzé zhè fèn gōngzuò, shì yīnwèi tā yǒu gèng dà de fāzhǎn kōngjiān.", en: "The reason I chose this job is that it offers greater room for growth." },
      { zh: "她之所以成功，是因为她从不放弃。", pinyin: "Tā zhī suǒyǐ chénggōng, shì yīnwèi tā cóng bù fàngqì.", en: "The reason she succeeded is that she never gave up." },
      { zh: "这部电影之所以受欢迎，是因为它真实地反映了普通人的生活。", pinyin: "Zhè bù diànyǐng zhī suǒyǐ shòu huānyíng, shì yīnwèi tā zhēnshí de fǎnyìng le pǔtōngrén de shēnghuó.", en: "The reason this film is popular is that it genuinely reflects ordinary people's lives." },
    ]),
    reading_passage:
      "很多人问我，我之所以坚持每天写日记，是因为什么。我说，我之所以这样做，是因为写作帮助我整理思路，减少焦虑。我之所以不用手机写，是因为纸和笔让我更专注。这个习惯让我更了解自己。之所以推荐给大家，也是因为它真的有效。",
    comprehension_question: "Why does the narrator write by hand rather than on a phone?",
    journal_prompt:
      "Write 2–3 sentences explaining the deeper reasons behind choices or habits you have. Use 之所以…是因为… to give those explanations.",
  },
  {
    hsk_level: 5,
    display_order: 8,
    title: "不得不 — Have No Choice But To",
    pattern: "Subject + 不得不 + verb",
    explanation:
      "不得不 expresses compulsion without personal will — the subject is forced by circumstances to do something they might not choose freely. It is stronger than 必须 and carries an undertone of reluctance or resignation.",
    examples: JSON.stringify([
      { zh: "道路封闭，我不得不绕路走。", pinyin: "Dàolù fēngbì, wǒ bùdébù rào lù zǒu.", en: "The road was closed; I had no choice but to take a detour." },
      { zh: "由于成本问题，公司不得不裁员。", pinyin: "Yóuyú chéngběn wèntí, gōngsī bùdébù cáiyuán.", en: "Due to cost issues, the company was forced to lay off staff." },
      { zh: "孩子生病了，她不得不请假回家。", pinyin: "Háizi shēngbìng le, tā bùdébù qǐngjià huí jiā.", en: "Her child got sick, so she had no choice but to take leave and go home." },
    ]),
    reading_passage:
      "去年公司项目出了问题，我不得不连续加班两个星期。那段时间我不得不推迟了计划好的旅行，朋友们都很失望。我不得不承认，那是一段很艰难的时期。但正是那次经历，让我学会了在压力下如何冷静地解决问题。",
    comprehension_question: "What did the narrator have to sacrifice because of the work crisis last year?",
    journal_prompt:
      "Write 3–4 sentences about situations where you or someone else was compelled to do something by circumstances. Use 不得不 and describe the context that made it necessary.",
  },
  {
    hsk_level: 5,
    display_order: 9,
    title: "难道…吗 — Rhetorical Question",
    pattern: "难道 + statement + 吗？",
    explanation:
      "难道…吗 forms a rhetorical question that expects the answer to be obvious — typically the opposite of what is stated. It expresses surprise, disbelief, or indignation, and can be translated as 'Don't tell me…', 'Surely not…', or 'Is it possible that…?'.",
    examples: JSON.stringify([
      { zh: "难道你不知道今天有考试吗？", pinyin: "Nándào nǐ bù zhīdào jīntiān yǒu kǎoshì ma?", en: "Don't tell me you didn't know there was an exam today?!" },
      { zh: "难道这点困难就能打倒你吗？", pinyin: "Nándào zhè diǎn kùnnán jiù néng dǎdǎo nǐ ma?", en: "Surely a little difficulty like this can't defeat you, can it?" },
      { zh: "他难道没有看到那封邮件吗？", pinyin: "Tā nándào méiyǒu kàn dào nà fēng yóujiàn ma?", en: "Can it be that he didn't see that email?" },
    ]),
    reading_passage:
      "我和朋友聊起了一个热门话题：年轻人应不应该早早结婚。我说，每个人的情况不同，难道所有人都必须在三十岁前结婚吗？朋友说，社会压力太大了。我说，难道社会的期待比个人的幸福更重要吗？我们都觉得，这个问题值得深思。",
    comprehension_question: "What two rhetorical questions does the narrator pose, and what topic are they debating?",
    journal_prompt:
      "Write 2–3 rhetorical questions using 难道…吗 to express disbelief or challenge an assumption. Then write one sentence giving your actual view.",
  },
  {
    hsk_level: 5,
    display_order: 10,
    title: "据说 (jùshuō) — Reportedly / It Is Said That",
    pattern: "据说 + statement (unverified claim)",
    explanation:
      "据说 introduces information that the speaker has heard but cannot personally verify, equivalent to 'reportedly', 'it is said that', or 'apparently'. It distances the speaker from direct responsibility for the claim's accuracy.",
    examples: JSON.stringify([
      { zh: "据说那家餐厅已经关门了。", pinyin: "Jùshuō nà jiā cāntīng yǐjīng guānmén le.", en: "Apparently, that restaurant has already closed." },
      { zh: "据说他要去国外发展了。", pinyin: "Jùshuō tā yào qù guówài fāzhǎn le.", en: "I've heard he's going abroad to develop his career." },
      { zh: "据说这个方法非常有效。", pinyin: "Jùshuō zhège fāngfǎ fēicháng yǒuxiào.", en: "This method is reportedly very effective." },
    ]),
    reading_passage:
      "最近办公室里流传着一些消息。据说公司下个季度要扩招，据说新办公室在市中心。大家都很兴奋，但我不敢太早高兴，因为据说的事情不一定是真的。果然，一周后公司正式宣布，据说的计划有一半并不准确。看来小道消息总要打折扣。",
    comprehension_question: "What rumors were circulating in the office, and how accurate did they turn out to be?",
    journal_prompt:
      "Write 3–4 sentences sharing things you have heard but cannot confirm. Use 据说 each time, and end with a sentence reflecting on how reliable secondhand information is.",
  },

  // ─── HSK 6 ───────────────────────────────────────────────────────────────────
  {
    hsk_level: 6,
    display_order: 1,
    title: "即使/纵然…也… — Even If…Still…",
    pattern: "即使/纵然 + hypothetical condition，也 + result",
    explanation:
      "即使/纵然…也… introduces a hypothetical or extreme condition that, even if true, would not change the outcome. More formal and written than 就算…也, 纵然 carries a literary or classical flavor.",
    examples: JSON.stringify([
      { zh: "即使失败了，也不能放弃。", pinyin: "Jíshǐ shībài le, yě bù néng fàngqì.", en: "Even if you fail, you must not give up." },
      { zh: "纵然前路艰难，我也会走下去。", pinyin: "Zòng rán qián lù jiānnán, wǒ yě huì zǒu xià qù.", en: "Even though the road ahead is difficult, I will keep going." },
      { zh: "即使你不同意，这个决定也不会改变。", pinyin: "Jíshǐ nǐ bù tóngyì, zhège juédìng yě bù huì gǎibiàn.", en: "Even if you disagree, this decision will not change." },
    ]),
    reading_passage:
      "在毕业典礼上，校长说：即使走出校门，面对再多的挫折，也要保持对学习的热情。他说，纵然社会竞争激烈，也不应该迷失自我。即使前途未明，也要有勇气走出第一步。这些话让许多同学深受鼓舞，响起了热烈的掌声。",
    comprehension_question: "What three 'even if' encouragements did the principal offer at the graduation ceremony?",
    journal_prompt:
      "Write 2–3 sentences expressing unwavering commitments or principles that hold true regardless of circumstances. Use 即使…也… or 纵然…也… for each.",
  },
  {
    hsk_level: 6,
    display_order: 2,
    title: "诚然…然而… — It Is True That…However…",
    pattern: "诚然 + conceded truth，然而 + counter-argument",
    explanation:
      "诚然…然而… is a highly formal, literary concessive structure: it genuinely and fully acknowledges a truth (stronger than 固然) before introducing a more significant counterpoint. Common in argumentation, essays, and formal speeches.",
    examples: JSON.stringify([
      { zh: "诚然，他的方案有其合理之处，然而执行难度不容忽视。", pinyin: "Chéngrán, tā de fāng'àn yǒu qí hélǐ zhī chù, rán'ér zhíxíng nándù bùróng hūshì.", en: "It is true that his proposal has its merits; however, the difficulty of implementation cannot be ignored." },
      { zh: "诚然，速度很重要，然而准确性更不可缺少。", pinyin: "Chéngrán, sùdù hěn zhòngyào, rán'ér zhǔnquèxìng gèng bùkě quēshǎo.", en: "It is certainly true that speed matters; however, accuracy is even more indispensable." },
      { zh: "诚然此路艰难，然而我们别无选择。", pinyin: "Chéngrán cǐ lù jiānnán, rán'ér wǒmen bié wú xuǎnzé.", en: "It is true this path is hard; however, we have no other choice." },
    ]),
    reading_passage:
      "关于城镇化进程，学界争论颇多。诚然，城镇化提升了经济效率，改善了基础设施，然而它也带来了环境污染和文化消失等深层问题。诚然，现代生活给人们带来了便利，然而传统社区的温情却在悄然流逝。这些矛盾值得社会认真反思。",
    comprehension_question: "What benefits and drawbacks of urbanization does the passage acknowledge?",
    journal_prompt:
      "Write a formal 3–4 sentence argument on a topic you care about. Use 诚然…然而… to concede a valid point before making your main case.",
  },
  {
    hsk_level: 6,
    display_order: 3,
    title: "一旦…就… — Once (A Happens)…Then (B Follows)…",
    pattern: "一旦 + critical event A，就 + consequence B",
    explanation:
      "一旦…就… means 'once' or 'as soon as (a critical threshold is crossed)' and highlights that B is an immediate or inevitable consequence of A. It often implies that A is a tipping point with significant ramifications, and is more formal than 一…就.",
    examples: JSON.stringify([
      { zh: "一旦养成了坏习惯，就很难改变。", pinyin: "Yīdàn yǎngchéng le huài xíguàn, jiù hěn nán gǎibiàn.", en: "Once you've formed bad habits, they are very hard to change." },
      { zh: "一旦合同签署，双方都必须遵守条款。", pinyin: "Yīdàn hétong qiānshǔ, shuāngfāng dōu bìxū zūnshǒu tiáokuǎn.", en: "Once the contract is signed, both parties must abide by its terms." },
      { zh: "一旦失去信任，就很难再重建。", pinyin: "Yīdàn shīqù xìnrèn, jiù hěn nán zài chóngjiàn.", en: "Once trust is lost, it is very hard to rebuild." },
    ]),
    reading_passage:
      "网络安全专家警告，一旦个人数据遭到泄露，后果可能是灾难性的。一旦黑客获得了你的账户信息，就可能在短时间内造成巨大的经济损失。专家建议，一旦发现账户异常，就应立刻修改密码并联系银行。预防永远比补救更重要。",
    comprehension_question: "What consequences does the cybersecurity expert warn about, and what should users do if they notice something wrong?",
    journal_prompt:
      "Write 2–3 sentences about critical thresholds or turning points — situations where crossing a line leads to inevitable consequences. Use 一旦…就… for each.",
  },
  {
    hsk_level: 6,
    display_order: 4,
    title: "凡是…都… — Whatever / Whoever / All That…",
    pattern: "凡是 + broad category N/clause，都 + universal predicate",
    explanation:
      "凡是 introduces a universal or inclusive category ('all', 'every', 'any') and 都 in the second clause asserts that the predicate applies to every member. It is more formal and emphatic than 所有 or 任何, common in regulations, principles, and formal statements.",
    examples: JSON.stringify([
      { zh: "凡是参加比赛的选手，都必须提前注册。", pinyin: "Fánshì cānjiā bǐsài de xuǎnshǒu, dōu bìxū tíqián zhùcè.", en: "All contestants participating in the competition must register in advance." },
      { zh: "凡是他说的话，我都相信。", pinyin: "Fánshì tā shuō de huà, wǒ dōu xiāngxìn.", en: "Whatever he says, I believe it." },
      { zh: "凡是有利于学习的方法，都值得尝试。", pinyin: "Fánshì yǒulì yú xuéxí de fāngfǎ, dōu zhíde chángshì.", en: "Any method that is conducive to learning is worth trying." },
    ]),
    reading_passage:
      "这家公司的创始人有一个原则：凡是员工提出的合理建议，都会认真对待。凡是涉及员工福利的决策，都必须经过全体投票。凡是违反诚信原则的行为，都会受到严肃处理。正是这样的文化，让这家公司成为行业内员工满意度最高的企业之一。",
    comprehension_question: "What three universal principles does the company founder apply?",
    journal_prompt:
      "Write 2–3 sentences expressing universal rules, values, or policies you believe in. Use 凡是…都… to state what applies to every case in a category.",
  },
  {
    hsk_level: 6,
    display_order: 5,
    title: "于 (yú) — Formal Prepositional 'At / In / To / From'",
    pattern: "Verb + 于 + noun (written/formal register)",
    explanation:
      "于 is a classical prepositional particle used in formal, literary, and written Chinese to mean 'at', 'in', 'to', 'from', or 'by'. It replaces colloquial prepositions like 在, 到, 从, 对 in formal contexts and set phrases.",
    examples: JSON.stringify([
      { zh: "他生于一九八五年，长于北京。", pinyin: "Tā shēng yú yī jiǔ bā wǔ nián, zhǎng yú Běijīng.", en: "He was born in 1985 and grew up in Beijing." },
      { zh: "这项政策有助于促进就业。", pinyin: "Zhè xiàng zhèngcè yǒuzhùyú cùjìn jiùyè.", en: "This policy is conducive to promoting employment." },
      { zh: "他对此事置若罔闻，终于付出了代价。", pinyin: "Tā duì cǐ shì zhì ruò wǎng wén, zhōngyú fùchū le dàijià.", en: "He turned a blind eye to the matter and ultimately paid the price." },
    ]),
    reading_passage:
      "鲁迅生于一八八一年，长于浙江绍兴。他毕业于日本仙台医学专门学校，后弃医从文，致力于用文学唤醒国民意识。其作品深根于中国传统文化，又批判于封建礼教。他对中国现代文学的贡献，至今仍有着深远的影响。",
    comprehension_question: "Where was Lu Xun born and educated, and what did he dedicate himself to?",
    journal_prompt:
      "Write 3–4 sentences in a formal or biographical style about a person you admire. Use 于 in at least three positions (e.g., 生于, 长于, 毕业于, 致力于).",
  },
  {
    hsk_level: 6,
    display_order: 6,
    title: "所谓 (suǒwèi) — The So-Called / What Is Known As",
    pattern: "所谓(的) + noun / concept",
    explanation:
      "所谓 means 'the so-called' or 'what is known as' and is placed before a term to either define it neutrally, question its validity, or frame it with subtle skepticism. The tone ranges from explanatory to ironic depending on context.",
    examples: JSON.stringify([
      { zh: "所谓成功，不过是坚持到最后。", pinyin: "Suǒwèi chénggōng, bùguò shì jiānchí dào zuìhòu.", en: "What we call success is nothing more than persisting to the end." },
      { zh: "这就是他所谓的「努力」吗？", pinyin: "Zhè jiùshì tā suǒwèi de 「nǔlì」 ma?", en: "Is this what he calls 'hard work'?" },
      { zh: "所谓的专家有时候并不比普通人更了解情况。", pinyin: "Suǒwèi de zhuānjiā yǒu shíhòu bìng bù bǐ pǔtōng rén gèng liǎojiě qíngkuàng.", en: "So-called experts sometimes don't understand the situation any better than ordinary people." },
    ]),
    reading_passage:
      "演讲者问台下：所谓的「舒适区」，究竟是保护我们还是限制我们？他说，所谓的安全感，有时候只是对变化的恐惧。所谓的失败，不过是通向成功的一段弯路。他希望大家重新定义那些所谓的负面标签，把它们变成成长的养分。",
    comprehension_question: "How does the speaker reframe the concepts of 'comfort zone', 'failure', and 'security'?",
    journal_prompt:
      "Write 2–3 sentences redefining or questioning a common concept or label using 所谓. You can be philosophical, critical, or redefining in tone.",
  },
  {
    hsk_level: 6,
    display_order: 7,
    title: "无非/不过是… — Nothing But / Merely",
    pattern: "Subject + 无非/不过是 + noun/clause",
    explanation:
      "无非 and 不过是 both mean 'nothing but', 'merely', or 'simply', reducing something to its most basic or unimportant essence. They are used to downplay, demystify, or dismiss, often to reassure or to challenge an inflated view.",
    examples: JSON.stringify([
      { zh: "他的成功无非是运气加上努力。", pinyin: "Tā de chénggōng wúfēi shì yùnqì jiā shàng nǔlì.", en: "His success is nothing but a combination of luck and hard work." },
      { zh: "所谓的危机，不过是一个转机。", pinyin: "Suǒwèi de wēijī, bùguò shì yī gè zhuǎnjī.", en: "The so-called crisis is merely an opportunity in disguise." },
      { zh: "他的抱怨无非是想引起注意。", pinyin: "Tā de bàoyuàn wúfēi shì xiǎng yǐnqǐ zhùyì.", en: "His complaints are nothing but a bid for attention." },
    ]),
    reading_passage:
      "心理咨询师告诉我，所谓的「完美主义」，无非是对失控的一种恐惧。那种对错误的极度焦虑，不过是内心深处缺乏安全感的表现。她说，我们追求的完美，无非是一个永远无法实现的幻象。接受不完美，才是真正的成熟。这番话让我释然了许多。",
    comprehension_question: "According to the counselor, what does perfectionism really come from?",
    journal_prompt:
      "Write 2–3 sentences that demystify or simplify something people tend to overcomplicate. Use 无非 or 不过是 to reduce it to its essential nature.",
  },
  {
    hsk_level: 6,
    display_order: 8,
    title: "莫非 (mòfēi) — Could It Be That… (Rhetorical)",
    pattern: "莫非 + speculative statement？",
    explanation:
      "莫非 forms a rhetorical question expressing suspicion, conjecture, or incredulity — 'could it be that…?', 'don't tell me…?'. It implies the speaker finds the possibility surprising or hard to believe, and expects confirmation or denial.",
    examples: JSON.stringify([
      { zh: "他到现在还没到，莫非出了什么事？", pinyin: "Tā dào xiànzài hái méi dào, mòfēi chū le shénme shì?", en: "He still hasn't arrived; could something have happened to him?" },
      { zh: "你连这个都不知道，莫非你从来不看新闻？", pinyin: "Nǐ lián zhège dōu bù zhīdào, mòfēi nǐ cónglái bù kàn xīnwén?", en: "You don't even know this — could it be you never watch the news?" },
      { zh: "莫非他已经后悔了？", pinyin: "Mòfēi tā yǐjīng hòuhuǐ le?", en: "Could it be that he already regrets it?" },
    ]),
    reading_passage:
      "好几天没收到老友的消息，我开始担心起来。莫非他生气了？上次我们聊天时，我说了一些直接的话，莫非他觉得受到了冒犯？我发了消息，他迟迟不回，莫非手机出了问题？后来他打来电话说，只是出去旅游了，没有信号。我松了一口气，笑自己想太多。",
    comprehension_question: "What three speculations does the narrator make about the friend's silence, and what is the truth?",
    journal_prompt:
      "Write 2–3 sentences using 莫非 to express suspicion, surprise, or rhetorical disbelief about a situation. Then write a sentence revealing the actual explanation.",
  },
  {
    hsk_level: 6,
    display_order: 9,
    title: "与其…不如… — Rather Than…Better To…",
    pattern: "与其 + less preferred option，不如 + preferred option",
    explanation:
      "与其…不如… presents a comparison of two options and recommends the second as superior. It is more formal than 宁可…也不 and focuses on rational preference rather than strong resolve.",
    examples: JSON.stringify([
      { zh: "与其抱怨，不如想办法解决。", pinyin: "Yǔqí bàoyuàn, bùrú xiǎng bànfǎ jiějué.", en: "Rather than complaining, it's better to think of a solution." },
      { zh: "与其让别人帮你，不如自己动手。", pinyin: "Yǔqí ràng biérén bāng nǐ, bùrú zìjǐ dòngshǒu.", en: "Rather than having others help you, it's better to do it yourself." },
      { zh: "与其花时间后悔，不如把精力放在未来。", pinyin: "Yǔqí huā shíjiān hòuhuǐ, bùrú bǎ jīnglì fàng zài wèilái.", en: "Rather than spending time on regrets, it's better to focus your energy on the future." },
    ]),
    reading_passage:
      "老师在课堂上说：与其死记硬背，不如理解原理；与其一个人苦学，不如和同学讨论；与其害怕犯错，不如大胆开口尝试。她说，语言学习的核心，与其说是掌握语法规则，不如说是建立真实的沟通能力。这番话让我重新思考了我的学习方法。",
    comprehension_question: "What four learning advice comparisons does the teacher make using 与其…不如?",
    journal_prompt:
      "Write 3–4 sentences recommending better approaches to common situations or challenges. Use 与其…不如… to contrast the suboptimal option with the preferred one.",
  },
  {
    hsk_level: 6,
    display_order: 10,
    title: "以…为… — By Treating…As… / Using…As…",
    pattern: "以 + A + 为 + B (formal: 'to regard/use A as B')",
    explanation:
      "以…为… is a formal, often literary construction meaning 'to take A as B', 'to treat A as B', or 'to use A as B'. It appears frequently in set phrases, official language, mission statements, and classical-style writing.",
    examples: JSON.stringify([
      { zh: "该公司以诚信为本，以客户为先。", pinyin: "Gāi gōngsī yǐ chéngxìn wéi běn, yǐ kèhù wéi xiān.", en: "The company takes integrity as its foundation and puts customers first." },
      { zh: "他以北京为家，在这里生活了三十年。", pinyin: "Tā yǐ Běijīng wéi jiā, zài zhèlǐ shēnghuó le sānshí nián.", en: "He has made Beijing his home and has lived here for thirty years." },
      { zh: "我们应以史为鉴，避免重蹈覆辙。", pinyin: "Wǒmen yīng yǐ shǐ wéi jiàn, bìmiǎn chóngdǎo fùzhé.", en: "We should take history as a lesson and avoid repeating past mistakes." },
    ]),
    reading_passage:
      "这所大学以培养创新人才为使命，以开放包容为校训。学校以实践为导向，鼓励学生走出课堂，以社会为课堂，以问题为驱动。建校百年来，学校始终以学术自由为核心价值，培养了一代又一代以家国为念的优秀人才。",
    comprehension_question: "What values and principles does the university hold, according to the passage?",
    journal_prompt:
      "Write 3–4 sentences in a formal style describing the values, principles, or foundations of an organization, person, or society you admire. Use 以…为… at least three times.",
  },
];
