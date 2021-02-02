import * as API from "ZeldaNES/API/Imports"

export class ZeldaNESStorageBase {
    inventory: API.IInventory;
    constructor(link: API.ILink) {
        this.inventory = link.inventory;
    }
    playerSpriteCache: any = {};
}