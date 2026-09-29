# 剑与王国和车万女仆修复补丁

> 本仓库收录「剑与王国」整合包 + 「车万女仆」相关的修复补丁与完整排障记录。
>
> **当前收录**：食物 `health_boost` 夹血修复 —— 解决「女仆吃面包反而掉血」「女仆狂啃粮食不干活（包括不砍树）」

> ⚠️ **版权说明**：`files/Item_food_effect.js` 与 `patches/Item_food_effect.patch` 里的脚本本体是**「剑与王国」整合包作者**的作品，这里仅作个人修复记录与问题反馈用，不构成再分发授权。如果正是那位作者、希望我撤下这两个文件，开个 issue 说一声即可。
> 本仓库原创的部分只有：那 **1 行改动**、`apply.cmd`、以及下面这份排障记录。
> 这三样随便用、随便改、不用署名；但请连同上面那条版权说明一起带走，别只搬作者的文件。

把整合包食物系统里的 `health_boost` 换成 `absorption`，一并解决 **吃回血食物反而掉血** 和 **女仆狂啃粮食不干活（包括不砍树）** 两个问题。

- 改动：**1 处代码**（1 行 → 1 行）
- 风险：不新增 mod、不改数值表、可一键回退
- 实测：MC 1.20.1 / Forge 47.4.20 / 车万女仆 1.5.3 / KubeJS 2001.6.5-build.26 / 剑与王国整合包

---

## 症状

1. 给女仆喂面包：**血量高于 20 时会被拍到正好 20**；低于 20 时反而正常回血
2. 女仆**永远吃不满**，背包里的面包被持续啃掉
3. 顺带的现象：女仆**不砍树**（伐木任务已选、铁斧和树苗都齐、`maid_useful_task` 服务端开关 `logging = true` 也开着）

一开始很容易怀疑车万女仆本身、或怀疑某个 mod 改了血量上限。**都不是。**

## 排查过程（含证据）

### ① 先排除「女仆 mod 自己的血量设置」

```
config/touhou_little_maid-common.toml
config/touhou_little_maid/**
```

全文搜索 `health|hp|maxHealth|生命|血量` → **一个血量相关配置项都没有**。TLM 根本不管理女仆的血量上限。

### ② 反编译 TLM 的回血逻辑：它是清白的

```
entity/task/meal/DefaultMaidHealSelfMeal.class
entity/ai/brain/task/MaidHealSelfTask.class
```

用 `javap -c -p` 读字节码，`onMaidEat` 的实质是：

```java
int nutrition   = food.getNutrition();
float saturation = food.getSaturationModifier();
float heal = nutrition + nutrition * saturation * 2f;
if (random(5) < heal) maid.heal(Math.max(heal / 5f, 1f));   // 面包 grade5/sat1 → 回 3 点
```

关键点：用的是 **`heal()`**，只会加、绝不会减血。所以掉血不是它干的。

而 `MaidHealSelfTask.checkExtraStartConditions` 的启动条件是：

```
getHealth() < getMaxHealth()
```

**→ 只要她的"上限"高于"当前血量"，回血进食任务就永远不完成。这解释了症状 2。**

### ③ 排除 KubeJS「谁抬了她的血量上限」

包内确实有一套运行时改 `generic.max_health` 的脚本，但目标是**士兵**，不是女仆：

```
kubejs/server_scripts/global/AttributeEnhancement.js   # 只是工具函数
kubejs/server_scripts/config/ftbCapability.js          # 注释：殖民地建筑对"玩家以及士兵"的加成
kubejs/server_scripts/legion/soldierManagement.js:302  # 只喂给 soldier
```

全脚本搜索 `maid|女仆|touhou` → 唯一命中是 `minecolonies:campshieldmaiden`（MineColonies 的女武神，与车万女仆无关）。

同时用脚本扫了全部 337 个 jar 的 class 常量池找 `max_health|GENERIC_MAX_HEALTH`，命中项全是字符串误报，**没有任何 mod 在改实体血量上限**。

### ④ 真凶：食物表挂了 `health_boost`

```js
// kubejs/startup_scripts/registry/Item_food_effect.js
let duration = 5400                                                   // 22.5 分钟
...
{ lvhEffect: "minecraft:health_boost", id: "minecraft:bread", grade: 5 },   // 面包！
...
if (e.lvhEffect) { food.effect(e.lvhEffect, e.grade * duration, e.grade - 1, 1) }   // ← 问题在这一行
```

全表共有 **30 种食物**挂 `lvhEffect: "minecraft:health_boost"`（面包、曲奇、火鸡大餐、moqueca、farm_and_charm 一整套菜），`grade` 从 2 到 14 不等，**grade 越高抬的上限越多**。

## 根因机制

`minecraft:health_boost` 是**用效果临时抬高 `max_health`** 的效果。而食物附带的效果走的是原版 `MobEffectHandler` 的 **`CLEAR_AND_SET`** 合并方式——**每吃一口都会先移除旧的同名效果，再重新添加**。

移除的那一瞬间，`max_health` 回落到不含效果的基础值，原版 `LivingEntity#synchronizeHealth()` 随即把**当前血量夹到那个基础值**（20）。效果加回去以后上限又变高，但**血量已经停在 20 了**。

于是形成闭环：

```
吃低 grade 食物（面包）顶掉高 grade 菜的上限
   → 上限瞬间回落 → 血量被夹到 20
      → health(20) < maxHealth(30) 依然成立
         → MaidHealSelfTask 继续找吃的 → 再啃一口面包 → 再被夹回 20
            → 无限循环：粮食白烧，她永远"残血"，永远不干工作活
```

