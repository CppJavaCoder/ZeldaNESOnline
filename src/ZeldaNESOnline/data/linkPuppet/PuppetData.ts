import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { bus, EventHandler } from 'modloader64_api/EventHandler';
import { addresses } from 'libs\\ZeldaNES/cores/ZeldaNES/API/ILink';
import { ZeldaCore } from 'libs\\ZeldaNES/cores/ZeldaNES/API/ZeldaAPI';
import * as API from 'libs\\ZeldaNES/cores/ZeldaNES/API/Imports';
//import { Z64RomTools } from 'Z64Lib/API/Z64RomTools';
import MMOnline from '../../ZeldaNESOnline';
import { ZeldaNESStorageClient } from '@ZeldaNESOnline/ZeldaNESStorageClient';

export class PuppetData {
  sprite: API.ISprite;
  core: ZeldaCore;
  constructor(core: ZeldaCore) {
    this.core = core;
    this.sprite = core.link.sprite;
  }
}