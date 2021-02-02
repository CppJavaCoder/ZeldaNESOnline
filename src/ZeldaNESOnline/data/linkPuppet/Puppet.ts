import { PuppetData } from './PuppetData';
import { INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { bus, EventHandler } from 'modloader64_api/EventHandler';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import Vector3 from 'modloader64_api/math/Vector3';
import fs from 'fs';
import path from 'path';

import * as API from 'ZeldaNES/API/Imports';
import ZeldaNESOnline from '../../ZeldaNESOnline';

const DEADBEEF_OFFSET: number = 0x288;

export class Puppet {
  player: INetworkPlayer;
  id: string;
  data: PuppetData;
  isSpawned = false;
  isSpawning = false;
  isShoveled = false;
  scene: number;
  core: API.ZeldaCore;
  void!: Vector3;
  ModLoader: IModLoaderAPI;
  tunic_color!: number;

  constructor(
    player: INetworkPlayer,
    core: API.ZeldaCore,
    pointer: number,
    ModLoader: IModLoaderAPI
  ) {
    this.player = player;
    this.data = new PuppetData(ModLoader, core);
    this.data = null as unknown as PuppetData;
    this.scene = 0;
    this.ModLoader = ModLoader;
    this.core = core;
    this.id = this.ModLoader.utils.getUUID();
  }
}
