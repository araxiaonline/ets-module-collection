
// This gives reward chests a glow on spawn to signify their value, using invisible creatures to cast the visual spell.

const InvisTrigger = 12999;

const VisualSpells = {
    "SmokeAuraBlue": 12898,
    "HellfireWarding": 33827, 
    "GhostVisualRed": 35847,
};

const RewardChests = {
    "Normal": 951002,
    "Elite": 951000,
    "Badass": 951004
}

const showVisualSpell: gameobject_event_on_spawn = (event: number, gameObject: GameObject) => {

    const invisCaster = gameObject.SpawnCreature(InvisTrigger, gameObject.GetX(), gameObject.GetY(), gameObject.GetZ(), 0, TempSummonType.TEMPSUMMON_MANUAL_DESPAWN);

    const entry = gameObject.GetEntry();
    PrintInfo(`Entry: ${entry}`);

    switch(entry) {
        case RewardChests.Normal:
            invisCaster.CastSpellAoF(gameObject.GetX(), gameObject.GetY(), gameObject.GetZ(), VisualSpells.SmokeAuraBlue);
            break;
        case RewardChests.Elite:
            invisCaster.CastSpellAoF(gameObject.GetX(), gameObject.GetY(), gameObject.GetZ(), VisualSpells.GhostVisualRed);
            break;
        case RewardChests.Badass:
            invisCaster.SetScale(2);
            invisCaster.CastSpell(invisCaster, VisualSpells.HellfireWarding);
            break;
        default:
            break;
    }
    
};

const removeVisualSpell: gameobject_event_on_use = (event: number, gameObject: GameObject) => {
    const creatures = gameObject.GetCreaturesInRange(3, InvisTrigger);
    
    for(let i = 0; i < creatures.length; i++) {
        creatures[i].DespawnOrUnsummon();
    }    
    return false;
};

// Register All visuals by chest. 
RegisterGameObjectEvent(RewardChests.Normal, GameObjectEvents.GAMEOBJECT_EVENT_ON_SPAWN, (...args) => showVisualSpell(...args));
RegisterGameObjectEvent(RewardChests.Normal, GameObjectEvents.GAMEOBJECT_EVENT_ON_USE, (...args) => removeVisualSpell(...args));

RegisterGameObjectEvent(RewardChests.Elite, GameObjectEvents.GAMEOBJECT_EVENT_ON_SPAWN, (...args) => showVisualSpell(...args));
RegisterGameObjectEvent(RewardChests.Elite, GameObjectEvents.GAMEOBJECT_EVENT_ON_USE, (...args) => removeVisualSpell(...args));

RegisterGameObjectEvent(RewardChests.Badass, GameObjectEvents.GAMEOBJECT_EVENT_ON_SPAWN, (...args) => showVisualSpell(...args));
RegisterGameObjectEvent(RewardChests.Badass,GameObjectEvents.GAMEOBJECT_EVENT_ON_USE, (...args) => removeVisualSpell(...args));
