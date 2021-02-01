import * as API from "libs\\ZeldaNES/cores/ZeldaNES/API/Imports"

export class ZeldaNESStorageBase {
    constructor() {}
    playerSpriteCache: any = {};
    update(inventory: API.IInventory): void {};
}