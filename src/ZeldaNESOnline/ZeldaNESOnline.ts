import { IPlugin, IModLoaderAPI, IPluginServerConfig } from 'modloader64_api/IModLoaderAPI';
import { EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { IPacketHeader, SocketType } from 'modloader64_api/NetworkHandler';
import { ZeldaNESClient } from './ZeldaNESClient';
import { ZeldaNESServer } from './ZeldaNESServer';
import path from 'path';
import fs from 'fs';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { SidedProxy, ProxySide } from 'modloader64_api/SidedProxy/SidedProxy';
import { ZeldaNESStorageClient } from './ZeldaNESStorageClient';

//import { PuppetOverlord } from './data/linkPuppet/PuppetOverlord';

import * as API from 'ZeldaNES/API/Imports'
import { ZeldaNES } from 'ZeldaNES/ZeldaNES'
import { timingSafeEqual } from 'crypto';
import { ZeldaNES_Message } from './data/ZeldaNESPackets'

export interface IZeldaNESLobbyConfig {
    data_syncing: boolean;
    actor_syncing: boolean;
    key_syncing: boolean;
    time_sync: boolean;
}

export class ZeldaNESConfigCategory {
    notifications: boolean = true;
    nameplates: boolean = true;
    syncMode: number = 0;
}

class ZeldaNESOnline implements IPlugin, IPluginServerConfig {

    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: ZeldaNES;
    @SidedProxy(ProxySide.CLIENT, ZeldaNESClient)
    client!: ZeldaNESClient;
    @SidedProxy(ProxySide.SERVER, ZeldaNESServer)
    server!: ZeldaNESServer;

    //puppets: PuppetOverlord;

    // Storage
    LobbyConfig: IZeldaNESLobbyConfig = {} as IZeldaNESLobbyConfig;
    clientStorage: ZeldaNESStorageClient = new ZeldaNESStorageClient();

    constructor() {
        //this.puppets = new PuppetOverlord(/*this, this.core, this.clientStorage*/);
    }

    getClientStorage(): ZeldaNESStorageClient | null {
        return this.client !== undefined ? this.client.clientStorage : null;
    }

    sendPacketToPlayersInScene(packet: IPacketHeader): void {
        if (this.server !== undefined) {
            this.server.sendPacketToPlayersInScene(packet);
        }
    }

    preinit(): void {
        this.ModLoader.logger.info("pre init");
        if (this.client !== undefined) this.client.clientStorage = this.clientStorage;
    }

    init(): void {
        this.ModLoader.logger.info("init");
    }

    postinit(): void {
        this.ModLoader.logger.info("post init");
        this.clientStorage = new ZeldaNESStorageClient();
        //setInventoryFromI(this.core.link.inventory, this.clientStorage.inventory);
    }

    writeModel() {
        this.ModLoader.logger.info("writeModel");

    }

    onTick(frame?: number): void {
    }

    @EventHandler(EventsClient.ON_PAYLOAD_INJECTED)
    onPayload(evt: any) {
        this.ModLoader.logger.info("onPayload");

    }
    
    getServerURL(): string {
        this.ModLoader.logger.info("getServerURL");
        //return IS_DEV_BUILD ? "192.99.70.23:8037" : "192.99.70.23:8035";
        return "192.168.137.1:8082";
    }
    
}
module.exports = ZeldaNESOnline;
    
export default ZeldaNESOnline;
