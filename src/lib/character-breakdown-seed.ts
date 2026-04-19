export interface CharBreakdownItem {
  character: string;
  radical: string;
  radical_meaning: string;
  components: Array<{ char: string; meaning: string }>;
  mnemonic?: string;
}

export const CHARACTER_BREAKDOWN_SEED: CharBreakdownItem[] = [
  // ─── HSK 1 ───────────────────────────────────────────────────────────────

  {
    character: "爱",
    radical: "爪",
    radical_meaning: "claw/hand",
    components: [
      { char: "爪", meaning: "claw/hand" },
      { char: "冖", meaning: "cover" },
      { char: "心", meaning: "heart" },
      { char: "友", meaning: "friend" },
    ],
    mnemonic: "hands covering a heart for a friend — love",
  },
  {
    character: "八",
    radical: "八",
    radical_meaning: "eight",
    components: [{ char: "八", meaning: "eight" }],
  },
  {
    character: "爸",
    radical: "父",
    radical_meaning: "father",
    components: [
      { char: "父", meaning: "father" },
      { char: "巴", meaning: "cling/hope" },
    ],
    mnemonic: "father you cling to — dad",
  },
  {
    character: "杯",
    radical: "木",
    radical_meaning: "wood",
    components: [
      { char: "木", meaning: "wood/tree" },
      { char: "不", meaning: "not" },
    ],
    mnemonic: "a wooden thing that is not a tree — cup",
  },
  {
    character: "北",
    radical: "匕",
    radical_meaning: "spoon/ladle",
    components: [
      { char: "人", meaning: "person (back to back)" },
      { char: "匕", meaning: "spoon" },
    ],
    mnemonic: "two people standing back to back — north (the cold direction)",
  },
  {
    character: "本",
    radical: "木",
    radical_meaning: "wood/tree",
    components: [
      { char: "木", meaning: "wood/tree" },
      { char: "一", meaning: "one (root marker)" },
    ],
    mnemonic: "a line at the root of a tree — origin/book",
  },
  {
    character: "不",
    radical: "一",
    radical_meaning: "one",
    components: [{ char: "不", meaning: "not" }],
  },
  {
    character: "菜",
    radical: "艹",
    radical_meaning: "grass/plant",
    components: [
      { char: "艹", meaning: "plant" },
      { char: "采", meaning: "pick/gather" },
    ],
    mnemonic: "plant you gather — vegetable/dish",
  },
  {
    character: "茶",
    radical: "艹",
    radical_meaning: "grass/plant",
    components: [
      { char: "艹", meaning: "plant" },
      { char: "人", meaning: "person" },
      { char: "木", meaning: "wood/tree" },
    ],
    mnemonic: "a person among plants and trees — tea",
  },
  {
    character: "出",
    radical: "凵",
    radical_meaning: "container/pit",
    components: [
      { char: "凵", meaning: "pit/container" },
      { char: "屮", meaning: "sprout" },
    ],
    mnemonic: "a sprout coming out of a pit — go out",
  },
  {
    character: "穿",
    radical: "穴",
    radical_meaning: "cave/hole",
    components: [
      { char: "穴", meaning: "cave/hole" },
      { char: "牙", meaning: "tooth" },
    ],
    mnemonic: "a tooth passing through a hole — pierce/wear",
  },
  {
    character: "次",
    radical: "欠",
    radical_meaning: "yawn/lack",
    components: [
      { char: "冫", meaning: "ice" },
      { char: "欠", meaning: "yawn" },
    ],
    mnemonic: "an icy yawn — next time/occasion",
  },
  {
    character: "打",
    radical: "手",
    radical_meaning: "hand",
    components: [
      { char: "扌", meaning: "hand" },
      { char: "丁", meaning: "nail/4th heavenly stem" },
    ],
    mnemonic: "hand hitting a nail — hit/strike",
  },
  {
    character: "的",
    radical: "白",
    radical_meaning: "white",
    components: [
      { char: "白", meaning: "white" },
      { char: "勺", meaning: "spoon/ladle" },
    ],
    mnemonic: "white target (possessive particle)",
  },
  {
    character: "弟",
    radical: "弓",
    radical_meaning: "bow",
    components: [
      { char: "弓", meaning: "bow" },
      { char: "丨", meaning: "vertical stroke" },
      { char: "刀", meaning: "knife" },
    ],
    mnemonic: "younger brother trains with bow and knife",
  },
  {
    character: "店",
    radical: "广",
    radical_meaning: "shelter/building",
    components: [
      { char: "广", meaning: "building/shelter" },
      { char: "占", meaning: "occupy/divine" },
    ],
    mnemonic: "a building that occupies a spot — shop",
  },
  {
    character: "东",
    radical: "木",
    radical_meaning: "wood/tree",
    components: [
      { char: "木", meaning: "wood/tree" },
      { char: "日", meaning: "sun" },
    ],
    mnemonic: "sun rising behind a tree — east",
  },
  {
    character: "都",
    radical: "邑",
    radical_meaning: "city/town",
    components: [
      { char: "者", meaning: "person/one who" },
      { char: "阝", meaning: "city" },
    ],
    mnemonic: "all people in the city — capital/all",
  },
  {
    character: "对",
    radical: "又",
    radical_meaning: "right hand/again",
    components: [
      { char: "又", meaning: "right hand" },
      { char: "寸", meaning: "inch/measure" },
    ],
    mnemonic: "a right hand measuring precisely — correct",
  },
  {
    character: "多",
    radical: "夕",
    radical_meaning: "evening",
    components: [
      { char: "夕", meaning: "evening" },
      { char: "夕", meaning: "evening" },
    ],
    mnemonic: "evening upon evening — many/much",
  },
  {
    character: "饿",
    radical: "食",
    radical_meaning: "food/eat",
    components: [
      { char: "饣", meaning: "food" },
      { char: "我", meaning: "I/me" },
    ],
    mnemonic: "I need food — hungry",
  },
  {
    character: "二",
    radical: "二",
    radical_meaning: "two",
    components: [{ char: "二", meaning: "two" }],
  },
  {
    character: "法",
    radical: "水",
    radical_meaning: "water",
    components: [
      { char: "氵", meaning: "water" },
      { char: "去", meaning: "go/leave" },
    ],
    mnemonic: "water flowing away in an orderly way — law/method",
  },
  {
    character: "饭",
    radical: "食",
    radical_meaning: "food/eat",
    components: [
      { char: "饣", meaning: "food" },
      { char: "反", meaning: "turn/oppose" },
    ],
    mnemonic: "food that is turned/cooked — rice/meal",
  },
  {
    character: "分",
    radical: "刀",
    radical_meaning: "knife",
    components: [
      { char: "八", meaning: "divide" },
      { char: "刀", meaning: "knife" },
    ],
    mnemonic: "a knife dividing in two — divide/minute",
  },
  {
    character: "个",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "人", meaning: "person" },
      { char: "一", meaning: "one" },
    ],
    mnemonic: "one person — general measure word",
  },
  {
    character: "工",
    radical: "工",
    radical_meaning: "work/craft",
    components: [{ char: "工", meaning: "work/craft" }],
  },
  {
    character: "狗",
    radical: "犬",
    radical_meaning: "dog",
    components: [
      { char: "犭", meaning: "dog/animal" },
      { char: "句", meaning: "sentence/clause" },
    ],
    mnemonic: "an animal that barks sentences — dog",
  },
  {
    character: "关",
    radical: "八",
    radical_meaning: "eight/divide",
    components: [
      { char: "丱", meaning: "horns/crossed" },
      { char: "八", meaning: "divide" },
    ],
    mnemonic: "crossed bars dividing — close/shut/pass",
  },
  {
    character: "贵",
    radical: "贝",
    radical_meaning: "shell/money",
    components: [
      { char: "中", meaning: "middle" },
      { char: "贝", meaning: "shell/money" },
    ],
    mnemonic: "money at the center — expensive/precious",
  },
  {
    character: "国",
    radical: "囗",
    radical_meaning: "enclosure",
    components: [
      { char: "囗", meaning: "enclosure/border" },
      { char: "玉", meaning: "jade/treasure" },
    ],
    mnemonic: "treasure enclosed by borders — country",
  },
  {
    character: "好",
    radical: "女",
    radical_meaning: "woman",
    components: [
      { char: "女", meaning: "woman" },
      { char: "子", meaning: "child" },
    ],
    mnemonic: "woman + child = good",
  },
  {
    character: "喝",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "曷", meaning: "why/how" },
    ],
    mnemonic: "mouth calling for something — drink",
  },
  {
    character: "和",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "禾", meaning: "grain/rice plant" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "grain and mouth together — harmony/and",
  },
  {
    character: "黑",
    radical: "黑",
    radical_meaning: "black",
    components: [
      { char: "里", meaning: "inside" },
      { char: "灬", meaning: "fire" },
    ],
    mnemonic: "fire burning from inside — black (soot)",
  },
  {
    character: "红",
    radical: "糸",
    radical_meaning: "silk/thread",
    components: [
      { char: "纟", meaning: "silk/thread" },
      { char: "工", meaning: "work" },
    ],
    mnemonic: "silk worked into red — red",
  },
  {
    character: "后",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "彳", meaning: "step/walk" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "walking behind and calling — after/behind",
  },
  {
    character: "话",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "舌", meaning: "tongue" },
    ],
    mnemonic: "speech from the tongue — speech/words",
  },
  {
    character: "欢",
    radical: "欠",
    radical_meaning: "yawn/breath",
    components: [
      { char: "又", meaning: "again" },
      { char: "欠", meaning: "yawn/exhale" },
    ],
    mnemonic: "exhaling with joy again — happy/welcome",
  },
  {
    character: "还",
    radical: "辵",
    radical_meaning: "walk/movement",
    components: [
      { char: "辶", meaning: "walk/movement" },
      { char: "不", meaning: "not" },
    ],
    mnemonic: "walk back to where you were — still/return",
  },
  {
    character: "回",
    radical: "囗",
    radical_meaning: "enclosure",
    components: [
      { char: "囗", meaning: "outer enclosure" },
      { char: "囗", meaning: "inner enclosure" },
    ],
    mnemonic: "a loop inside a loop — return/go back",
  },
  {
    character: "会",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亼", meaning: "assemble/gather" },
      { char: "云", meaning: "cloud/say" },
    ],
    mnemonic: "people gathering to speak — can/meeting",
  },
  {
    character: "几",
    radical: "几",
    radical_meaning: "table/small table",
    components: [{ char: "几", meaning: "small table" }],
  },
  {
    character: "家",
    radical: "宀",
    radical_meaning: "roof",
    components: [
      { char: "宀", meaning: "roof" },
      { char: "豕", meaning: "pig" },
    ],
    mnemonic: "a roof over a pig — home (pigs were kept at home)",
  },
  {
    character: "见",
    radical: "见",
    radical_meaning: "see",
    components: [
      { char: "目", meaning: "eye" },
      { char: "儿", meaning: "person/legs" },
    ],
    mnemonic: "a person with eyes — see/meet",
  },
  {
    character: "叫",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "丩", meaning: "twist/call" },
    ],
    mnemonic: "mouth twisting to call — shout/be called",
  },
  {
    character: "今",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亼", meaning: "assemble" },
      { char: "乙", meaning: "second/bent" },
    ],
    mnemonic: "gathered at this bend in time — today/now",
  },
  {
    character: "进",
    radical: "辵",
    radical_meaning: "walk/movement",
    components: [
      { char: "辶", meaning: "walk" },
      { char: "隹", meaning: "short-tailed bird" },
    ],
    mnemonic: "a bird walking forward — enter/advance",
  },
  {
    character: "九",
    radical: "乙",
    radical_meaning: "second/bent",
    components: [{ char: "九", meaning: "nine" }],
  },
  {
    character: "就",
    radical: "尢",
    radical_meaning: "lame/crooked",
    components: [
      { char: "京", meaning: "capital city" },
      { char: "尢", meaning: "lame/bent" },
    ],
    mnemonic: "bent toward the capital — then/right away",
  },
  {
    character: "觉",
    radical: "见",
    radical_meaning: "see",
    components: [
      { char: "学", meaning: "learn (top part)" },
      { char: "见", meaning: "see" },
    ],
    mnemonic: "see through learning — feel/perceive/sleep",
  },
  {
    character: "开",
    radical: "廾",
    radical_meaning: "two hands",
    components: [
      { char: "一", meaning: "one/bar" },
      { char: "廾", meaning: "two hands" },
    ],
    mnemonic: "two hands lifting a bar — open",
  },
  {
    character: "看",
    radical: "目",
    radical_meaning: "eye",
    components: [
      { char: "手", meaning: "hand" },
      { char: "目", meaning: "eye" },
    ],
    mnemonic: "hand over eye shading the sun — look",
  },
  {
    character: "课",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "果", meaning: "fruit/result" },
    ],
    mnemonic: "speech yielding results — lesson/class",
  },
  {
    character: "来",
    radical: "木",
    radical_meaning: "wood/tree",
    components: [
      { char: "木", meaning: "tree" },
      { char: "人", meaning: "person" },
    ],
    mnemonic: "person arriving at the tree — come",
  },
  {
    character: "老",
    radical: "老",
    radical_meaning: "old",
    components: [
      { char: "耂", meaning: "old person" },
      { char: "匕", meaning: "spoon/change" },
    ],
    mnemonic: "an old person changed by age — old",
  },
  {
    character: "了",
    radical: "子",
    radical_meaning: "child",
    components: [{ char: "了", meaning: "completion marker" }],
  },
  {
    character: "里",
    radical: "里",
    radical_meaning: "village/inside",
    components: [
      { char: "田", meaning: "field" },
      { char: "土", meaning: "earth/soil" },
    ],
    mnemonic: "fields on the earth — inside/village/li (unit)",
  },
  {
    character: "两",
    radical: "入",
    radical_meaning: "enter",
    components: [
      { char: "一", meaning: "one" },
      { char: "冂", meaning: "boundary" },
      { char: "两", meaning: "two inside boundary" },
    ],
    mnemonic: "two things within a boundary — two (of)",
  },
  {
    character: "零",
    radical: "雨",
    radical_meaning: "rain",
    components: [
      { char: "雨", meaning: "rain" },
      { char: "令", meaning: "command/order" },
    ],
    mnemonic: "rain drops commanded to fall — zero/remainder",
  },
  {
    character: "路",
    radical: "足",
    radical_meaning: "foot",
    components: [
      { char: "足", meaning: "foot" },
      { char: "各", meaning: "each" },
    ],
    mnemonic: "feet going each way — road/path",
  },
  {
    character: "吗",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "马", meaning: "horse" },
    ],
    mnemonic: "mouth asking like a horse neighs — question particle",
  },
  {
    character: "妈",
    radical: "女",
    radical_meaning: "woman",
    components: [
      { char: "女", meaning: "woman" },
      { char: "马", meaning: "horse" },
    ],
    mnemonic: "woman strong as a horse — mom",
  },
  {
    character: "买",
    radical: "贝",
    radical_meaning: "shell/money",
    components: [
      { char: "乙", meaning: "second/bent" },
      { char: "贝", meaning: "shell/money" },
    ],
    mnemonic: "bending to hand over money — buy",
  },
  {
    character: "猫",
    radical: "犬",
    radical_meaning: "dog/animal",
    components: [
      { char: "犭", meaning: "animal" },
      { char: "苗", meaning: "sprout/seedling" },
    ],
    mnemonic: "a small slender animal — cat",
  },
  {
    character: "么",
    radical: "么",
    radical_meaning: "tiny",
    components: [{ char: "么", meaning: "tiny/question suffix" }],
  },
  {
    character: "没",
    radical: "水",
    radical_meaning: "water",
    components: [
      { char: "氵", meaning: "water" },
      { char: "殳", meaning: "weapon/strike" },
    ],
    mnemonic: "submerged in water — not have/not yet",
  },
  {
    character: "门",
    radical: "门",
    radical_meaning: "gate/door",
    components: [{ char: "门", meaning: "gate/door" }],
  },
  {
    character: "面",
    radical: "面",
    radical_meaning: "face/noodle",
    components: [
      { char: "囗", meaning: "outline" },
      { char: "目", meaning: "eye" },
    ],
    mnemonic: "the outline containing the eye — face/surface/noodles",
  },
  {
    character: "名",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "夕", meaning: "evening" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "call out your name in the evening (can't see you) — name",
  },
  {
    character: "那",
    radical: "邑",
    radical_meaning: "city/town",
    components: [
      { char: "冉", meaning: "whiskers/gradual" },
      { char: "阝", meaning: "city/place" },
    ],
    mnemonic: "a distant place — that",
  },
  {
    character: "哪",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "那", meaning: "that" },
    ],
    mnemonic: "mouth asking about that place — which/where",
  },
  {
    character: "年",
    radical: "干",
    radical_meaning: "dry/stem",
    components: [
      { char: "禾", meaning: "grain" },
      { char: "千", meaning: "thousand" },
    ],
    mnemonic: "a thousand grains harvested — year",
  },
  {
    character: "你",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "尔", meaning: "you (archaic)" },
    ],
    mnemonic: "a person — you",
  },
  {
    character: "女",
    radical: "女",
    radical_meaning: "woman",
    components: [{ char: "女", meaning: "woman" }],
  },
  {
    character: "旁",
    radical: "方",
    radical_meaning: "direction/square",
    components: [
      { char: "方", meaning: "direction/square" },
      { char: "立", meaning: "stand" },
      { char: "冖", meaning: "cover" },
    ],
    mnemonic: "standing at the side of a square — beside/side",
  },
  {
    character: "朋",
    radical: "月",
    radical_meaning: "moon/flesh",
    components: [
      { char: "月", meaning: "moon" },
      { char: "月", meaning: "moon" },
    ],
    mnemonic: "two moons side by side — friend",
  },
  {
    character: "漂",
    radical: "水",
    radical_meaning: "water",
    components: [
      { char: "氵", meaning: "water" },
      { char: "票", meaning: "ticket/float" },
    ],
    mnemonic: "floating on water — float/pretty",
  },
  {
    character: "七",
    radical: "一",
    radical_meaning: "one",
    components: [{ char: "七", meaning: "seven" }],
  },
  {
    character: "钱",
    radical: "金",
    radical_meaning: "metal/gold",
    components: [
      { char: "钅", meaning: "metal/gold" },
      { char: "戋", meaning: "small/little" },
    ],
    mnemonic: "small pieces of metal — money",
  },
  {
    character: "前",
    radical: "刀",
    radical_meaning: "knife",
    components: [
      { char: "止", meaning: "stop/foot" },
      { char: "月", meaning: "moon/boat" },
      { char: "刂", meaning: "knife" },
    ],
    mnemonic: "cutting a path forward — front/before",
  },
  {
    character: "请",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "青", meaning: "blue-green/young" },
    ],
    mnemonic: "speak with fresh sincerity — please/invite",
  },
  {
    character: "去",
    radical: "去",
    radical_meaning: "go",
    components: [
      { char: "土", meaning: "earth" },
      { char: "厶", meaning: "private/self" },
    ],
    mnemonic: "leaving the earth behind — go",
  },
  {
    character: "热",
    radical: "火",
    radical_meaning: "fire",
    components: [
      { char: "执", meaning: "hold/grasp" },
      { char: "灬", meaning: "fire" },
    ],
    mnemonic: "holding fire — hot",
  },
  {
    character: "人",
    radical: "人",
    radical_meaning: "person",
    components: [{ char: "人", meaning: "person" }],
  },
  {
    character: "认",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "忍", meaning: "endure/tolerate" },
    ],
    mnemonic: "speaking what you know — recognize/know",
  },
  {
    character: "三",
    radical: "一",
    radical_meaning: "one",
    components: [{ char: "三", meaning: "three" }],
  },
  {
    character: "上",
    radical: "一",
    radical_meaning: "one",
    components: [
      { char: "一", meaning: "ground" },
      { char: "亅", meaning: "upward stroke" },
    ],
    mnemonic: "a stroke going above the line — up/above",
  },
  {
    character: "少",
    radical: "小",
    radical_meaning: "small",
    components: [
      { char: "小", meaning: "small" },
      { char: "丿", meaning: "slash" },
    ],
    mnemonic: "even smaller than small — few/little",
  },
  {
    character: "身",
    radical: "身",
    radical_meaning: "body",
    components: [{ char: "身", meaning: "body" }],
  },
  {
    character: "什",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "十", meaning: "ten" },
    ],
    mnemonic: "ten people — what (十么 → 什么)",
  },
  {
    character: "生",
    radical: "生",
    radical_meaning: "life/birth",
    components: [
      { char: "土", meaning: "earth/soil" },
      { char: "一", meaning: "sprout stroke" },
    ],
    mnemonic: "a sprout emerging from soil — life/birth/grow",
  },
  {
    character: "师",
    radical: "巾",
    radical_meaning: "cloth",
    components: [
      { char: "帀", meaning: "encircle/surround" },
      { char: "巾", meaning: "cloth" },
    ],
    mnemonic: "one who wraps up knowledge — teacher",
  },
  {
    character: "时",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun/day" },
      { char: "寸", meaning: "inch/measure" },
    ],
    mnemonic: "measuring the sun's movement — time",
  },
  {
    character: "食",
    radical: "食",
    radical_meaning: "food/eat",
    components: [
      { char: "亼", meaning: "gather" },
      { char: "良", meaning: "good/fine" },
    ],
    mnemonic: "gathering good things — food/eat",
  },
  {
    character: "十",
    radical: "十",
    radical_meaning: "ten",
    components: [{ char: "十", meaning: "ten" }],
  },
  {
    character: "是",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun" },
      { char: "正", meaning: "correct/upright" },
    ],
    mnemonic: "the sun standing straight and correct — is/yes",
  },
  {
    character: "书",
    radical: "乙",
    radical_meaning: "second/bent",
    components: [
      { char: "聿", meaning: "writing brush" },
      { char: "乙", meaning: "bent stroke" },
    ],
    mnemonic: "using a brush with strokes — book",
  },
  {
    character: "谁",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "隹", meaning: "short-tailed bird" },
    ],
    mnemonic: "speech asking about a bird — who",
  },
  {
    character: "说",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "兑", meaning: "exchange/joyful" },
    ],
    mnemonic: "joyfully exchanging speech — speak/say",
  },
  {
    character: "四",
    radical: "囗",
    radical_meaning: "enclosure",
    components: [
      { char: "囗", meaning: "enclosure" },
      { char: "八", meaning: "divide/eight" },
    ],
    mnemonic: "four sides in an enclosure — four",
  },
  {
    character: "他",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "也", meaning: "also/serpent" },
    ],
    mnemonic: "another person also — he/him",
  },
  {
    character: "她",
    radical: "女",
    radical_meaning: "woman",
    components: [
      { char: "女", meaning: "woman" },
      { char: "也", meaning: "also" },
    ],
    mnemonic: "a woman also — she/her",
  },
  {
    character: "太",
    radical: "大",
    radical_meaning: "big/large",
    components: [
      { char: "大", meaning: "big/large" },
      { char: "丶", meaning: "dot/excess" },
    ],
    mnemonic: "big with a dot of excess — too/very",
  },
  {
    character: "天",
    radical: "大",
    radical_meaning: "big/large",
    components: [
      { char: "一", meaning: "one/sky" },
      { char: "大", meaning: "big person" },
    ],
    mnemonic: "above the big person — sky/heaven/day",
  },
  {
    character: "听",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "斤", meaning: "axe/catty" },
    ],
    mnemonic: "mouth sharp as an axe at hearing — listen",
  },
  {
    character: "同",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "冂", meaning: "boundary" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "mouths within the same boundary — same/together",
  },
  {
    character: "外",
    radical: "夕",
    radical_meaning: "evening",
    components: [
      { char: "夕", meaning: "evening" },
      { char: "卜", meaning: "divine/outside" },
    ],
    mnemonic: "divining outside in the evening — outside",
  },
  {
    character: "玩",
    radical: "玉",
    radical_meaning: "jade",
    components: [
      { char: "王", meaning: "king/jade" },
      { char: "元", meaning: "first/origin" },
    ],
    mnemonic: "playing with precious jade — play",
  },
  {
    character: "我",
    radical: "戈",
    radical_meaning: "spear/halberd",
    components: [
      { char: "手", meaning: "hand" },
      { char: "戈", meaning: "spear" },
    ],
    mnemonic: "a hand holding a spear — I/me",
  },
  {
    character: "午",
    radical: "十",
    radical_meaning: "ten",
    components: [{ char: "午", meaning: "noon (7th earthly branch)" }],
  },
  {
    character: "五",
    radical: "二",
    radical_meaning: "two",
    components: [{ char: "五", meaning: "five" }],
  },
  {
    character: "喜",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "壴", meaning: "drum/joy" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "a drum making the mouth happy — happy/like",
  },
  {
    character: "下",
    radical: "一",
    radical_meaning: "one",
    components: [
      { char: "一", meaning: "ground" },
      { char: "亅", meaning: "downward stroke" },
    ],
    mnemonic: "a stroke going below the line — down/below",
  },
  {
    character: "先",
    radical: "儿",
    radical_meaning: "person/legs",
    components: [
      { char: "丿", meaning: "slash" },
      { char: "土", meaning: "earth" },
      { char: "儿", meaning: "person" },
    ],
    mnemonic: "a person stepping first on the earth — first/before",
  },
  {
    character: "现",
    radical: "玉",
    radical_meaning: "jade",
    components: [
      { char: "王", meaning: "jade/king" },
      { char: "见", meaning: "see" },
    ],
    mnemonic: "see the jade shine — appear/now/present",
  },
  {
    character: "想",
    radical: "心",
    radical_meaning: "heart/mind",
    components: [
      { char: "相", meaning: "mutual/observe" },
      { char: "心", meaning: "heart/mind" },
    ],
    mnemonic: "heart observing things — think/miss",
  },
  {
    character: "小",
    radical: "小",
    radical_meaning: "small",
    components: [{ char: "小", meaning: "small" }],
  },
  {
    character: "笑",
    radical: "竹",
    radical_meaning: "bamboo",
    components: [
      { char: "竹", meaning: "bamboo" },
      { char: "夭", meaning: "young/tender" },
    ],
    mnemonic: "bamboo bending like a laughing person — laugh/smile",
  },
  {
    character: "谢",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "射", meaning: "shoot/emit" },
    ],
    mnemonic: "speech shooting out in gratitude — thank",
  },
  {
    character: "新",
    radical: "斤",
    radical_meaning: "axe",
    components: [
      { char: "亲", meaning: "close/kin" },
      { char: "斤", meaning: "axe" },
    ],
    mnemonic: "chopping with an axe to make something new — new",
  },
  {
    character: "星",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun/light" },
      { char: "生", meaning: "life/born" },
    ],
    mnemonic: "light born in the sky — star",
  },
  {
    character: "行",
    radical: "行",
    radical_meaning: "walk/travel",
    components: [
      { char: "彳", meaning: "step left" },
      { char: "亍", meaning: "step right" },
    ],
    mnemonic: "left step, right step — walk/travel/OK",
  },
  {
    character: "休",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "木", meaning: "tree" },
    ],
    mnemonic: "a person leaning against a tree — rest",
  },
  {
    character: "学",
    radical: "子",
    radical_meaning: "child",
    components: [
      { char: "爻", meaning: "lines/study" },
      { char: "冖", meaning: "cover" },
      { char: "子", meaning: "child" },
    ],
    mnemonic: "a child covered by knowledge patterns — study/learn",
  },
  {
    character: "雪",
    radical: "雨",
    radical_meaning: "rain",
    components: [
      { char: "雨", meaning: "rain" },
      { char: "彐", meaning: "snout/sweep" },
    ],
    mnemonic: "rain that sweeps in white — snow",
  },
  {
    character: "也",
    radical: "乙",
    radical_meaning: "second/bent",
    components: [{ char: "也", meaning: "also/serpent" }],
  },
  {
    character: "一",
    radical: "一",
    radical_meaning: "one",
    components: [{ char: "一", meaning: "one" }],
  },
  {
    character: "衣",
    radical: "衣",
    radical_meaning: "clothing",
    components: [{ char: "衣", meaning: "clothing" }],
  },
  {
    character: "医",
    radical: "匚",
    radical_meaning: "box/container",
    components: [
      { char: "匚", meaning: "container/box" },
      { char: "矢", meaning: "arrow" },
    ],
    mnemonic: "arrows in a medical box — doctor/medicine",
  },
  {
    character: "椅",
    radical: "木",
    radical_meaning: "wood",
    components: [
      { char: "木", meaning: "wood/tree" },
      { char: "奇", meaning: "strange/wonderful" },
    ],
    mnemonic: "a wonderfully shaped piece of wood — chair",
  },
  {
    character: "有",
    radical: "月",
    radical_meaning: "moon/flesh",
    components: [
      { char: "月", meaning: "meat/hand" },
      { char: "𠂇", meaning: "hand reaching" },
    ],
    mnemonic: "a hand holding meat — have/possess",
  },
  {
    character: "雨",
    radical: "雨",
    radical_meaning: "rain",
    components: [{ char: "雨", meaning: "rain" }],
  },
  {
    character: "语",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "吾", meaning: "I/my" },
    ],
    mnemonic: "my speech — language",
  },
  {
    character: "元",
    radical: "儿",
    radical_meaning: "person/legs",
    components: [
      { char: "一", meaning: "one/first" },
      { char: "儿", meaning: "person" },
    ],
    mnemonic: "the first thing a person has — first/yuan (currency)",
  },
  {
    character: "院",
    radical: "阜",
    radical_meaning: "mound/hill",
    components: [
      { char: "阝", meaning: "mound/hill" },
      { char: "完", meaning: "complete/whole" },
    ],
    mnemonic: "a complete enclosed hill compound — courtyard/institution",
  },
  {
    character: "月",
    radical: "月",
    radical_meaning: "moon",
    components: [{ char: "月", meaning: "moon" }],
  },
  {
    character: "再",
    radical: "冂",
    radical_meaning: "boundary",
    components: [
      { char: "冂", meaning: "boundary" },
      { char: "土", meaning: "earth/twice" },
    ],
    mnemonic: "doing it again within a boundary — again",
  },
  {
    character: "在",
    radical: "土",
    radical_meaning: "earth/soil",
    components: [
      { char: "才", meaning: "talent/just" },
      { char: "土", meaning: "earth" },
    ],
    mnemonic: "a talent rooted in the earth — be at/exist",
  },
  {
    character: "怎",
    radical: "心",
    radical_meaning: "heart/mind",
    components: [
      { char: "乍", meaning: "suddenly/how" },
      { char: "心", meaning: "heart/mind" },
    ],
    mnemonic: "heart suddenly wondering — how/why",
  },
  {
    character: "这",
    radical: "辵",
    radical_meaning: "walk/movement",
    components: [
      { char: "辶", meaning: "walk" },
      { char: "文", meaning: "writing/pattern" },
    ],
    mnemonic: "walking with this writing — this",
  },
  {
    character: "正",
    radical: "止",
    radical_meaning: "stop/foot",
    components: [
      { char: "一", meaning: "one/target" },
      { char: "止", meaning: "stop/foot" },
    ],
    mnemonic: "a foot stopping at the target line — correct/straight",
  },
  {
    character: "中",
    radical: "丨",
    radical_meaning: "vertical stroke",
    components: [
      { char: "囗", meaning: "box" },
      { char: "丨", meaning: "vertical line through center" },
    ],
    mnemonic: "a line through the center of a box — middle/center",
  },
  {
    character: "住",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "主", meaning: "master/main" },
    ],
    mnemonic: "a person's main place — live/reside",
  },
  {
    character: "子",
    radical: "子",
    radical_meaning: "child",
    components: [{ char: "子", meaning: "child" }],
  },
  {
    character: "做",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "故", meaning: "reason/therefore" },
    ],
    mnemonic: "a person acting with reason — do/make",
  },
  {
    character: "左",
    radical: "工",
    radical_meaning: "work/craft",
    components: [
      { char: "𠂇", meaning: "left hand" },
      { char: "工", meaning: "work" },
    ],
    mnemonic: "left hand at work — left",
  },

  // ─── HSK 2 ───────────────────────────────────────────────────────────────

  {
    character: "班",
    radical: "刀",
    radical_meaning: "knife",
    components: [
      { char: "王", meaning: "jade/king" },
      { char: "刀", meaning: "knife" },
      { char: "王", meaning: "jade/king" },
    ],
    mnemonic: "a knife dividing jade into groups — class/team",
  },
  {
    character: "白",
    radical: "白",
    radical_meaning: "white",
    components: [{ char: "白", meaning: "white" }],
  },
  {
    character: "半",
    radical: "十",
    radical_meaning: "ten",
    components: [
      { char: "八", meaning: "divide" },
      { char: "十", meaning: "ten" },
    ],
    mnemonic: "dividing ten in half — half",
  },
  {
    character: "帮",
    radical: "巾",
    radical_meaning: "cloth",
    components: [
      { char: "邦", meaning: "country/state" },
      { char: "巾", meaning: "cloth" },
    ],
    mnemonic: "cloth support from a nation — help",
  },
  {
    character: "比",
    radical: "比",
    radical_meaning: "compare",
    components: [
      { char: "匕", meaning: "spoon/person" },
      { char: "匕", meaning: "spoon/person" },
    ],
    mnemonic: "two people side by side — compare",
  },
  {
    character: "别",
    radical: "刀",
    radical_meaning: "knife",
    components: [
      { char: "另", meaning: "another/separate" },
      { char: "刂", meaning: "knife" },
    ],
    mnemonic: "a knife separating — separate/don't",
  },
  {
    character: "病",
    radical: "疒",
    radical_meaning: "sickness",
    components: [
      { char: "疒", meaning: "sickness" },
      { char: "丙", meaning: "3rd heavenly stem" },
    ],
    mnemonic: "a person laid low by sickness — sick/illness",
  },
  {
    character: "才",
    radical: "手",
    radical_meaning: "hand",
    components: [{ char: "才", meaning: "talent/just now" }],
  },
  {
    character: "长",
    radical: "长",
    radical_meaning: "long/grow",
    components: [{ char: "长", meaning: "long/grow/chief" }],
  },
  {
    character: "唱",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "昌", meaning: "flourishing/bright" },
    ],
    mnemonic: "mouth flourishing with sound — sing",
  },
  {
    character: "场",
    radical: "土",
    radical_meaning: "earth/soil",
    components: [
      { char: "土", meaning: "earth" },
      { char: "昜", meaning: "open/spread" },
    ],
    mnemonic: "open ground/earth — field/place/scene",
  },
  {
    character: "晨",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun" },
      { char: "辰", meaning: "5th earthly branch/morning" },
    ],
    mnemonic: "the sun at the morning hour — dawn/morning",
  },
  {
    character: "成",
    radical: "戈",
    radical_meaning: "spear/halberd",
    components: [
      { char: "戊", meaning: "5th heavenly stem" },
      { char: "丿", meaning: "slash" },
    ],
    mnemonic: "completing a stroke with a spear — succeed/become",
  },
  {
    character: "吃",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "乞", meaning: "beg" },
    ],
    mnemonic: "mouth begging for food — eat",
  },
  {
    character: "迟",
    radical: "辵",
    radical_meaning: "walk/movement",
    components: [
      { char: "辶", meaning: "walk" },
      { char: "尺", meaning: "ruler/foot" },
    ],
    mnemonic: "walking only a foot's length — late/slow",
  },
  {
    character: "除",
    radical: "阜",
    radical_meaning: "mound/hill",
    components: [
      { char: "阝", meaning: "mound" },
      { char: "余", meaning: "excess/I" },
    ],
    mnemonic: "removing the excess from a mound — except/remove",
  },
  {
    character: "错",
    radical: "金",
    radical_meaning: "metal/gold",
    components: [
      { char: "钅", meaning: "metal" },
      { char: "昔", meaning: "in the past/formerly" },
    ],
    mnemonic: "metal from the past that rusted — wrong/mistake",
  },
  {
    character: "带",
    radical: "巾",
    radical_meaning: "cloth",
    components: [
      { char: "艹", meaning: "grass/plant" },
      { char: "巾", meaning: "cloth/belt" },
    ],
    mnemonic: "a cloth belt with plant patterns — belt/bring/take",
  },
  {
    character: "但",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "旦", meaning: "dawn/daybreak" },
    ],
    mnemonic: "a person at dawn facing a new day — but/however",
  },
  {
    character: "当",
    radical: "田",
    radical_meaning: "field",
    components: [
      { char: "彐", meaning: "snout/comb" },
      { char: "田", meaning: "field" },
    ],
    mnemonic: "working the field appropriately — ought to/serve as",
  },
  {
    character: "等",
    radical: "竹",
    radical_meaning: "bamboo",
    components: [
      { char: "竹", meaning: "bamboo" },
      { char: "寺", meaning: "temple" },
    ],
    mnemonic: "bamboo tablets in the temple (ranked equally) — wait/equal/etc.",
  },
  {
    character: "地",
    radical: "土",
    radical_meaning: "earth/soil",
    components: [
      { char: "土", meaning: "earth" },
      { char: "也", meaning: "also/serpent" },
    ],
    mnemonic: "earth that is also everywhere — ground/place/adverb marker",
  },
  {
    character: "懂",
    radical: "心",
    radical_meaning: "heart/mind",
    components: [
      { char: "忄", meaning: "heart/mind" },
      { char: "董", meaning: "supervise/director" },
    ],
    mnemonic: "heart supervising knowledge — understand",
  },
  {
    character: "端",
    radical: "立",
    radical_meaning: "stand",
    components: [
      { char: "立", meaning: "stand" },
      { char: "专", meaning: "concentrate" },
      { char: "山", meaning: "mountain" },
    ],
    mnemonic: "standing concentrated at the mountain's tip — end/upright",
  },
  {
    character: "短",
    radical: "矢",
    radical_meaning: "arrow",
    components: [
      { char: "矢", meaning: "arrow" },
      { char: "豆", meaning: "bean/vessel" },
    ],
    mnemonic: "an arrow as short as a bean — short",
  },
  {
    character: "而",
    radical: "而",
    radical_meaning: "and yet",
    components: [{ char: "而", meaning: "and/yet/but (conjunction)" }],
  },
  {
    character: "发",
    radical: "又",
    radical_meaning: "right hand/again",
    components: [
      { char: "癶", meaning: "back to back" },
      { char: "又", meaning: "right hand" },
    ],
    mnemonic: "hand releasing — send out/hair/emit",
  },
  {
    character: "方",
    radical: "方",
    radical_meaning: "direction/square",
    components: [{ char: "方", meaning: "direction/square/method" }],
  },
  {
    character: "房",
    radical: "户",
    radical_meaning: "door/household",
    components: [
      { char: "户", meaning: "door/household" },
      { char: "方", meaning: "square/direction" },
    ],
    mnemonic: "a square-shaped household — room/house",
  },
  {
    character: "告",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "牛", meaning: "cow/ox" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "an ox's mouth speaking solemnly — report/inform",
  },
  {
    character: "跑",
    radical: "足",
    radical_meaning: "foot",
    components: [
      { char: "足", meaning: "foot" },
      { char: "包", meaning: "wrap/run" },
    ],
    mnemonic: "feet wrapping ground quickly — run",
  },
  {
    character: "哥",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "可", meaning: "can/may" },
      { char: "可", meaning: "can/may" },
    ],
    mnemonic: "can always rely on him — older brother",
  },
  {
    character: "给",
    radical: "糸",
    radical_meaning: "silk/thread",
    components: [
      { char: "纟", meaning: "silk/thread" },
      { char: "合", meaning: "combine/join" },
    ],
    mnemonic: "joining threads together — give/for",
  },
  {
    character: "更",
    radical: "曰",
    radical_meaning: "say",
    components: [
      { char: "丙", meaning: "3rd heavenly stem" },
      { char: "攴", meaning: "strike/tap" },
    ],
    mnemonic: "tapping to go even further — even more/change",
  },
  {
    character: "刚",
    radical: "刀",
    radical_meaning: "knife",
    components: [
      { char: "冈", meaning: "ridge/hill" },
      { char: "刂", meaning: "knife" },
    ],
    mnemonic: "a knife on a hard ridge — just now/hard/firm",
  },
  {
    character: "高",
    radical: "高",
    radical_meaning: "tall/high",
    components: [{ char: "高", meaning: "tall/high" }],
  },
  {
    character: "歌",
    radical: "欠",
    radical_meaning: "yawn/breath",
    components: [
      { char: "哥", meaning: "older brother" },
      { char: "欠", meaning: "breathe out/yawn" },
    ],
    mnemonic: "brother breathing out rhythmically — song",
  },
  {
    character: "己",
    radical: "己",
    radical_meaning: "self",
    components: [{ char: "己", meaning: "self/oneself" }],
  },
  {
    character: "记",
    radical: "言",
    radical_meaning: "speech/word",
    components: [
      { char: "讠", meaning: "speech" },
      { char: "己", meaning: "self" },
    ],
    mnemonic: "speech to/from oneself — remember/record",
  },
  {
    character: "间",
    radical: "门",
    radical_meaning: "gate/door",
    components: [
      { char: "门", meaning: "gate/door" },
      { char: "日", meaning: "sun" },
    ],
    mnemonic: "sunlight through the gate — between/interval/room",
  },
  {
    character: "结",
    radical: "糸",
    radical_meaning: "silk/thread",
    components: [
      { char: "纟", meaning: "silk/thread" },
      { char: "吉", meaning: "lucky/auspicious" },
    ],
    mnemonic: "lucky threads tied together — knot/conclude",
  },
  {
    character: "经",
    radical: "糸",
    radical_meaning: "silk/thread",
    components: [
      { char: "纟", meaning: "silk/thread" },
      { char: "巠", meaning: "flowing water/warp" },
    ],
    mnemonic: "warp threads running through — pass through/scripture/already",
  },
  {
    character: "举",
    radical: "手",
    radical_meaning: "hand",
    components: [
      { char: "兴", meaning: "flourish/lift" },
      { char: "手", meaning: "hand" },
    ],
    mnemonic: "hands raised in excitement — lift/举行 (hold an event)",
  },
  {
    character: "快",
    radical: "心",
    radical_meaning: "heart/mind",
    components: [
      { char: "忄", meaning: "heart" },
      { char: "夬", meaning: "decide/snap" },
    ],
    mnemonic: "a heart snapping to action — fast/happy",
  },
  {
    character: "块",
    radical: "土",
    radical_meaning: "earth/soil",
    components: [
      { char: "土", meaning: "earth" },
      { char: "夬", meaning: "decide/break off" },
    ],
    mnemonic: "a chunk broken from the earth — piece/lump/yuan",
  },
  {
    character: "离",
    radical: "隹",
    radical_meaning: "short-tailed bird",
    components: [
      { char: "禸", meaning: "step/trample" },
      { char: "隹", meaning: "bird" },
    ],
    mnemonic: "a bird stepping away — leave/separate/from",
  },
  {
    character: "卖",
    radical: "十",
    radical_meaning: "ten",
    components: [
      { char: "十", meaning: "ten" },
      { char: "买", meaning: "buy" },
    ],
    mnemonic: "ten-times buy — sell",
  },
  {
    character: "满",
    radical: "水",
    radical_meaning: "water",
    components: [
      { char: "氵", meaning: "water" },
      { char: "㒼", meaning: "full/overflow" },
    ],
    mnemonic: "water overflowing — full/satisfied",
  },
  {
    character: "明",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun" },
      { char: "月", meaning: "moon" },
    ],
    mnemonic: "sun and moon together — bright/tomorrow",
  },
  {
    character: "男",
    radical: "田",
    radical_meaning: "field",
    components: [
      { char: "田", meaning: "field" },
      { char: "力", meaning: "strength/power" },
    ],
    mnemonic: "strength in the field — male/man",
  },
  {
    character: "能",
    radical: "肉",
    radical_meaning: "flesh/meat",
    components: [
      { char: "月", meaning: "flesh/meat" },
      { char: "匕", meaning: "spoon/change" },
      { char: "匕", meaning: "bear's paws" },
    ],
    mnemonic: "bear's powerful flesh — can/be able to",
  },
  {
    character: "牛",
    radical: "牛",
    radical_meaning: "cow/ox",
    components: [{ char: "牛", meaning: "cow/ox" }],
  },
  {
    character: "起",
    radical: "走",
    radical_meaning: "walk/run",
    components: [
      { char: "走", meaning: "walk/run" },
      { char: "己", meaning: "self" },
    ],
    mnemonic: "the self setting out walking — rise/get up",
  },
  {
    character: "其",
    radical: "八",
    radical_meaning: "eight/divide",
    components: [
      { char: "甘", meaning: "sweet" },
      { char: "八", meaning: "divide" },
    ],
    mnemonic: "sharing sweetness among others — his/her/its",
  },
  {
    character: "像",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "象", meaning: "elephant/image" },
    ],
    mnemonic: "a person resembling an elephant — resemble/image",
  },
  {
    character: "睡",
    radical: "目",
    radical_meaning: "eye",
    components: [
      { char: "目", meaning: "eye" },
      { char: "垂", meaning: "hang down/droop" },
    ],
    mnemonic: "eyes drooping down — sleep",
  },
  {
    character: "送",
    radical: "辵",
    radical_meaning: "walk/movement",
    components: [
      { char: "辶", meaning: "walk" },
      { char: "关", meaning: "close/pass" },
    ],
    mnemonic: "walking someone through the pass — see off/send",
  },
  {
    character: "虽",
    radical: "虫",
    radical_meaning: "insect/worm",
    components: [
      { char: "虫", meaning: "insect" },
      { char: "唯", meaning: "only" },
    ],
    mnemonic: "even an insect has its ways — although/even though",
  },
  {
    character: "所",
    radical: "户",
    radical_meaning: "door/household",
    components: [
      { char: "户", meaning: "door" },
      { char: "斤", meaning: "axe" },
    ],
    mnemonic: "a door with an axe mark — place/that which",
  },
  {
    character: "跳",
    radical: "足",
    radical_meaning: "foot",
    components: [
      { char: "足", meaning: "foot" },
      { char: "兆", meaning: "omen/billion" },
    ],
    mnemonic: "feet leaping at an omen — jump",
  },
  {
    character: "题",
    radical: "页",
    radical_meaning: "page/head",
    components: [
      { char: "是", meaning: "is/correct" },
      { char: "页", meaning: "page/head" },
    ],
    mnemonic: "the correct heading on a page — topic/problem/title",
  },
  {
    character: "为",
    radical: "爪",
    radical_meaning: "claw/hand",
    components: [
      { char: "爪", meaning: "claw" },
      { char: "勾", meaning: "hook" },
    ],
    mnemonic: "a claw hooking something — for/do/act",
  },
  {
    character: "位",
    radical: "人",
    radical_meaning: "person",
    components: [
      { char: "亻", meaning: "person" },
      { char: "立", meaning: "stand" },
    ],
    mnemonic: "a person standing in their place — position/place (polite measure word for people)",
  },
  {
    character: "往",
    radical: "行",
    radical_meaning: "walk/travel",
    components: [
      { char: "彳", meaning: "step/walk" },
      { char: "主", meaning: "master/lord" },
    ],
    mnemonic: "walking toward the lord/master — go toward",
  },
  {
    character: "忘",
    radical: "心",
    radical_meaning: "heart/mind",
    components: [
      { char: "亡", meaning: "die/lose" },
      { char: "心", meaning: "heart/mind" },
    ],
    mnemonic: "the heart losing something — forget",
  },
  {
    character: "问",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "门", meaning: "gate/door" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "a mouth at the door asking — ask/question",
  },
  {
    character: "西",
    radical: "西",
    radical_meaning: "west",
    components: [{ char: "西", meaning: "west (bird in nest at sunset)" }],
  },
  {
    character: "习",
    radical: "习",
    radical_meaning: "practice",
    components: [
      { char: "羽", meaning: "feather/wing" },
      { char: "白", meaning: "white" },
    ],
    mnemonic: "young bird repeatedly flapping white wings — practice",
  },
  {
    character: "向",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "宀", meaning: "roof" },
      { char: "口", meaning: "mouth/window" },
    ],
    mnemonic: "a window in a roof — face toward/direction",
  },
  {
    character: "校",
    radical: "木",
    radical_meaning: "wood/tree",
    components: [
      { char: "木", meaning: "wood/tree" },
      { char: "交", meaning: "cross/exchange" },
    ],
    mnemonic: "wood where knowledge is exchanged — school",
  },
  {
    character: "需",
    radical: "雨",
    radical_meaning: "rain",
    components: [
      { char: "雨", meaning: "rain" },
      { char: "而", meaning: "and/but" },
    ],
    mnemonic: "like rain, always needed — need/require",
  },
  {
    character: "阳",
    radical: "阜",
    radical_meaning: "mound/hill",
    components: [
      { char: "阝", meaning: "mound/hill" },
      { char: "昜", meaning: "sunlight/open" },
    ],
    mnemonic: "sun on the southern hill side — sun/yang/positive",
  },
  {
    character: "样",
    radical: "木",
    radical_meaning: "wood/tree",
    components: [
      { char: "木", meaning: "wood/tree" },
      { char: "羊", meaning: "sheep" },
    ],
    mnemonic: "fine like sheep or wood grain — appearance/kind/way",
  },
  {
    character: "已",
    radical: "己",
    radical_meaning: "self",
    components: [{ char: "已", meaning: "already/stop" }],
  },
  {
    character: "因",
    radical: "囗",
    radical_meaning: "enclosure",
    components: [
      { char: "囗", meaning: "enclosure" },
      { char: "大", meaning: "big/person" },
    ],
    mnemonic: "a person enclosed by a reason — because/cause",
  },
  {
    character: "用",
    radical: "用",
    radical_meaning: "use",
    components: [{ char: "用", meaning: "use" }],
  },
  {
    character: "游",
    radical: "水",
    radical_meaning: "water",
    components: [
      { char: "氵", meaning: "water" },
      { char: "斿", meaning: "pennant/travel" },
    ],
    mnemonic: "water travel with a pennant — swim/travel/tour",
  },
  {
    character: "又",
    radical: "又",
    radical_meaning: "right hand/again",
    components: [{ char: "又", meaning: "right hand/again" }],
  },
  {
    character: "与",
    radical: "一",
    radical_meaning: "one",
    components: [{ char: "与", meaning: "give/with/and" }],
  },
  {
    character: "鱼",
    radical: "鱼",
    radical_meaning: "fish",
    components: [{ char: "鱼", meaning: "fish" }],
  },
  {
    character: "运",
    radical: "辵",
    radical_meaning: "walk/movement",
    components: [
      { char: "辶", meaning: "walk/movement" },
      { char: "军", meaning: "army/military" },
    ],
    mnemonic: "moving like an army — transport/luck/destiny",
  },
  {
    character: "着",
    radical: "目",
    radical_meaning: "eye",
    components: [
      { char: "羊", meaning: "sheep" },
      { char: "目", meaning: "eye" },
    ],
    mnemonic: "an eye attached to a sheep — attached to/aspect marker",
  },
  {
    character: "找",
    radical: "手",
    radical_meaning: "hand",
    components: [
      { char: "扌", meaning: "hand" },
      { char: "戈", meaning: "spear/halberd" },
    ],
    mnemonic: "hand with a spear searching — look for/find",
  },
  {
    character: "知",
    radical: "矢",
    radical_meaning: "arrow",
    components: [
      { char: "矢", meaning: "arrow" },
      { char: "口", meaning: "mouth" },
    ],
    mnemonic: "words as quick as arrows — know/knowledge",
  },
  {
    character: "直",
    radical: "目",
    radical_meaning: "eye",
    components: [
      { char: "十", meaning: "ten (crosshair)" },
      { char: "目", meaning: "eye" },
    ],
    mnemonic: "an eye looking straight ahead — straight/directly",
  },
  {
    character: "只",
    radical: "口",
    radical_meaning: "mouth",
    components: [
      { char: "口", meaning: "mouth" },
      { char: "八", meaning: "divide" },
    ],
    mnemonic: "a mouth divided to one side — only/just/measure for birds",
  },
  {
    character: "走",
    radical: "走",
    radical_meaning: "walk/run",
    components: [
      { char: "土", meaning: "earth" },
      { char: "止", meaning: "foot/stop" },
    ],
    mnemonic: "a foot on the earth — walk/run/leave",
  },
  {
    character: "最",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun" },
      { char: "取", meaning: "take/obtain" },
    ],
    mnemonic: "taking the sun (topmost thing) — most/extreme",
  },
  {
    character: "昨",
    radical: "日",
    radical_meaning: "sun/day",
    components: [
      { char: "日", meaning: "sun/day" },
      { char: "乍", meaning: "suddenly/first time" },
    ],
    mnemonic: "the day that just appeared — yesterday",
  },

  // ─── Additional important characters ────────────────────────────────────

  {
    character: "日",
    radical: "日",
    radical_meaning: "sun/day",
    components: [{ char: "日", meaning: "sun" }],
  },
  {
    character: "山",
    radical: "山",
    radical_meaning: "mountain",
    components: [{ char: "山", meaning: "mountain" }],
  },
  {
    character: "水",
    radical: "水",
    radical_meaning: "water",
    components: [{ char: "水", meaning: "water" }],
  },
  {
    character: "火",
    radical: "火",
    radical_meaning: "fire",
    components: [{ char: "火", meaning: "fire" }],
  },
  {
    character: "土",
    radical: "土",
    radical_meaning: "earth/soil",
    components: [{ char: "土", meaning: "earth/soil" }],
  },
  {
    character: "木",
    radical: "木",
    radical_meaning: "wood/tree",
    components: [{ char: "木", meaning: "wood/tree" }],
  },
  {
    character: "金",
    radical: "金",
    radical_meaning: "metal/gold",
    components: [{ char: "金", meaning: "metal/gold" }],
  },
  {
    character: "口",
    radical: "口",
    radical_meaning: "mouth",
    components: [{ char: "口", meaning: "mouth" }],
  },
  {
    character: "目",
    radical: "目",
    radical_meaning: "eye",
    components: [{ char: "目", meaning: "eye" }],
  },
  {
    character: "手",
    radical: "手",
    radical_meaning: "hand",
    components: [{ char: "手", meaning: "hand" }],
  },
  {
    character: "足",
    radical: "足",
    radical_meaning: "foot",
    components: [{ char: "足", meaning: "foot" }],
  },
  {
    character: "心",
    radical: "心",
    radical_meaning: "heart/mind",
    components: [{ char: "心", meaning: "heart/mind" }],
  },
  {
    character: "大",
    radical: "大",
    radical_meaning: "big/large",
    components: [{ char: "大", meaning: "big person with arms stretched wide" }],
  },
  {
    character: "力",
    radical: "力",
    radical_meaning: "strength/power",
    components: [{ char: "力", meaning: "strength/power" }],
  },
  {
    character: "田",
    radical: "田",
    radical_meaning: "field",
    components: [{ char: "田", meaning: "field" }],
  },
  {
    character: "马",
    radical: "马",
    radical_meaning: "horse",
    components: [{ char: "马", meaning: "horse" }],
  },
  {
    character: "鸟",
    radical: "鸟",
    radical_meaning: "bird",
    components: [{ char: "鸟", meaning: "bird" }],
  },
];
