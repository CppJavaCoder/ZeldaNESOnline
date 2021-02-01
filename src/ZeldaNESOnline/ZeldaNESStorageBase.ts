import * as API from "ZeldaNES/API/Imports"

export class ZeldaNESStorageBase {
    constructor() {}
    playerSpriteCache: any = {};
    update(inventory: API.IInventory): void {};
}