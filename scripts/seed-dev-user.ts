/**
 * Seeds a dev user + demo content for local development.
 * Run: pnpm seed
 */
import { randomUUID } from "crypto";
import { ensureAppSchema, queryOne, withTransaction, getPool } from "../src/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const DEV_USER = {
  name: "Dev User",
  email: "dev@hanzibit.local",
  password: "password123",
};

const DEV_USER_ID = "dev-user-001";

async function seedAuthUser() {
  console.log(`Signing up dev user at ${BASE_URL}...`);
  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE_URL },
    body: JSON.stringify(DEV_USER),
  });

  if (res.ok) {
    console.log("Auth user created.");
  } else {
    const body = await res.text();
    if (body.includes("already") || res.status === 422) {
      console.log("Auth user already exists.");
    } else {
      console.warn(`Auth signup returned ${res.status} — continuing with data seed.`);
    }
  }
}

async function seedData() {
  await ensureAppSchema();

  const existing = await queryOne<{ c: number }>(
    "SELECT COUNT(*)::int AS c FROM journal_entries WHERE user_id = $1",
    [DEV_USER_ID]
  );
  if ((existing?.c ?? 0) > 0) {
    console.log("Demo data already seeded. Skipping.");
    return;
  }

  console.log("Seeding demo data...");

  await withTransaction(async (client) => {
    // --- Journal Entries (content uses [hanzi|pinyin|english] inline markup) ---
    const e1 = "entry-001";
    await client.query(
      `INSERT INTO journal_entries
       (id, user_id, title_zh, title_en, unit, hsk_level, content_zh, bookmarked, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        e1,
        DEV_USER_ID,
        "我的一天",
        "My Day",
        "Unit 4: Daily Life",
        2,
        "今天我早上七点起床。我很[累|lei4|tired]，但是我也很[高兴|gao1 xing4|happy]。\n\n八点的时候，我吃[早餐|zao3 can1|breakfast]。我喜欢喝[咖啡|ka1 fei1|coffee]。九点我开始[学习|xue2 xi2|to study]。我想练习[写字|xie3 zi4|to write characters]。",
        1,
        "2023-10-24T08:00:00",
      ]
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e1, "grammar_tip", "Grammar Tip", 'The particle "也" (yě) always comes after the subject and before the adjective/verb.']
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e1, "mnemonic", "Mnemonic", '"累" (lèi) looks like a person working in a field (田) with a burden above. No wonder they are tired!']
    );

    const e2 = "entry-002";
    await client.query(
      `INSERT INTO journal_entries
       (id, user_id, title_zh, title_en, unit, hsk_level, content_zh, bookmarked, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        e2,
        DEV_USER_ID,
        "在餐厅",
        "At the Restaurant",
        "Unit 5: Food & Drink",
        2,
        "昨天晚上我和朋友去[餐厅|can1 ting1|restaurant]吃饭。[服务员|fu2 wu4 yuan2|waiter]很热情。我吃了[鱼|yu2|fish]和[米饭|mi3 fan4|rice]。我的朋友喝了[啤酒|pi2 jiu3|beer]。\n\n[菜|cai4|dish / food]很[好吃|hao3 chi1|delicious]，我们都很[满意|man3 yi4|satisfied]。",
        0,
        "2023-10-22T19:30:00",
      ]
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e2, "grammar_tip", "Grammar Tip", '"了" after a verb indicates completed action. "我吃了鱼" = I ate fish (completed).']
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e2, "mnemonic", "Mnemonic", '"鱼" (yú) — the character looks like a fish with its tail at the bottom! The four dots are the tail fin.']
    );

    const e3 = "entry-003";
    await client.query(
      `INSERT INTO journal_entries
       (id, user_id, title_zh, title_en, unit, hsk_level, content_zh, bookmarked, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        e3,
        DEV_USER_ID,
        "我的家人",
        "My Family",
        "Unit 3: Family",
        1,
        "我的[家|jia1|home / family]有四口人。[爸爸|ba4 ba|father]、[妈妈|ma1 ma|mother]、[姐姐|jie3 jie|older sister]和我。\n\n[爸爸|ba4 ba|father]是[老师|lao3 shi1|teacher]。[妈妈|ma1 ma|mother]是[医生|yi1 sheng1|doctor]。[姐姐|jie3 jie|older sister]是[学生|xue2 sheng1|student]。我们住在北京。",
        0,
        "2023-10-20T10:00:00",
      ]
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e3, "grammar_tip", "Grammar Tip", '"有" (yǒu) means "to have". For counting family members: 我的家有四口人 = My family has 4 people. "口" is the measure word for family members.']
    );

    const e4 = "entry-004";
    await client.query(
      `INSERT INTO journal_entries
       (id, user_id, title_zh, title_en, unit, hsk_level, content_zh, bookmarked, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        e4,
        DEV_USER_ID,
        "去商店买东西",
        "Shopping",
        "Unit 6: Shopping",
        2,
        "今天下午我去[商店|shang1 dian4|shop / store]买[东西|dong1 xi|things / stuff]。我想买一件新的[衣服|yi1 fu|clothes]和一双[鞋子|xie2 zi|shoes]。\n\n那件衣服太[贵|gui4|expensive]了，我没买。但是鞋子很[便宜|pian2 yi|cheap]，我买了。我花了一百块[钱|qian2|money]。",
        0,
        "2023-10-18T14:00:00",
      ]
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e4, "grammar_tip", "Grammar Tip", '"太...了" is a pattern meaning "too...". 太贵了 = too expensive. It expresses excess.']
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e4, "mnemonic", "Mnemonic", '"贵" (guì) — the top part 中 is like a price tag and 贝 (shell) at the bottom was ancient money. Expensive = lots of shells!']
    );

    const e5 = "entry-005";
    await client.query(
      `INSERT INTO journal_entries
       (id, user_id, title_zh, title_en, unit, hsk_level, content_zh, bookmarked, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        e5,
        DEV_USER_ID,
        "天气怎么样",
        "How's the Weather",
        "Unit 7: Weather",
        2,
        "今天的[天气|tian1 qi4|weather]很好。外面很[暖和|nuan3 huo|warm]，没有[风|feng1|wind]。天空很蓝。\n\n但是明天会[下雨|xia4 yu3|to rain]。我需要带[雨伞|yu3 san3|umbrella]。我不喜欢下雨天，因为很[冷|leng3|cold]。",
        0,
        "2023-10-15T09:00:00",
      ]
    );
    await client.query(
      "INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), e5, "grammar_tip", "Grammar Tip", '"会" (huì) before a verb indicates future likelihood: 明天会下雨 = It will rain tomorrow.']
    );

    // --- Vocabulary ---
    const vocabItems = [
      ["你好", "nǐ hǎo", "hello", 1, "greetings", 95, "2023-10-23"],
      ["谢谢", "xièxie", "thank you", 1, "greetings", 90, "2023-10-23"],
      ["再见", "zàijiàn", "goodbye", 1, "greetings", 88, "2023-10-22"],
      ["学习", "xuéxí", "to study", 1, "verbs", 75, "2023-10-24"],
      ["写字", "xiězì", "to write characters", 2, "verbs", 60, "2023-10-24"],
      ["起床", "qǐchuáng", "to get up", 2, "daily life", 70, "2023-10-24"],
      ["早餐", "zǎocān", "breakfast", 2, "food", 65, "2023-10-24"],
      ["咖啡", "kāfēi", "coffee", 2, "food", 80, "2023-10-24"],
      ["累", "lèi", "tired", 2, "adjectives", 55, "2023-10-24"],
      ["高兴", "gāoxìng", "happy", 1, "adjectives", 85, "2023-10-24"],
      ["漂亮", "piàoliang", "beautiful", 1, "adjectives", 82, "2023-10-21"],
      ["餐厅", "cāntīng", "restaurant", 2, "places", 45, "2023-10-22"],
      ["医生", "yīshēng", "doctor", 1, "professions", 78, "2023-10-20"],
      ["老师", "lǎoshī", "teacher", 1, "professions", 92, "2023-10-20"],
      ["学生", "xuéshēng", "student", 1, "professions", 90, "2023-10-20"],
      ["商店", "shāngdiàn", "shop / store", 2, "places", 50, "2023-10-18"],
      ["衣服", "yīfu", "clothes", 2, "shopping", 55, "2023-10-18"],
      ["天气", "tiānqì", "weather", 1, "nature", 72, "2023-10-15"],
      ["下雨", "xiàyǔ", "to rain", 2, "nature", 40, "2023-10-15"],
      ["电脑", "diànnǎo", "computer", 2, "technology", 68, "2023-10-14"],
      ["手机", "shǒujī", "cell phone", 2, "technology", 75, "2023-10-14"],
      ["朋友", "péngyou", "friend", 1, "people", 93, "2023-10-13"],
      ["家", "jiā", "home / family", 1, "family", 96, "2023-10-12"],
      ["钱", "qián", "money", 2, "shopping", 62, "2023-10-18"],
      ["好吃", "hǎochī", "delicious", 2, "food", 73, "2023-10-22"],
    ];

    for (const [ch, py, mn, lvl, cat, mastery, reviewed] of vocabItems) {
      await client.query(
        `INSERT INTO vocabulary
         (id, user_id, character_zh, pinyin, meaning, hsk_level, category, mastery, created_at, last_reviewed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [randomUUID(), DEV_USER_ID, ch, py, mn, lvl, cat, mastery, "2023-10-01", reviewed]
      );
    }

    // --- Grammar Points ---
    const grammarItems = [
      // --- HSK 1 ---
      ["Subject + 是 + Noun", "A 是 B", "The verb 是 (shì) acts like \"to be\" in English. It links a subject to a noun, never an adjective.",
        JSON.stringify(["我是学生。 (I am a student.)", "他是老师。 (He is a teacher.)", "这是我的书。 (This is my book.)"]), 1],
      ["Negation with 不", "Subject + 不 + Verb/Adj", "不 (bù) is placed before a verb or adjective to negate it. It changes to bú before 4th tone.",
        JSON.stringify(["我不喝咖啡。 (I don't drink coffee.)", "他不高兴。 (He is not happy.)", "这个不贵。 (This is not expensive.)"]), 1],
      ["The 也 particle", "Subject + 也 + Verb/Adj", "也 (yě) means \"also/too\". It always comes after the subject and before the verb or adjective. Never at the end of a sentence.",
        JSON.stringify(["我也是学生。 (I am also a student.)", "她也很高兴。 (She is also happy.)", "我也喜欢咖啡。 (I also like coffee.)"]), 1],
      ["Measure words with 个", "Number + 个 + Noun", "个 (gè) is the most common measure word. Used between a number and a noun when no specific measure word applies.",
        JSON.stringify(["三个人 (three people)", "两个朋友 (two friends)", "一个苹果 (one apple)"]), 1],
      ["的 possessive particle", "Noun/Pronoun + 的 + Noun", "的 (de) indicates possession, like \"'s\" in English. Can be dropped between close relationships.",
        JSON.stringify(["我的书 (my book)", "他的老师 (his teacher)", "妈妈的手机 (mom's phone)"]), 1],

      // --- HSK 2 ---
      ["Using 了 for completed actions", "Verb + 了", "了 (le) after a verb indicates the action is completed. It does not indicate past tense — it marks completion.",
        JSON.stringify(["我吃了早餐。 (I ate breakfast.)", "他买了一件衣服。 (He bought a piece of clothing.)", "我们去了商店。 (We went to the store.)"]), 2],
      ["太...了 pattern", "太 + Adj + 了", "太...了 expresses \"too much\" of something. Often implies a complaint or strong feeling.",
        JSON.stringify(["这件衣服太贵了！ (This piece of clothing is too expensive!)", "今天太冷了。 (Today is too cold.)", "他太累了。 (He is too tired.)"]), 2],
      ["会 for future actions", "Subject + 会 + Verb", "会 (huì) before a verb expresses future likelihood or ability learned through study.",
        JSON.stringify(["明天会下雨。 (It will rain tomorrow.)", "我会说中文。 (I can speak Chinese.)", "他会来吗？ (Will he come?)"]), 2],
      ["正在 for ongoing actions", "Subject + 正在 + Verb", "正在 (zhèngzài) indicates an action in progress, like English \"-ing\". 在 alone also works.",
        JSON.stringify(["我正在学习。 (I am studying.)", "他在吃饭。 (He is eating.)", "妈妈正在做饭。 (Mom is cooking.)"]), 2],
      ["要 for wanting and future", "Subject + 要 + Verb", "要 (yào) expresses desire (\"want to\") or near-future intention (\"going to\"). Context determines meaning.",
        JSON.stringify(["我要喝水。 (I want to drink water.)", "他要去北京。 (He is going to Beijing.)", "你要什么？ (What do you want?)"]), 2],

      // --- HSK 3 ---
      ["把 construction", "Subject + 把 + Object + Verb + Complement", "把 (bǎ) moves the object before the verb to emphasize what happens to it. The verb must have a result or direction.",
        JSON.stringify(["请你把门关上。 (Please close the door.)", "他把书放在桌子上。 (He put the book on the table.)", "我把作业做完了。 (I finished the homework.)"]), 3],
      ["被 passive construction", "Subject + 被 + (Agent) + Verb", "被 (bèi) marks the passive voice. The subject receives the action. Often implies something unpleasant.",
        JSON.stringify(["我的手机被偷了。 (My phone was stolen.)", "蛋糕被他吃了。 (The cake was eaten by him.)", "那本书被借走了。 (That book was borrowed away.)"]), 3],
      ["Complement of degree 得", "Verb + 得 + Adj/Description", "得 (de) links a verb to a description of how the action is performed. Indicates degree or manner.",
        JSON.stringify(["他跑得很快。 (He runs very fast.)", "你说得很好。 (You speak very well.)", "她唱得非常好听。 (She sings very beautifully.)"]), 3],
      ["比 for comparisons", "A + 比 + B + Adj", "比 (bǐ) makes direct comparisons between two things. The adjective is never preceded by 很.",
        JSON.stringify(["他比我高。 (He is taller than me.)", "今天比昨天冷。 (Today is colder than yesterday.)", "中文比英文难。 (Chinese is harder than English.)"]), 3],
      ["越来越 for increasing degree", "越来越 + Adj/Verb", "越来越 (yuè lái yuè) expresses that something is becoming more and more of a quality over time.",
        JSON.stringify(["天气越来越冷了。 (The weather is getting colder and colder.)", "他的中文越来越好。 (His Chinese is getting better and better.)", "我越来越喜欢这个城市。 (I like this city more and more.)"]), 3],
      ["虽然...但是 concession", "虽然 + A，但是 + B", "虽然...但是 (suīrán...dànshì) means \"although...but\". Chinese uses both parts, unlike English which drops \"but\".",
        JSON.stringify(["虽然很累，但是我很高兴。 (Although tired, I am happy.)", "虽然贵，但是质量很好。 (Although expensive, the quality is good.)", "虽然他不会中文，但是他想学。 (Although he can't speak Chinese, he wants to learn.)"]), 3],
      ["因为...所以 cause and effect", "因为 + Cause，所以 + Result", "因为...所以 (yīnwèi...suǒyǐ) means \"because...therefore\". Both parts are usually present in Chinese.",
        JSON.stringify(["因为下雨，所以我带了伞。 (Because it rained, I brought an umbrella.)", "因为太贵了，所以我没买。 (Because it was too expensive, I didn't buy it.)", "因为他生病了，所以没来上课。 (Because he was sick, he didn't come to class.)"]), 3],

      // --- HSK 4 ---
      ["Resultative complements", "Verb + Result Complement", "A result complement (结果补语) follows a verb to indicate the outcome. Common ones: 完 (finish), 到 (achieve), 好 (properly), 错 (wrongly).",
        JSON.stringify(["我看完了这本书。 (I finished reading this book.)", "你听到了吗？ (Did you hear it?)", "作业做好了。 (The homework is done properly.)", "你写错了。 (You wrote it wrong.)"]), 4],
      ["Directional complements", "Verb + Direction (来/去/上/下/进/出/回/过)", "Directional complements indicate the direction of an action. 来 = toward speaker, 去 = away from speaker. Can combine: 上来, 下去, etc.",
        JSON.stringify(["请进来！ (Please come in!)", "他跑出去了。 (He ran out.)", "把箱子搬上来。 (Carry the box up here.)", "孩子们跑回去了。 (The children ran back.)"]), 4],
      ["连...都/也 emphasis", "连 + Extreme Case + 都/也 + Verb", "连...都/也 (lián...dōu/yě) means \"even\". Emphasizes something surprising or extreme.",
        JSON.stringify(["他连自己的名字都不会写。 (He can't even write his own name.)", "连小孩子都知道。 (Even children know this.)", "我连一块钱也没有。 (I don't even have one yuan.)"]), 4],
      ["除了...以外 exception/addition", "除了 + A + 以外，都/还 + B", "除了...以外 (chúle...yǐwài) means \"besides\" or \"except\". With 都 = \"except\"; with 还 = \"in addition to\".",
        JSON.stringify(["除了他以外，大家都来了。 (Everyone came except him.)", "除了中文以外，他还会说法语。 (Besides Chinese, he can also speak French.)", "除了周末以外，我每天都上班。 (I work every day except weekends.)"]), 4],
      ["不但...而且 progression", "不但 + A，而且 + B", "不但...而且 (bùdàn...érqiě) means \"not only...but also\". Expresses that the second point adds to or exceeds the first.",
        JSON.stringify(["他不但聪明，而且很努力。 (He is not only smart, but also very hardworking.)", "这个地方不但漂亮，而且安静。 (This place is not only beautiful, but also quiet.)", "她不但会唱歌，而且会跳舞。 (She can not only sing, but also dance.)"]), 4],
      ["Potential complement 得/不", "Verb + 得/不 + Result", "Inserting 得 or 不 between a verb and its complement expresses ability (can/can't achieve the result).",
        JSON.stringify(["我看得见。 (I can see it.)", "他听不懂。 (He can't understand by listening.)", "这个字我写得出来。 (I can write this character.)", "吃不完。 (Can't finish eating.)"]), 4],
      ["如果...就 conditional", "如果 + Condition，就 + Result", "如果...就 (rúguǒ...jiù) means \"if...then\". 如果 can be dropped in casual speech; 就 often remains.",
        JSON.stringify(["如果明天下雨，我就不去了。 (If it rains tomorrow, I won't go.)", "你如果不想吃，就别吃了。 (If you don't want to eat, then don't.)", "如果有时间，我就去看看。 (If I have time, I'll go take a look.)"]), 4],

      // --- HSK 5 ---
      ["是...的 emphasis construction", "是 + Emphasized Detail + 的", "是...的 (shì...de) emphasizes the time, place, manner, or agent of a past action. The action itself is known; 是...的 highlights a detail about it.",
        JSON.stringify(["我是在北京学的中文。 (It was in Beijing that I learned Chinese.)", "她是坐飞机来的。 (She came by plane.)", "这本书是谁写的？ (Who wrote this book?)"]), 5],
      ["Verb + 着 continuous state", "Verb + 着", "着 (zhe) after a verb indicates a continuous or ongoing state (not action). It describes how something remains.",
        JSON.stringify(["门开着。 (The door is open.)", "他站着说话。 (He speaks standing.)", "墙上挂着一幅画。 (A painting hangs on the wall.)", "她笑着说。 (She said with a smile.)"]), 5],
      ["既...又 dual qualities", "既 + A，又 + B", "既...又 (jì...yòu) means \"both A and B\". Used for two positive or two negative qualities of the same subject.",
        JSON.stringify(["她既聪明又漂亮。 (She is both smart and beautiful.)", "这个房间既大又亮。 (This room is both big and bright.)", "学中文既有趣又有用。 (Learning Chinese is both interesting and useful.)"]), 5],
      ["无论...都 unconditional", "无论 + Question Word/Choice，都 + Result", "无论...都 (wúlùn...dōu) means \"no matter what/how\". Expresses that the result holds regardless of the condition.",
        JSON.stringify(["无论多难，我都要学会。 (No matter how hard, I will learn it.)", "无论你去哪儿，我都跟你去。 (No matter where you go, I'll go with you.)", "无论天气怎么样，他都跑步。 (No matter the weather, he runs.)"]), 5],
      ["不是...而是 correction", "不是 + A，而是 + B", "不是...而是 (bùshì...érshì) means \"it's not A, but rather B\". Used to correct a misunderstanding or clarify.",
        JSON.stringify(["我不是不想去，而是没时间。 (It's not that I don't want to go, but that I don't have time.)", "这不是他的错，而是我的错。 (This isn't his mistake, but mine.)", "重要的不是结果，而是过程。 (What matters isn't the result, but the process.)"]), 5],
      ["以 for purpose or basis", "以 + Noun/Verb + 为/来", "以 (yǐ) is a literary preposition meaning \"using/with/by means of\". Common in set phrases and formal writing.",
        JSON.stringify(["以后再说吧。 (Let's talk about it later.)", "以学生为中心。 (Student-centered.)", "他以教书为生。 (He makes a living by teaching.)"]), 5],
      ["越...越 correlation", "越 + A，越 + B", "越...越 (yuè...yuè) means \"the more A, the more B\". Expresses a proportional relationship between two changes.",
        JSON.stringify(["越学越有意思。 (The more you study, the more interesting it gets.)", "雨越下越大。 (The rain is getting heavier and heavier.)", "他越想越生气。 (The more he thought about it, the angrier he got.)"]), 5],

      // --- HSK 6 ---
      ["以至于 consequence", "Cause + 以至于 + (Extreme) Result", "以至于 (yǐzhìyú) introduces an extreme or unexpected consequence. Meaning: \"to the extent that / so much so that\".",
        JSON.stringify(["他太忙了，以至于忘了吃饭。 (He was so busy that he forgot to eat.)", "问题严重以至于不能忽视。 (The problem was so serious it couldn't be ignored.)", "她紧张以至于说不出话来。 (She was so nervous she couldn't speak.)"]), 6],
      ["与其...不如 preference", "与其 + A，不如 + B", "与其...不如 (yǔqí...bùrú) means \"rather than A, it's better to B\". Expresses a preference after comparing two options.",
        JSON.stringify(["与其在家看电视，不如出去走走。 (Rather than watching TV at home, it's better to go for a walk.)", "与其抱怨，不如行动。 (Rather than complaining, better to take action.)", "与其等他，不如我们先走。 (Rather than waiting for him, let's go first.)"]), 6],
      ["非...不可 emphatic must", "非 + Verb + 不可", "非...不可 (fēi...bùkě) means \"absolutely must\" or \"nothing less than\". Strong emphatic expression of necessity.",
        JSON.stringify(["这件事非做不可。 (This must be done no matter what.)", "他非要去不可。 (He absolutely insists on going.)", "这个问题非解决不可。 (This problem absolutely must be resolved.)"]), 6],
      ["何况 let alone", "A + 何况 + B", "何况 (hékuàng) means \"let alone / much less / not to mention\". Argues that if A is true, B is even more so.",
        JSON.stringify(["大人都做不到，何况孩子？ (Even adults can't do it, let alone children?)", "我连中文都不会，何况日语。 (I can't even speak Chinese, let alone Japanese.)", "平时都很忙，何况是节假日。 (Usually it's busy, not to mention holidays.)"]), 6],
      ["尽管...还是 concession", "尽管 + Concession，还是 + Result", "尽管 (jǐnguǎn) means \"despite / even though\". Stronger than 虽然. The result clause often uses 还是 (still) or 却 (yet).",
        JSON.stringify(["尽管很累，他还是坚持跑完了。 (Despite being tired, he still persisted and finished running.)", "尽管我反对，他还是去了。 (Even though I objected, he still went.)", "尽管条件不好，成绩却很优秀。 (Despite poor conditions, the results were excellent.)"]), 6],
      ["之所以...是因为 reason emphasis", "之所以 + Result，是因为 + Cause", "之所以...是因为 (zhīsuǒyǐ...shì yīnwèi) means \"the reason why...is because\". Inverts cause-effect for emphasis on the reason.",
        JSON.stringify(["他之所以成功，是因为他很努力。 (The reason he succeeded is because he worked hard.)", "我之所以迟到，是因为堵车了。 (The reason I was late is because of traffic.)", "之所以这么做，是因为没有别的办法。 (The reason for doing this is there's no other way.)"]), 6],
      ["不免 unavoidably", "Situation + 不免 + Result", "不免 (bùmiǎn) means \"unavoidably / can't help but\". Indicates a natural or expected reaction to a situation.",
        JSON.stringify(["一个人在外面，不免会想家。 (Being alone abroad, you can't help but feel homesick.)", "第一次做，不免有些紧张。 (Doing it for the first time, some nervousness is unavoidable.)", "听到这个消息，他不免有些失望。 (Hearing this news, he unavoidably felt some disappointment.)"]), 6],
    ];

    for (const [title, pattern, explanation, examples, level] of grammarItems) {
      await client.query(
        `INSERT INTO grammar_points
         (id, user_id, title, pattern, explanation, examples, hsk_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), DEV_USER_ID, title, pattern, explanation, examples, level]
      );
    }

    // --- Flashcards ---
    const flashcardItems = [
      ["你好", "nǐ hǎo — hello", "HSK 1", "2023-10-26", 3, 5],
      ["谢谢", "xièxie — thank you", "HSK 1", "2023-10-25", 2, 4],
      ["学习", "xuéxí — to study", "HSK 1", "2023-10-25", 2, 3],
      ["累", "lèi — tired", "HSK 2", "2023-10-24", 1, 1],
      ["高兴", "gāoxìng — happy", "HSK 1", "2023-10-26", 3, 4],
      ["餐厅", "cāntīng — restaurant", "HSK 2", "2023-10-24", 1, 2],
      ["服务员", "fúwùyuán — waiter", "HSK 2", "2023-10-24", 1, 1],
      ["天气", "tiānqì — weather", "HSK 1", "2023-10-25", 1, 2],
      ["便宜", "piányi — cheap", "HSK 2", "2023-10-25", 1, 2],
      ["医生", "yīshēng — doctor", "HSK 1", "2023-10-27", 4, 6],
      ["好吃", "hǎochī — delicious", "HSK 2", "2023-10-24", 1, 1],
      ["下雨", "xiàyǔ — to rain", "HSK 2", "2023-10-24", 1, 0],
    ];

    for (const [front, back, deck, nextReview, interval, reviews] of flashcardItems) {
      await client.query(
        `INSERT INTO flashcards
         (id, user_id, front, back, deck, next_review, interval_days, review_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [randomUUID(), DEV_USER_ID, front, back, deck, nextReview, interval, reviews]
      );
    }

    // --- Lessons ---
    const lessonItems = [
      ["lesson-01", "Greetings & Introductions", "Unit 1: Basics", 1, "Learn to say hello, introduce yourself, and basic pleasantries.",
        "In this lesson you will learn the most fundamental Chinese greetings and how to introduce yourself.\n\nKey phrases: 你好 (hello), 我叫... (my name is...), 你叫什么名字？ (what is your name?), 很高兴认识你 (nice to meet you).", 1],
      ["lesson-02", "Numbers & Counting", "Unit 1: Basics", 1, "Master numbers 1-100 and basic counting.",
        "Chinese numbers follow a very logical system. Once you know 1-10, you can construct any number up to 99.\n\n一 (1), 二 (2), 三 (3), 四 (4), 五 (5), 六 (6), 七 (7), 八 (8), 九 (9), 十 (10).", 2],
      ["lesson-03", "Time & Dates", "Unit 2: Time", 1, "Tell time, days of the week, and dates.",
        "Time in Chinese uses a straightforward number + 点 (diǎn) pattern.\n\n七点 = 7 o'clock, 八点半 = 8:30, 现在几点？ = What time is it now?", 3],
      ["lesson-04", "Family Members", "Unit 3: Family", 1, "Learn vocabulary for family relationships.",
        "Chinese has specific words for family members based on whether they are on the mother's or father's side.\n\nBasic: 爸爸 (father), 妈妈 (mother), 哥哥 (older brother), 姐姐 (older sister).", 4],
      ["lesson-05", "Daily Routines", "Unit 4: Daily Life", 2, "Describe your daily activities and schedule.",
        "Talk about what you do every day using time words and action verbs.\n\n起床 (get up), 吃早餐 (eat breakfast), 上班 (go to work), 学习 (study), 睡觉 (sleep).", 5],
      ["lesson-06", "Food & Ordering", "Unit 5: Food & Drink", 2, "Order food at a restaurant and describe tastes.",
        "Essential vocabulary for eating out. Learn to order, describe food, and express preferences.\n\n我要... (I want...), 好吃 (delicious), 菜单 (menu), 买单 (check please).", 6],
      ["lesson-07", "Shopping & Prices", "Unit 6: Shopping", 2, "Buy things, ask prices, and bargain.",
        "Learn to navigate shops and markets in Chinese.\n\n多少钱？ (How much?), 太贵了 (too expensive), 便宜一点 (a bit cheaper), 我买了 (I'll buy it).", 7],
      ["lesson-08", "Weather & Seasons", "Unit 7: Weather", 2, "Describe weather conditions and seasons.",
        "Talk about the weather and plan activities based on conditions.\n\n天气怎么样？ (How's the weather?), 下雨 (raining), 晴天 (sunny), 冷/热 (cold/hot).", 8],
    ];

    for (const [id, title, unit, level, desc, content, order] of lessonItems) {
      await client.query(
        `INSERT INTO lessons
         (id, title, unit, hsk_level, description, content, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, title, unit, level, desc, content, order]
      );
    }

    // --- Review History ---
    const reviews = [
      ["vocabulary", "v1", "你好 — hello", 5, "2023-10-24T10:00:00"],
      ["vocabulary", "v2", "谢谢 — thank you", 4, "2023-10-24T10:01:00"],
      ["flashcard", "f1", "累 — tired", 3, "2023-10-24T10:05:00"],
      ["grammar", "g1", "也 particle usage", 4, "2023-10-24T10:10:00"],
      ["vocabulary", "v3", "餐厅 — restaurant", 2, "2023-10-23T09:00:00"],
      ["flashcard", "f2", "高兴 — happy", 5, "2023-10-23T09:05:00"],
      ["vocabulary", "v4", "学习 — to study", 4, "2023-10-23T09:10:00"],
      ["grammar", "g2", "了 completed action", 3, "2023-10-22T15:00:00"],
      ["flashcard", "f3", "天气 — weather", 3, "2023-10-22T15:05:00"],
      ["vocabulary", "v5", "衣服 — clothes", 2, "2023-10-22T15:10:00"],
      ["vocabulary", "v6", "好吃 — delicious", 4, "2023-10-21T11:00:00"],
      ["flashcard", "f4", "医生 — doctor", 5, "2023-10-21T11:05:00"],
      ["grammar", "g3", "太...了 pattern", 4, "2023-10-20T16:00:00"],
      ["vocabulary", "v7", "朋友 — friend", 5, "2023-10-20T16:05:00"],
      ["flashcard", "f5", "便宜 — cheap", 3, "2023-10-19T10:00:00"],
    ];

    for (const [type, itemId, label, score, reviewedAt] of reviews) {
      await client.query(
        `INSERT INTO review_history
         (id, user_id, item_type, item_id, item_label, score, reviewed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), DEV_USER_ID, type, itemId, label, score, reviewedAt]
      );
    }
  });
  console.log("Demo data seeded successfully!");
  console.log(`  5 journal entries with inline vocabulary markup & annotations`);
  console.log(`  25 vocabulary items across HSK 1-2`);
  console.log(`  36 grammar points across HSK 1-6`);
  console.log(`  12 flashcards`);
  console.log(`  8 lessons`);
  console.log(`  15 review history records`);
}

async function main() {
  try {
    await seedAuthUser();
  } catch {
    console.log("Could not reach auth server — seed data only.");
  }
  await seedData();
  console.log(`\nDev credentials:`);
  console.log(`  Email:    ${DEV_USER.email}`);
  console.log(`  Password: ${DEV_USER.password}`);
  console.log(`\nSign in at: ${BASE_URL}/auth/signin`);
  await getPool().end();
}

main().catch(async (error) => {
  console.error(error);
  await getPool().end().catch(() => undefined);
  process.exit(1);
});
