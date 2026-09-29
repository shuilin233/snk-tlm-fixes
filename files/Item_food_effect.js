let duration = 5400

let FoodBuilder = Java.loadClass("dev.latvian.mods.kubejs.item.FoodBuilder")

function findFoodPropertiesField(item) {
    let clazz = item.getClass()
    while (clazz != null) {
        try {
            let field = clazz.getDeclaredField("f_41380_")
            field.setAccessible(true)
            return field
        } catch (error) {
            clazz = clazz.getSuperclass()
        }
    }
    return null
}

function applyFoodProperties(itemId, item, foodHandler) {
    try {
        let foodPropertiesField = findFoodPropertiesField(item)
        if (foodPropertiesField == null) {
            throw `FoodProperties field not found on ${item.getClass().getName()}`
        }
        let food = new FoodBuilder(foodPropertiesField.get(item))
        foodHandler(food)
        foodPropertiesField.set(item, food.build())
    } catch (error) {
        console.warn(`[SNK Food] Skipped food property modification for ${itemId}: ${error}`)
    }
}

let foodList = [
    { detoxify: true, extraLife: true, id: "farm_and_charm:onion_soup", grade: 7 },
    { detoxify: true, id: "crockpot:asparagus_soup", grade: 4 },
    { detoxify: true, id: "crockpot:asparagus", grade: 3 },
    { detoxify: true, id: "crockpot:garlic", grade: 3 },
    { detoxify: true, id: "farm_and_charm:onion", grade: 2 },
    { drinks: true, detoxify: true, lv1Effect: "minecraft:fire_resistance", id: "crockpot:gazpacho", grade: 4 },
    { drinks: true, effect1: "minecraft:regeneration", detoxify: true, id: "snk:birch_liquid", grade: 4 },
    { drinks: true, effect1: "minecraft:regeneration", extraLife: true, id: "snk:dandelion_tea", grade: 4 },
    { drinks: true, effect1: "minecraft:regeneration", health: true, id: "snk:chrysanthemum_tea", grade: 4 },
    { drinks: true, effect1: "minecraft:speed", id: "crockpot:fruit_medley", grade: 8 },
    { drinks: true, lvhEffect: "minecraft:health_boost", effect1: "minecraft:glowing", id: "crockpot:glow_berry_mousse", grade: 6 },
    { effect1: "crockpot:wither_resistance", id: "crockpot:mushy_cake", grade: 6 },
    { effect1: "minecraft:absorption", health: true, id: "crockpot:california_roll", grade: 10 },
    { effect1: "minecraft:haste", id: "crockpot:salsa", grade: 7 },
    { effect1: "minecraft:regeneration", effect2: "crockpot:well_fed", id: "crockpot:bunny_stew", grade: 6 },
    { effect1: "minecraft:regeneration", effect2: "parcool:inexhaustible", id: "bakery:apple_cupcake", grade: 6 },
    { effect1: "minecraft:regeneration", effect2: "parcool:inexhaustible", id: "bakery:strawberry_cupcake", grade: 6 },
    { effect1: "minecraft:regeneration", effect2: "parcool:inexhaustible", id: "bakery:sweetberry_cupcake", grade: 6 },
    { effect1: "minecraft:regeneration", health: true, id: "crockpot:flower_salad", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:bread_with_jam", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:chocolate_glazed_cookie", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:cornet", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:jam_roll", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:misslilitu_biscuit", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:strawberry_glazed_cookie", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:sweetberry_glazed_cookie", grade: 6 },
    { effect1: "minecraft:regeneration", id: "bakery:waffle", grade: 6 },
    { effect1: "minecraft:regeneration", id: "crockpot:jammy_preserves", grade: 6 },
    { effect1: "minecraft:regeneration", id: "farm_and_charm:strawberry", grade: 2 },
    { effect1: "minecraft:regeneration", id: "minecraft:apple", grade: 4 },
    { effect1: "minecraft:regeneration", id: "minecraft:chorus_fruit", grade: 4 },
    { effect1: "minecraft:regeneration", id: "minecraft:glow_berries", grade: 2 },
    { effect1: "minecraft:regeneration", id: "minecraft:melon_slice", grade: 2 },
    { effect1: "minecraft:regeneration", id: "minecraft:sweet_berries", grade: 2 },
    { effect1: "minecraft:regeneration", id: "quark:ancient_fruit", grade: 4 },
    { effect1: "minecraft:resistance", detoxify: true, id: "crockpot:potato_tornado", grade: 8 },
    { effect1: "minecraft:resistance", detoxify: true, id: "crockpot:pumpkin_cookie", grade: 10 },
    { effect1: "minecraft:resistance", extraLife: true, id: "crockpot:ceviche", grade: 7 },
    { effect1: "minecraft:resistance", extraLife: true, id: "farm_and_charm:potato_soup", grade: 5 },
    { effect1: "minecraft:resistance", id: "crockpot:mashed_potatoes", grade: 9 },
    { effect1: "minecraft:resistance", id: "crockpot:potato_souffle", grade: 8 },
    { effect1: "minecraft:resistance", id: "crockpot:tomato", grade: 3 },
    { effect1: "minecraft:resistance", id: "minecraft:baked_potato", grade: 5 },
    { effect1: "minecraft:resistance", id: "minecraft:pumpkin_pie", grade: 8 },
    { effect1: "minecraft:speed", effect2: "minecraft:regeneration", health: true, id: "crockpot:surf_n_turf", grade: 10 },
    { effect1: "minecraft:speed", effect2: "minecraft:strength", id: "farm_and_charm:potato_with_roast_meat", grade: 7 },
    { effect1: "minecraft:speed", effect2: "parcool:inexhaustible", id: "bakery:chocolate_cake_slice", grade: 6 },
    { effect1: "minecraft:speed", effect2: "parcool:inexhaustible", id: "bakery:chocolate_gateau_slice", grade: 6 },
    { effect1: "minecraft:speed", effect2: "parcool:inexhaustible", id: "bakery:strawberry_cake_slice", grade: 6 },
    { effect1: "minecraft:speed", effect2: "parcool:inexhaustible", id: "bakery:sweetberry_cake_slice", grade: 6 },
    { effect1: "minecraft:speed", extraLife: true, id: "bakery:apple_pie_slice", grade: 6 },
    { effect1: "minecraft:speed", extraLife: true, id: "bakery:bundt_cake_slice", grade: 6 },
    { effect1: "minecraft:speed", extraLife: true, id: "bakery:chocolate_tart_slice", grade: 6 },
    { effect1: "minecraft:speed", extraLife: true, id: "bakery:glowberry_pie_slice", grade: 6 },
    { effect1: "minecraft:speed", extraLife: true, id: "bakery:linzer_tart_slice", grade: 6 },
    { effect1: "minecraft:speed", health: true, id: "crockpot:stuffed_eggplant", grade: 7 },
    { effect1: "minecraft:speed", id: "bakery:pudding_slice", grade: 6 },
    { effect1: "minecraft:speed", id: "crockpot:eggplant", grade: 3 },
    { effect1: "minecraft:speed", id: "crockpot:popcorn", grade: 3 },
    { effect1: "minecraft:speed", id: "farm_and_charm:corn", grade: 2 },
    { effect1: "minecraft:speed", id: "farm_and_charm:farmer_salad", grade: 7 },
    { effect1: "minecraft:speed", id: "farm_and_charm:lettuce", grade: 3 },
    { effect1: "minecraft:speed", id: "minecraft:carrot", grade: 3 },
    { effect1: "minecraft:speed", id: "minecraft:dried_kelp", grade: 2 },
    { effect1: "minecraft:speed", lvhEffect: "minecraft:health_boost", id: "crockpot:turkey_dinner", grade: 12 },
    { effect1: "minecraft:strength", effect2: "minecraft:speed", extraLife: true, id: "farm_and_charm:goulash", grade: 8 },
    { effect1: "minecraft:strength", effect2: "minecraft:speed", id: "farm_and_charm:beef_patty_with_vegetables", grade: 6 },
    { effect1: "minecraft:strength", effect2: "minecraft:speed", id: "farm_and_charm:stuffed_chicken", grade: 6 },
    { effect1: "minecraft:strength", effect2: "minecraft:speed", id: "farm_and_charm:stuffed_rabbit", grade: 9 },
    { effect1: "minecraft:strength", extraLife: true, health: true, id: "crockpot:honey_ham", grade: 12 },
    { effect1: "minecraft:strength", extraLife: true, health: true, id: "crockpot:honey_nuggets", grade: 8 },
    { effect1: "minecraft:strength", extraLife: true, id: "minecraft:rabbit_stew", grade: 10 },
    { effect1: "minecraft:strength", health: true, id: "crockpot:bacon_eggs", grade: 12 },
    { effect1: "minecraft:strength", health: true, id: "crockpot:bone_stew", grade: 20 },
    { effect1: "minecraft:strength", id: "crockpot:breakfast_skillet", grade: 8 },
    { effect1: "minecraft:strength", id: "crockpot:cooked_egg", grade: 3 },
    { effect1: "minecraft:strength", id: "crockpot:cooked_frog_legs", grade: 5 },
    { effect1: "minecraft:strength", id: "crockpot:cooked_hoglin_nose", grade: 8 },
    { effect1: "minecraft:strength", id: "crockpot:kabobs", grade: 7 },
    { effect1: "minecraft:strength", id: "crockpot:meat_balls", grade: 9 },
    { effect1: "minecraft:strength", id: "crockpot:monster_tartare", grade: 8 },
    { effect1: "minecraft:strength", id: "farm_and_charm:bacon_with_eggs", grade: 6 },
    { effect1: "minecraft:strength", id: "farm_and_charm:baked_lamb_ham", grade: 8 },
    { effect1: "minecraft:strength", id: "farm_and_charm:chicken_wrapped_in_bacon", grade: 12 },
    { effect1: "minecraft:strength", id: "farm_and_charm:roasted_chicken", grade: 6 },
    { effect1: "minecraft:strength", id: "minecraft:cooked_beef", grade: 8 },
    { effect1: "minecraft:strength", id: "minecraft:cooked_chicken", grade: 6 },
    { effect1: "minecraft:strength", id: "minecraft:cooked_mutton", grade: 6 },
    { effect1: "minecraft:strength", id: "minecraft:cooked_porkchop", grade: 8 },
    { effect1: "minecraft:strength", id: "minecraft:cooked_rabbit", grade: 5 },
    { effect1: "minecraft:strength", id: "untitledduckmod:cooked_duck", grade: 6 },
    { effect1: "minecraft:strength", id: "untitledduckmod:cooked_goose", grade: 8 },
    { effect1: "parcool:inexhaustible", detoxify: true, id: "crockpot:ice_cream", grade: 4 },
    { effect1: "parcool:inexhaustible", detoxify: true, id: "crockpot:taffy", grade: 5 },
    { effect1: "parcool:inexhaustible", extraLife: true, id: "minecraft:beetroot_soup", grade: 6 },
    { effect1: "parcool:inexhaustible", id: "minecraft:beetroot", grade: 2 },
    { effect1: "parcool:inexhaustible", lvhEffect: "minecraft:health_boost", id: "farm_and_charm:oatmeal_with_strawberries", grade: 4 },
    { extraLife: true, id: "crockpot:bone_soup", grade: 10 },
    { extraLife: true, id: "crockpot:ratatouille", grade: 6 },
    { extraLife: true, id: "farm_and_charm:corn_grits", grade: 6 },
    { extraLife: true, id: "farm_and_charm:simple_tomato_soup", grade: 6 },
    { extraLife: true, id: "minecraft:mushroom_stew", grade: 6 },
    { health: true, id: "crockpot:snake_bone_soup", grade: 5 },
    { lv1Effect: "minecraft:fire_resistance", effect1: "minecraft:strength", effect2: "minecraft:haste", id: "crockpot:hot_chili", grade: 9 },
    { lv1Effect: "minecraft:fire_resistance", effect1: "minecraft:strength", id: "crockpot:pepper_popper", grade: 8 },
    { lv1Effect: "minecraft:fire_resistance", id: "call_of_yucutan:chili_pepper", grade: 4 },
    { lv1Effect: "minecraft:night_vision", effect1: "crockpot:ocean_affinity", id: "crockpot:tropical_bouillabaisse", grade: 7 },
    { lv1Effect: "minecraft:night_vision", effect1: "minecraft:regeneration", id: "crockpot:fish_sticks", grade: 7 },
    { lv1Effect: "minecraft:night_vision", effect1: "minecraft:regeneration", id: "crockpot:seafood_gumbo", grade: 9 },
    { lv1Effect: "minecraft:night_vision", health: true, id: "crockpot:fish_tacos", grade: 8 },
    { lv1Effect: "minecraft:night_vision", health: true, id: "crockpot:salmon_sushi", grade: 5 },
    { lv1Effect: "minecraft:night_vision", id: "farm_and_charm:cooked_cod", grade: 7 },
    { lv1Effect: "minecraft:night_vision", id: "farm_and_charm:cooked_salmon", grade: 7 },
    { lv1Effect: "minecraft:night_vision", id: "farm_and_charm:oat_pancake", grade: 5 },
    { lv1Effect: "minecraft:night_vision", id: "minecraft:cooked_cod", grade: 5 },
    { lv1Effect: "minecraft:night_vision", id: "minecraft:cooked_salmon", grade: 6 },
    { lv1Effect: "minecraft:night_vision", id: "quark:cooked_crab_leg", grade: 8 },
    { lv1Effect: "minecraft:night_vision", lvhEffect: "minecraft:health_boost", health: true, id: "crockpot:moqueca", grade: 14 },
    { lvhEffect: "minecraft:health_boost", detoxify: true, extraLife: true, id: "farm_and_charm:pasta_with_onion_sauce", grade: 6 },
    { lvhEffect: "minecraft:health_boost", effect1: "minecraft:regeneration", effect2: "parcool:inexhaustible", id: "farm_and_charm:grandmothers_strawberry_cake", grade: 4 },
    { lvhEffect: "minecraft:health_boost", effect1: "minecraft:resistance", id: "farm_and_charm:barley_patties_with_potatoes", grade: 5 },
    { lvhEffect: "minecraft:health_boost", effect1: "minecraft:strength", id: "farm_and_charm:lamb_with_corn", grade: 8 },
    { lvhEffect: "minecraft:health_boost", effect1: "minecraft:strength", id: "farm_and_charm:sausage_with_oat_patty", grade: 8 },
    { lvhEffect: "minecraft:health_boost", extraLife: true, id: "farm_and_charm:barley_soup", grade: 5 },
    { lvhEffect: "minecraft:health_boost", health: true, id: "crockpot:perogies", grade: 8 },
    { lvhEffect: "minecraft:health_boost", health: true, id: "crockpot:steamed_ham_sandwich", grade: 10 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:baguette", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:braided_bread", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:bread", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:bun", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:croissant", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:crusty_bread", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:grilled_bacon_sandwich", grade: 10 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:grilled_salmon_sandwich", grade: 10 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:sandwich", grade: 10 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:toast", grade: 8 },
    { lvhEffect: "minecraft:health_boost", id: "bakery:vegetable_sandwich", grade: 10 },
    { lvhEffect: "minecraft:health_boost", id: "crockpot:froggle_bunwich", grade: 7 },
    { lvhEffect: "minecraft:health_boost", id: "farm_and_charm:farmers_bread", grade: 6 },
    { lvhEffect: "minecraft:health_boost", id: "farm_and_charm:roasted_corn", grade: 5 },
    { lvhEffect: "minecraft:health_boost", id: "minecraft:bread", grade: 5 },
    { lvhEffect: "minecraft:health_boost", id: "minecraft:cookie", grade: 2 },
    { lvhEffect: "minecraft:health_boost", lv1Effect: "farm_and_charm:farmers_blessing", id: "farm_and_charm:farmers_breakfast", grade: 16 },

    { effect1: "parcool:inexhaustible", effect2: "minecraft:speed", id: "born_in_chaos_v1:coffee_candy", grade: 3 },
    { effect1: "parcool:inexhaustible", effect2: "born_in_chaos_v1:vampiric_touch", id: "born_in_chaos_v1:gummy_vampire_teeth", grade: 3 },
    { effect1: "parcool:inexhaustible", health: true, id: "born_in_chaos_v1:chocolate_heart", grade: 3 },
    { effect1: "parcool:inexhaustible", effect2: "minecraft:fire_resistance", id: "born_in_chaos_v1:caramel_pepper", grade: 3 },

    { lv1Effect: "minecraft:night_vision", id: "cataclysm:amethyst_crab_meat", grade: 6 },
    { lv1Effect: "minecraft:night_vision", effect1: "cataclysm:blessing_of_amethyst", id: "cataclysm:blessed_amethyst_crab_meat", grade: 6 },
]

foodList.forEach(e => {
    let saturation = 1
    if (e.grade < 2) { saturation = 3 }
    else if (e.grade < 4) { saturation = 1.5 }
    else if (e.grade >= 8) { saturation = 1.2 }
    ItemEvents.modification(event => {
        event.modify(e.id, item => {
            applyFoodProperties(e.id, item, food => {
                if (e.drinks) {
                    food.alwaysEdible(true)
                } else {
                    food.hunger(e.grade)
                    food.saturation(saturation)
                    food.alwaysEdible(false)
                }
                if (e.grade < 4) { food.fastToEat(true) }
                if (e.effect1) { food.effect(e.effect1, e.grade * duration, 0, 1) }
                if (e.effect2) { food.effect(e.effect2, e.grade * duration, 0, 1) }
                if (e.lv1Effect) { food.effect(e.lv1Effect, e.grade * duration, 0, 1) }
                // SNK 补丁：原本这里施加 lvhEffect(minecraft:health_boost)。
                // health_boost 是用「效果」临时抬高 max_health，而食物效果走 CLEAR_AND_SET：
                // 每吃一口都会先清掉旧效果再重设，上限瞬间回落的那一刻原版 synchronizeHealth()
                // 会把当前血量夹回真实上限 —— 表现为"血量高于 20 时吃面包反而掉到 20"，
                // 同时让女仆的回血进食任务(MaidHealSelfTask: health < maxHealth)永远完不成 → 无限啃面包。
                // 换成 absorption：同样是"吃了变肉"，但不抬高 maxHealth，
                // 因此既不存在夹血，也不会让女仆把抬高的上限误判成残血。
                // amp 用 (grade-1)/2 压制，避免高等级菜给出过厚吸收盾。回退：还原 .js.bak
                if (e.lvhEffect) { food.effect("minecraft:absorption", e.grade * duration, Math.floor((e.grade - 1) / 2), 1) }
                if (e.extraLife) { food.effect("minecraft:absorption", e.grade * duration, Math.floor((e.grade * 3) - 1), 1) }
                if (e.health) { food.effect("minecraft:instant_health", 1, Math.floor((e.grade * 3) - 1), 1) }
                if (e.detoxify) {
                    food.removeEffect("minecraft:hunger") // 饥饿
                    if (e.grade >= 3) {
                        food.removeEffect("minecraft:nausea") // 反胃
                    }
                    if (e.grade >= 4) {
                        food.removeEffect("minecraft:poison") // 中毒   
                    }
                    if (e.grade >= 5) {
                        food.removeEffect("minecraft:wither") // 凋零
                    }
                    if (e.grade >= 6) {
                        food.removeEffect("minecraft:slowness") // 缓慢
                    }
                    if (e.grade >= 7) {
                        food.removeEffect("minecraft:weakness") // 虚弱
                    }
                    if (e.grade >= 8) {
                        food.removeEffect("minecraft:mining_fatigue") // 挖掘疲劳
                    }
                    if (e.grade >= 9) {
                        food.removeEffect("minecraft:blindness") // 失明
                    }
                    if (e.grade >= 10) {
                        food.removeEffect("minecraft:levitation") // 漂浮
                    }
                }
            })
        })
    })
})

ItemEvents.modification(event => {
    event.modify([
        "minecraft:rotten_flesh",
    ], item => {
        applyFoodProperties("minecraft:rotten_flesh", item, food => {
            food.hunger(4)
            food.saturation(1)
            food.effect("minecraft:nausea", 1200, 0, 1)
            food.removeEffect("minecraft:speed")
            food.removeEffect("minecraft:haste")
            food.removeEffect("minecraft:strength")
            food.removeEffect("minecraft:jump_boost")
            food.removeEffect("minecraft:regeneration")
            food.removeEffect("minecraft:resistance")
            food.removeEffect("minecraft:fire_resistance")
            food.removeEffect("minecraft:water_breathing")
            food.removeEffect("minecraft:invisibility")
            food.removeEffect("minecraft:night_vision")
            food.removeEffect("minecraft:health_boost")
            food.removeEffect("minecraft:absorption")
            food.removeEffect("minecraft:luck")
            food.removeEffect("farm_and_charm:farmers_blessing")
            food.removeEffect("farm_and_charm:grandmas_blessing")
            food.removeEffect("crockpot:wither_resistance")
            food.removeEffect("crockpot:well_fed")
            food.removeEffect("crockpot:ocean_affinity")
        })
    })
})