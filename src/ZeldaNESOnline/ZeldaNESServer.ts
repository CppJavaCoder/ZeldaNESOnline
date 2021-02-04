import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from 'modloader64_api/EventHandler';
import { ParentReference, ProxySide, SidedProxy } from 'modloader64_api/SidedProxy/SidedProxy';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { ServerNetworkHandler, IPacketHeader } from 'modloader64_api/NetworkHandler';
import { InjectCore } from 'modloader64_api/CoreInjection';
import * as API from 'ZeldaNES/ZeldaNES'
import ZeldaNESOnline from './ZeldaNESOnline';
import { ZeldaNESStorageClient } from './ZeldaNESStorageClient';
import { ZeldaNESStorage } from './ZeldaNESStorage';

export class ZeldaNESServer
{
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: API.ZeldaNES;
    @ParentReference()
    parent!: ZeldaNESOnline;
    clientStorage: ZeldaNESStorageClient = new ZeldaNESStorageClient();
    //@SidedProxy(ProxySide.SERVER, WorldEvents)
    //worldEvents!: WorldEvents;

    sendPacketToPlayersInScene(packet: IPacketHeader) {
        try {
            let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
                packet.lobby,
                this.parent
            ) as ZeldaNESStorage;
            if (storage === null) {
                return;
            }
            Object.keys(storage.players).forEach((key: string) => {
                //if (storage.players[key] === storage.players[packet.player.uuid]) {
                if (storage.networkPlayerInstances[key].uuid !== packet.player.uuid) {
                    this.ModLoader.serverSide.sendPacketToSpecificPlayer(
                        packet,
                        storage.networkPlayerInstances[key]
                    );
                }
                //}
            });
        } catch (err) { }
    }

    constructor() {        
    }

}