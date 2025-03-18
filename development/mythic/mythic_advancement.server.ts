/** @ts-expect-error */
let aio: AIO = {}; 

const SCRIPT_NAME = 'UpgradeUI';
import { Logger } from "../../classes/logger";
const log = new Logger(SCRIPT_NAME);

/**
 * Handles the logic for showing the upgrade UI when a player types .advanceme
 */
const ShowUpgradeUI: player_event_on_command = (event: number, player: Player, command: string): boolean => {
    if (command === "advanceme") {
        log.info(`Showing Upgrade UI for player: ${player.GetName()}`);
        aio.Handle(player, 'UpgradeUI', 'ShowUpgradeWindow');
        return false;
    }
    return true;
};

/**
 * Register the command event to listen for ".advanceme"
 */
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_COMMAND, (...args) => ShowUpgradeUI(...args));

