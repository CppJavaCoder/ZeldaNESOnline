import { IPlugin, IModLoaderAPI, IPluginServerConfig } from 'modloader64_api/IModLoaderAPI';
import { EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { IPacketHeader } from 'modloader64_api/NetworkHandler';
import { ZeldaNESClient } from './ZeldaNESClient';
import { ZeldaNESServer } from './ZeldaNESServer';
import path from 'path';
import fs from 'fs';

class ZeldaNESOnline implements IPlugin, IPluginServerConfig {

    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: API.IZeldaNESCore;
    @SidedProxy(ProxySide.CLIENT, ZeldaNESClient)
    client!: ZeldaNESClient;
    @SidedProxy(ProxySide.SERVER, ZeldaNESServer)
    server!: ZeldaNESServer;

    puppets: PuppetOverlord;

    // Storage
    LobbyConfig: IZeldaNESLobbyConfig = {} as IZeldaNESLobbyConfig;
    clientStorage: ZeldaNESStorageClient = new ZeldaNESStorageClient();

    constructor() {
        this.puppets = new PuppetOverlord(this, this.core, this.clientStorage);
    }

    sendPacketToPlayersInScene(packet: IPacketHeader): void {
        if (this.server !== undefined) {
            this.server.sendPacketToPlayersInScene(packet);
        }
    }

    getClientStorage(): ZeldaNESStorageClient | null {
        return this.client !== undefined ? this.client.clientStorage : null;
    }

    preinit(): void {
        if (this.client !== undefined) this.client.clientStorage = this.clientStorage;
    }

    init(): void {
    }

    postinit(): void {
    }

    writeModel() {

    }

    onTick(frame?: number): void {

    }

    @EventHandler(EventsClient.ON_PAYLOAD_INJECTED)
    onPayload(evt: any) {

    }
    
    getServerURL(): string {
        //return IS_DEV_BUILD ? "192.99.70.23:8037" : "192.99.70.23:8035";
        return "There is no IP address you DOPE!!!";
    }
    
}
module.exports = ZeldaNESOnline;
    
export default ZeldaNESOnline;
