import * as API from "ZeldaNES/API/Imports"
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Init, Preinit, Postinit, onTick, onViUpdate, onCreateResources } from 'modloader64_api/PluginLifecycle';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';

export class ZeldaNESStorageBase {
    inventory: API.IInventory;
    constructor() {
        this.inventory = null as unknown as API.IInventory;
    }
    setInventory(inv: API.IInventory): void {
        this.inventory = inv;
    }
    playerSpriteCache: any = {};
}