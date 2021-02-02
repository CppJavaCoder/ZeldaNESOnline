import * as API from "libs\\ZeldaNES/cores/ZeldaNES/API/Imports"

export class ZeldaNESStorageBase {
    inventory: API.IInventory;
    constructor(link: API.ILink) {
        this.inventory = link.inventory;
    }
    playerSpriteCache: any = {};
}