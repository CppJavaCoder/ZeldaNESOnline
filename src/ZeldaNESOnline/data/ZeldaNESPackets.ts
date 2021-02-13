import {
  Packet,
  packetHelper,
  UDPPacket,
} from 'modloader64_api/ModLoaderDefaultImpls';
import { PuppetData } from './linkPuppet/PuppetData';
//import { HorseData } from './linkPuppet/HorseData';
//  import { InventorySave, IEquipmentSave, IQuestSave, IDungeonItemSave, PhotoSave, SkullSave, StraySave } from './MMOSaveData';
import * as API from 'ZeldaNES/API/Imports';
import * as CORE from 'ZeldaNES/src/Imports';
import { INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { countReset } from 'console';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { IInventory } from 'ZeldaNES/API/Imports';
import { disconnect } from 'process';
import { ColorEditFlags } from 'modloader64_api/Sylvain/ImGui';

export class ZeldaNES_Message extends Packet {
  message: string;
  constructor(message: string, lobby: string)
  {
    super("ZeldaNES_Message", "ZeldaNES", lobby, false);
    this.message = message;
  }
}

export class ZeldaNES_Sprite extends Packet {
  spr: API.ISprite;
  worldpos: number;
  returnData: boolean;
  constructor(spr: API.ISprite, worldpos: number, returnData: boolean, lobby: string)
  {
    super("ZeldaNES_Sprite", "ZeldaNES", lobby, false);
    this.spr = spr;
    this.worldpos = worldpos;
    this.returnData = returnData;
  }
}
export class ZeldaNES_Inventory extends Packet {
  inv: API.IInventory;
  returnData: boolean;
  constructor(inv: API.IInventory, returnData: boolean, lobby: string)
  {
    super("ZeldaNES_Inventory", "ZeldaNES", lobby, false);
    this.inv = inv;
    this.returnData = returnData;
  }
}
export enum ItemType{
  Bomb = 'ZeldaNES_Bomb', Rupee = 'ZeldaNES_Rupee', Key = 'ZeldaNES_Key', Potion = 'ZeldaNES_Potion', Heart = 'ZeldaNES_Heart', pHeart = 'ZeldaNES_Heart_Fraction'
}
export class ZeldaNES_Expendable extends Packet {
    add: number;
    type: ItemType;
    inv: API.IInventory;
    constructor(type: ItemType, add: number, lobby: string, option: API.IInventory = null as unknown as API.IInventory)
    {
      super('ZeldaNES_Expendable', "ZeldaNES", lobby, false);
      this.type = type;
      this.add = add;
      this.inv = option;
    }
}
export class ZeldaNES_Rupee extends ZeldaNES_Expendable {
  constructor(add: number, lobby: string)
  {
    super(ItemType.Rupee, add, lobby);
  }
}
export class ZeldaNES_Bomb extends ZeldaNES_Expendable {
  constructor(add: number, lobby: string)
  {
    super(ItemType.Bomb, add, lobby);
  }
}
export class ZeldaNES_Key extends ZeldaNES_Expendable {
  constructor(add: number, lobby: string)
  {
    super(ItemType.Key, add, lobby);
  }
}
export class ZeldaNES_Heart extends ZeldaNES_Expendable {
  constructor(add: number, lobby: string)
  {
    super(ItemType.Heart, add, lobby);
  }
}
export class ZeldaNES_pHeart extends ZeldaNES_Expendable {
  constructor(add: number, lobby: string)
  {
    super(ItemType.pHeart, add, lobby);
  }
}
export class ZeldaNES_Potion extends ZeldaNES_Expendable {
  constructor(add: number, lobby: string)
  {
    super(ItemType.Potion, add, lobby);
  }
}

export class ZeldaNES_EnemyUpdate extends Packet {
    worldPos: number;
    addLife: number;
    enemy: number;
    constructor(pos: number, add: number, enemy: number, lobby: string)
    {
      super('ZeldaNES_EnemyUpdate', "ZeldaNES", lobby, false);
      this.worldPos = pos;
      this.addLife = add;
      this.enemy = enemy;
    }
}

export class ZeldaNES_MapPeice extends Packet {
  enemyHp: Array<number>;
  enemyAlive: Array<number>;
  worldPos: number;
  roomItem: number;
  returnData: boolean;
  constructor(pos: number, item: number, hp: Array<number>, alive: Array<number>, flag: boolean, lobby: string)
  {
    super('ZeldaNES_MapPeice', "ZeldaNES", lobby, false);
    this.worldPos = pos;
    this.enemyHp = hp;
    this.enemyAlive = alive;
    this.returnData = flag;
    this.roomItem = item;
  }
}
export class ZeldaNES_UnlockMe extends Packet {
  keycode: number;
  worldpos: number;
  constructor(keycode: number, worldpos: number, lobby: string) {
    super('ZeldaNES_UnlockMe', "ZeldaNES", lobby, false);
    this.keycode = keycode;
    this.worldpos = worldpos;
  }
}
export class ZeldaNES_WholeMap extends Packet {
  enemyHp: Array<Array<number>>;
  enemyAlive: Array<Array<number>>;
  roomItem: Array<number>;
  constructor(roomItem: Array<number>, hp: Array<Array<number>>, alive: Array<Array<number>>, lobby: string) {
    super('ZeldaNES_WholeMap', "ZeldaNES", lobby, false);
    this.enemyHp = hp;
    this.enemyAlive = alive;
    this.roomItem = roomItem;
  }
}
export function updateChangeableInventory(inv1: API.IInventory, inv2: API.IInventory)
{
    //To be manually synced list
    inv2.bombs = inv1.bombs;
    inv2.rupees = inv1.rupees;
    inv2.keys = inv1.keys;
    inv2.potion = inv1.potion;
    inv2.hearts = inv1.hearts;
    inv2.pHeart = inv1.pHeart;
    //End of To be manually synced list
}
export function updateInventory(inv1: API.IInventory, inv2: API.IInventory)
{

    if(inv1.sword > inv2.sword)
        inv2.sword = inv1.sword;
    if(inv1.arrow > inv2.arrow)
        inv2.arrow = inv1.arrow;
    if(inv1.hasBow)
        inv2.hasBow = true;
    if(inv1.candle > inv2.candle)
        inv2.candle = inv1.candle;
    if(inv1.hasWhistle)
        inv2.hasWhistle = true;
    
    if(inv1.hasFood)
        inv2.hasFood = true;
    if(inv1.hasRod)
        inv2.hasRod = true;
    if(inv1.hasRaft)
        inv2.hasRaft = true;
    if(inv1.hasBook)
        inv2.hasBook = true;
    if(inv1.ring > inv2.ring)
        inv2.ring = inv1.ring;
    if(inv1.hasLadder)
        inv2.hasLadder = true;
    if(inv1.hasKey)
        inv2.hasKey = true;
    if(inv1.hasPower)
        inv2.hasPower = true;
    if(inv1.letter > inv2.letter)
        inv2.letter = inv1.letter;
    for(let n = 0; n < 8; n++)
        if(inv1.compass | (0x01 << n) && !(inv2.compass | (0x01 << n)))
            inv2.compass += 0x01 << n;

    for(let n = 0; n < 8; n++)
        if(inv1.map | (0x01 << n) && !(inv2.map | (0x01 << n)))
            inv2.map += 0x01 << n;
    if(inv1.hasL9comp)
        inv2.hasL9comp = true;
    if(inv1.hasL9map)
        inv2.hasL9map = true;
    if(inv1.containers > inv2.containers)
        inv2.containers = inv1.containers;
    
    if(inv1.triforces > inv2.triforces)
        inv2.triforces = inv1.triforces
    if(inv1.hasBoom)
        inv2.hasBoom = true;
    if(inv1.hasMagicBoom)
        inv2.hasMagicBoom = true;
    if(inv1.hasMagicShield)
        inv2.hasMagicShield = true;
    if(inv1.bombBag > inv2.bombBag)
        inv2.bombBag = inv1.bombBag;
}