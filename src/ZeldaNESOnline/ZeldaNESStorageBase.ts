import * as API from 'ZeldaNES/API/Imports'
import * as CORE from 'ZeldaNES/src/Imports'
import { ZeldaNES } from 'ZeldaNES/ZeldaNES'

import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Init, Preinit, Postinit, onTick, onViUpdate, onCreateResources } from 'modloader64_api/PluginLifecycle';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { countReset } from 'console';

export class ZeldaNESStorageBase {
    inventory: API.IInventory = new CORE.Inventory();
    playerSpriteCache: any = {};
    worldEnemyHealth: Array<Array<number>> = [];
    worldEnemyAlive: Array<Array<number>> = [];
    worldItems: Array<number> = [];
    constructor() {
        for(let n: number = 0; n < 0x180; n++)
        {
            this.worldItems.push(-1);

            this.worldEnemyHealth.push(new Array<number>());
            this.worldEnemyAlive.push(new Array<number>());
            for(let i: number = 0; i < 0x06; i++)
            {
                this.worldEnemyHealth[n].push(0xFF);
                this.worldEnemyAlive[n].push(0xFF);
            }
        }
    }
}