/**
 * Seeds a dev user + demo content for local development.
 * Run: pnpm seed
 */
import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DB_PATH = path.join(process.cwd(), "sqlite.db");

const DEV_USER = {
  name: "Dev User",
  email: "dev@chinese-notebook.local",
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

function seedData() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Create tables (same schema as lib/db.ts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title_zh TEXT NOT NULL, title_en TEXT NOT NULL,
      unit TEXT, hsk_level INTEGER DEFAULT 1, content_zh TEXT NOT NULL, bookmarked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS entry_highlights (
      id TEXT PRIMARY KEY, entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      character_zh TEXT NOT NULL, pinyin TEXT, meaning TEXT
    );
    CREATE TABLE IF NOT EXISTS entry_annotations (
      id TEXT PRIMARY KEY, entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('grammar_tip', 'mnemonic')), title TEXT NOT NULL, content TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vocabulary (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, character_zh TEXT NOT NULL, pinyin TEXT NOT NULL,
      meaning TEXT NOT NULL, hsk_level INTEGER DEFAULT 1, category TEXT DEFAULT 'general',
      mastery INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), last_reviewed TEXT
    );
    CREATE TABLE IF NOT EXISTS grammar_points (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, pattern TEXT,
      explanation TEXT NOT NULL, examples TEXT NOT NULL DEFAULT '[]', hsk_level INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, front TEXT NOT NULL, back TEXT NOT NULL,
      deck TEXT DEFAULT 'general', next_review TEXT DEFAULT (datetime('now')),
      interval_days INTEGER DEFAULT 1, ease_factor REAL DEFAULT 2.5, review_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, unit TEXT NOT NULL, hsk_level INTEGER DEFAULT 1,
      description TEXT, content TEXT NOT NULL DEFAULT '', sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS review_history (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('vocabulary', 'flashcard', 'grammar')),
      item_id TEXT NOT NULL, item_label TEXT NOT NULL, score INTEGER CHECK(score BETWEEN 1 AND 5),
      reviewed_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Check if already seeded
  const existing = db.prepare("SELECT COUNT(*) as c FROM journal_entries WHERE user_id = ?").get(DEV_USER_ID) as { c: number };
  if (existing.c > 0) {
    console.log("Demo data already seeded. Skipping.");
    db.close();
    return;
  }

  console.log("Seeding demo data...");

  const insertEntry = db.prepare("INSERT INTO journal_entries (id, user_id, title_zh, title_en, unit, hsk_level, content_zh, bookmarked, created_at) VALUES (?,?,?,?,?,?,?,?,?)");
  const insertHighlight = db.prepare("INSERT INTO entry_highlights (id, entry_id, character_zh, pinyin, meaning) VALUES (?,?,?,?,?)");
  const insertAnnotation = db.prepare("INSERT INTO entry_annotations (id, entry_id, type, title, content) VALUES (?,?,?,?,?)");
  const insertVocab = db.prepare("INSERT INTO vocabulary (id, user_id, character_zh, pinyin, meaning, hsk_level, category, mastery, created_at, last_reviewed) VALUES (?,?,?,?,?,?,?,?,?,?)");
  const insertGrammar = db.prepare("INSERT INTO grammar_points (id, user_id, title, pattern, explanation, examples, hsk_level) VALUES (?,?,?,?,?,?,?)");
  const insertFlashcard = db.prepare("INSERT INTO flashcards (id, user_id, front, back, deck, next_review, interval_days, review_count) VALUES (?,?,?,?,?,?,?,?)");
  const insertLesson = db.prepare("INSERT INTO lessons (id, title, unit, hsk_level, description, content, sort_order) VALUES (?,?,?,?,?,?,?)");
  const insertReview = db.prepare("INSERT INTO review_history (id, user_id, item_type, item_id, item_label, score, reviewed_at) VALUES (?,?,?,?,?,?,?)");

  const seed = db.transaction(() => {
    // --- Journal Entries ---
    const e1 = "entry-001";
    insertEntry.run(e1, DEV_USER_ID, "我的一天", "My Day", "Unit 4: Daily Life", 2,
      "今天 我 早上 七点 起床。 我很 累，但是我也 很 高兴。\n\n八点的时候，我吃 早餐。 我喜欢喝 咖啡。 九点我开始 学习。 我想练习 写字。",
      1, "2023-10-24T08:00:00");
    insertHighlight.run(randomUUID(), e1, "累", "lèi", "tired");
    insertHighlight.run(randomUUID(), e1, "高兴", "gāoxìng", "happy");
    insertHighlight.run(randomUUID(), e1, "早餐", "zǎocān", "breakfast");
    insertHighlight.run(randomUUID(), e1, "咖啡", "kāfēi", "coffee");
    insertHighlight.run(randomUUID(), e1, "学习", "xuéxí", "to study");
    insertHighlight.run(randomUUID(), e1, "写字", "xiězì", "to write characters");
    insertAnnotation.run(randomUUID(), e1, "grammar_tip", "Grammar Tip",
      'The particle "也" (yě) always comes after the subject and before the adjective/verb.');
    insertAnnotation.run(randomUUID(), e1, "mnemonic", "Mnemonic",
      '"累" (lèi) looks like a person working in a field (田) with a burden above. No wonder they are tired!');

    const e2 = "entry-002";
    insertEntry.run(e2, DEV_USER_ID, "在餐厅", "At the Restaurant", "Unit 5: Food & Drink", 2,
      "昨天晚上我和朋友去 餐厅 吃饭。 我们点了很多 菜。 服务员 很热情。\n\n我吃了 鱼 和 米饭。 我的朋友喝了 啤酒。 菜很 好吃，我们都很 满意。",
      0, "2023-10-22T19:30:00");
    insertHighlight.run(randomUUID(), e2, "餐厅", "cāntīng", "restaurant");
    insertHighlight.run(randomUUID(), e2, "菜", "cài", "dish / food");
    insertHighlight.run(randomUUID(), e2, "服务员", "fúwùyuán", "waiter");
    insertHighlight.run(randomUUID(), e2, "鱼", "yú", "fish");
    insertHighlight.run(randomUUID(), e2, "米饭", "mǐfàn", "rice");
    insertHighlight.run(randomUUID(), e2, "啤酒", "píjiǔ", "beer");
    insertHighlight.run(randomUUID(), e2, "好吃", "hǎochī", "delicious");
    insertHighlight.run(randomUUID(), e2, "满意", "mǎnyì", "satisfied");
    insertAnnotation.run(randomUUID(), e2, "grammar_tip", "Grammar Tip",
      '"了" after a verb indicates completed action. "我吃了鱼" = I ate fish (completed).');
    insertAnnotation.run(randomUUID(), e2, "mnemonic", "Mnemonic",
      '"鱼" (yú) — the character looks like a fish with its tail at the bottom! The four dots are the tail fin.');

    const e3 = "entry-003";
    insertEntry.run(e3, DEV_USER_ID, "我的家人", "My Family", "Unit 3: Family", 1,
      "我的 家 有四口人。 爸爸、妈妈、姐姐 和我。\n\n爸爸 是 老师。 妈妈 是 医生。 姐姐 是 学生。 我们住在 北京。",
      0, "2023-10-20T10:00:00");
    insertHighlight.run(randomUUID(), e3, "家", "jiā", "home / family");
    insertHighlight.run(randomUUID(), e3, "爸爸", "bàba", "father");
    insertHighlight.run(randomUUID(), e3, "妈妈", "māma", "mother");
    insertHighlight.run(randomUUID(), e3, "姐姐", "jiějie", "older sister");
    insertHighlight.run(randomUUID(), e3, "老师", "lǎoshī", "teacher");
    insertHighlight.run(randomUUID(), e3, "医生", "yīshēng", "doctor");
    insertHighlight.run(randomUUID(), e3, "学生", "xuéshēng", "student");
    insertAnnotation.run(randomUUID(), e3, "grammar_tip", "Grammar Tip",
      '"有" (yǒu) means "to have". For counting family members: 我的家有四口人 = My family has 4 people. "口" is the measure word for family members.');

    const e4 = "entry-004";
    insertEntry.run(e4, DEV_USER_ID, "去商店买东西", "Shopping", "Unit 6: Shopping", 2,
      "今天下午我去 商店 买 东西。 我想买一件新的 衣服 和一双 鞋子。\n\n那件衣服太 贵 了，我没买。 但是鞋子很 便宜，我买了。 我花了一百块 钱。",
      0, "2023-10-18T14:00:00");
    insertHighlight.run(randomUUID(), e4, "商店", "shāngdiàn", "shop / store");
    insertHighlight.run(randomUUID(), e4, "东西", "dōngxi", "things / stuff");
    insertHighlight.run(randomUUID(), e4, "衣服", "yīfu", "clothes");
    insertHighlight.run(randomUUID(), e4, "鞋子", "xiézi", "shoes");
    insertHighlight.run(randomUUID(), e4, "贵", "guì", "expensive");
    insertHighlight.run(randomUUID(), e4, "便宜", "piányi", "cheap");
    insertHighlight.run(randomUUID(), e4, "钱", "qián", "money");
    insertAnnotation.run(randomUUID(), e4, "grammar_tip", "Grammar Tip",
      '"太...了" is a pattern meaning "too...". 太贵了 = too expensive. It expresses excess.');
    insertAnnotation.run(randomUUID(), e4, "mnemonic", "Mnemonic",
      '"贵" (guì) — the top part 中 is like a price tag and 贝 (shell) at the bottom was ancient money. Expensive = lots of shells!');

    const e5 = "entry-005";
    insertEntry.run(e5, DEV_USER_ID, "天气怎么样", "How's the Weather", "Unit 7: Weather", 2,
      "今天的 天气 很好。 外面很 暖和，没有 风。 天空很 蓝。\n\n但是明天会 下雨。 我需要带 雨伞。 我不喜欢下雨天，因为很 冷。",
      0, "2023-10-15T09:00:00");
    insertHighlight.run(randomUUID(), e5, "天气", "tiānqì", "weather");
    insertHighlight.run(randomUUID(), e5, "暖和", "nuǎnhuo", "warm");
    insertHighlight.run(randomUUID(), e5, "风", "fēng", "wind");
    insertHighlight.run(randomUUID(), e5, "下雨", "xiàyǔ", "to rain");
    insertHighlight.run(randomUUID(), e5, "雨伞", "yǔsǎn", "umbrella");
    insertHighlight.run(randomUUID(), e5, "冷", "lěng", "cold");
    insertAnnotation.run(randomUUID(), e5, "grammar_tip", "Grammar Tip",
      '"会" (huì) before a verb indicates future likelihood: 明天会下雨 = It will rain tomorrow.');

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
      insertVocab.run(randomUUID(), DEV_USER_ID, ch, py, mn, lvl, cat, mastery, "2023-10-01", reviewed);
    }

    // --- Grammar Points ---
    const grammarItems = [
      ["Subject + 是 + Noun", "A 是 B", "The verb 是 (shì) acts like \"to be\" in English. It links a subject to a noun, never an adjective.",
        JSON.stringify(["我是学生。 (I am a student.)", "他是老师。 (He is a teacher.)", "这是我的书。 (This is my book.)"]), 1],
      ["Negation with 不", "Subject + 不 + Verb/Adj", "不 (bù) is placed before a verb or adjective to negate it. It changes to bú before 4th tone.",
        JSON.stringify(["我不喝咖啡。 (I don't drink coffee.)", "他不高兴。 (He is not happy.)", "这个不贵。 (This is not expensive.)"]), 1],
      ["Using 了 for completed actions", "Verb + 了", "了 (le) after a verb indicates the action is completed. It does not indicate past tense — it marks completion.",
        JSON.stringify(["我吃了早餐。 (I ate breakfast.)", "他买了一件衣服。 (He bought a piece of clothing.)", "我们去了商店。 (We went to the store.)"]), 2],
      ["The 也 particle", "Subject + 也 + Verb/Adj", "也 (yě) means \"also/too\". It always comes after the subject and before the verb or adjective. Never at the end of a sentence.",
        JSON.stringify(["我也是学生。 (I am also a student.)", "她也很高兴。 (She is also happy.)", "我也喜欢咖啡。 (I also like coffee.)"]), 1],
      ["太...了 pattern", "太 + Adj + 了", "太...了 expresses \"too much\" of something. Often implies a complaint or strong feeling.",
        JSON.stringify(["这件衣服太贵了！ (This piece of clothing is too expensive!)", "今天太冷了。 (Today is too cold.)", "他太累了。 (He is too tired.)"]), 2],
      ["会 for future actions", "Subject + 会 + Verb", "会 (huì) before a verb expresses future likelihood or ability learned through study.",
        JSON.stringify(["明天会下雨。 (It will rain tomorrow.)", "我会说中文。 (I can speak Chinese.)", "他会来吗？ (Will he come?)"]), 2],
      ["Measure words with 个", "Number + 个 + Noun", "个 (gè) is the most common measure word. Used between a number and a noun when no specific measure word applies.",
        JSON.stringify(["三个人 (three people)", "两个朋友 (two friends)", "一个苹果 (one apple)"]), 1],
      ["的 possessive particle", "Noun/Pronoun + 的 + Noun", "的 (de) indicates possession, like \"'s\" in English. Can be dropped between close relationships.",
        JSON.stringify(["我的书 (my book)", "他的老师 (his teacher)", "妈妈的手机 (mom's phone)"]), 1],
    ];

    for (const [title, pattern, explanation, examples, level] of grammarItems) {
      insertGrammar.run(randomUUID(), DEV_USER_ID, title, pattern, explanation, examples, level);
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
      insertFlashcard.run(randomUUID(), DEV_USER_ID, front, back, deck, nextReview, interval, reviews);
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
      insertLesson.run(id, title, unit, level, desc, content, order);
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
      insertReview.run(randomUUID(), DEV_USER_ID, type, itemId, label, score, reviewedAt);
    }
  });

  seed();
  console.log("Demo data seeded successfully!");
  console.log(`  5 journal entries with highlights & annotations`);
  console.log(`  25 vocabulary items across HSK 1-2`);
  console.log(`  8 grammar points`);
  console.log(`  12 flashcards`);
  console.log(`  8 lessons`);
  console.log(`  15 review history records`);
  db.close();
}

async function main() {
  try {
    await seedAuthUser();
  } catch {
    console.log("Could not reach auth server — seed data only.");
  }
  seedData();
  console.log(`\nDev credentials:`);
  console.log(`  Email:    ${DEV_USER.email}`);
  console.log(`  Password: ${DEV_USER.password}`);
  console.log(`\nSign in at: ${BASE_URL}/auth/signin`);
}

main();
