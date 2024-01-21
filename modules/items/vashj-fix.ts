const TaintedKill: player_event_on_kill_creature = (event, player, creature) => {
    if(creature.GetEntry() == 22009) {
        player.AddItem(31088, 1);
    }
}; 

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE,
    (...args) => TaintedKill(...args)
);


const healMe: creature_event_on_damage_taken = (event, creature, attacker, damage) => {

    creature.SetHealth(creature.GetMaxHealth());
    return false; 
}

const onSpawn: creature_event_on_spawn = (event, creature) => {
    creature.SetMaxHealth(creature.GetMaxHealth() * 3);
    return false;
}

const onSpawn2: creature_event_on_spawn = (event, creature) => {
    creature.SetMaxHealth(creature.GetMaxHealth() / 5);    
    return false;
}

const onSpellHit: creature_event_on_spell_hit_target = (event, creature, target, spell) => {
    return true;

}

const onDmg: creature_event_on_damage_taken = (event, creature, player, damage) => {    
    player.DealDamage(creature, damage * 10, false, 0); 
    return true; 
}

RegisterCreatureEvent(
    24891,
    CreatureEvents.CREATURE_EVENT_ON_DAMAGE_TAKEN,
    (...args) => healMe(...args)
)

RegisterCreatureEvent(
    24891,
    CreatureEvents.CREATURE_EVENT_ON_SPAWN,
    (...args) => onSpawn(...args)
)

RegisterCreatureEvent(
    25268,
    CreatureEvents.CREATURE_EVENT_ON_SPAWN,
    (...args) => onSpawn2(...args)
)

RegisterCreatureEvent(
    25038,
    CreatureEvents.CREATURE_EVENT_ON_SPELL_HIT_TARGET,
    (...args) => onSpellHit(...args)
)

RegisterCreatureEvent(
    25038,
    CreatureEvents.CREATURE_EVENT_ON_DAMAGE_TAKEN,
    (...args) => onDmg(...args)
)