**这也解释了症状 3**：她的 AI 一直在优先做"回血进食"，伐木这种工作任务根本没机会执行。修完这个循环，伐木就正常了。

## 修复

只改施加点这一行，30 种食物一起覆盖（**不动那 30 行表**）：

```diff
- if (e.lvhEffect) { food.effect(e.lvhEffect, e.grade * duration, e.grade - 1, 1) }
+ if (e.lvhEffect) { food.effect("minecraft:absorption", e.grade * duration, Math.floor((e.grade - 1) / 2), 1) }
```

为什么是 `absorption`：

- 吸收心是**独立的 `absorption` 属性**，不抬高 `max_health` → **不存在"夹血"这回事**，效果到期也只是那层壳消失
- 不抬上限 → `health < maxHealth` 不再被食物骗住 → **进食循环从结构上消失**
- 仍然保留作者"吃了变肉"的设计意图，手感变化可预期

`amp` 用 `(grade - 1) / 2` 压制过：原 `health_boost` 的 `grade - 1` 直接搬到 absorption 上，高等级菜会给出厚得不像话的盾。

## 没采用的两个方案（以及为什么）

| 方案 | 内容 | 放弃原因 |
|---|---|---|
| 事后补血守卫 | `ItemEvents.foodEaten` 后延迟若干 tick，把被夹掉的血还回去 | 必须先知道 `foodEaten` 与夹血的**先后顺序**（`FoodEatenEventJS` 由 `LivingEntity#eat` 触发，但效果应用在 Forge hook 前还是后无法静态确定）。猜错的后果是要么完全无效、要么把残血 18 一口拉到满血——白送血量。不赌 |
| 禁低 grade 食物当回血餐 | 把面包/曲奇加进 TLM 的 `MaidHealMealsBlockList` | 那只是"根因还在"时的缓解手段。现在根因没了，做了只会缩小女仆能吃的东西 |
| 只删面包的 `lvhEffect` | 最小改动 | 只治面包一种，剩下 29 种照旧（女仆厨房会主动做那些菜） |

## 应用

**方式 A（推荐，带校验和备份）**

```bat
apply.cmd "D:\path\to\instance\versions\你的版本"
```

参数可以是**版本隔离目录**（内含 `kubejs`），也可以是实例根目录（会往 `versions\*` 里找）。脚本会：

1. 用 `certutil` 算出目标文件 SHA-256
2. 与"已知原版哈希"比对，**不一致就拒绝覆盖**（防止踩坏别人改过的文件；确认无误可 `set FORCE=1`）
3. 备份成 `Item_food_effect.js.pre-snk.bak` 后覆盖

**方式 B（git apply，需要 `git` 且文件未被动过）**

```bash
cd "你的版本隔离目录"           # 该目录下应有 kubejs/
git apply --check /path/to/patches/Item_food_effect.patch
git apply /path/to/patches/Item_food_effect.patch
```

补丁与源文件同为 **CRLF** 行尾，已实测：套上去的结果与 `files/Item_food_effect.js` **逐字节一致**（SHA-256 对上 `67b1f9…be903`）。若你的 git 配了 `core.autocrlf` 导致行尾被改写，用 `git apply --ignore-whitespace` 或改用方式 A。

**方式 C（手动）**：用 `files/Item_food_effect.js` 覆盖同名文件（先自己备份）。

### 校验和

| 状态 | SHA-256 |
|---|---|
| 原版 | `7429701408500b9d5fb2692c8d692841c64c5f16fc2cdc4572cbbacac4811fe2` |
| 已打补丁 | `67b1f92a831b5255b33781dda8e2d6cc89e1d43907598d562dd19041326be903` |

> ⚠️ **必须重启游戏**。这是 `startup_scripts`，只在启动时读取，`/reload` 无效。

## 回退

```bat
apply.cmd /revert "D:\path\to\instance\versions\你的版本"
```

或删掉补丁文件、把 `Item_food_effect.js.pre-snk.bak` 改回原名。

## 验证方法

1. 让女仆血量高于 20（先用瞬间治疗药水灌满），喂面包 → **血量不再掉到 20**
2. 观察一段时间 → 不再连续啃面包
3. 把她的工作范围（`MaidWorkRange`，默认 29 格）内放一棵**自然生成的树**，GUI 里工作选「伐木」、Home 模式打开 → 开始砍树并补种树苗

## 副作用

- 这些食物从"红心血条变长"改成"金色吸收心护盾"，受伤时先扣盾；盾到期消失，**不会带走真实血量**
- `grade` 越高盾越厚：grade 5 → amp 2，grade 14 → amp 6
- 同表里 `extraLife: true` 那批（原作者用 amp `grade*3-1`）**未改动**，所以同时带 `lvhEffect` + `extraLife` 的少数菜（如 `farm_and_charm:pasta_with_onion_sauce`）吸收盾会偏厚。嫌厚可以把 `files/Item_food_effect.js` 里 `extraLife` 那行的 `Math.floor((e.grade * 3) - 1)` 一起除以 2
- `client_scripts/tooltip_food.js` 里针对 `effect.minecraft.health_boost` 的 tooltip 分支从此不再触发（无副作用，只是死代码）

## 说明
- 同样的坑对**玩家自己**也成立：吃这类食物时被更高 grade 的效果占位、随后被夹血。本补丁一并解决
- 如果你的包也改了 `Item_food_effect.js`，`apply.cmd` 会因为哈希不匹配而拒绝执行，此时请用方式 B 手动合并那一行
