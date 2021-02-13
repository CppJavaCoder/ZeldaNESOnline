import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { bus, EventHandler } from 'modloader64_api/EventHandler';
import { addresses } from 'ZeldaNES/API/ILink';
import { ZeldaCore } from 'ZeldaNES/API/ZeldaAPI';
import * as API from 'ZeldaNES/API/Imports';
import * as CORE from 'ZeldaNES/src/Imports';
//import { Z64RomTools } from 'Z64Lib/API/Z64RomTools';
import MMOnline from '../../ZeldaNESOnline';
import { ZeldaNESStorageClient } from '@ZeldaNESOnline/ZeldaNESStorageClient';
import { countReset } from 'console';

export class PuppetData {
  sprite: CORE.Sprite;
  modloader: IModLoaderAPI;
  constructor(mlapi: IModLoaderAPI) {
    this.sprite = new CORE.Sprite("mods/link.bmp", 16, 16, 4, 8);
    this.modloader = mlapi;
  }
}