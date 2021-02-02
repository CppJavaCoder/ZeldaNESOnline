import { InjectCore } from 'modloader64_api/CoreInjection';
import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { INetworkPlayer, LobbyData, NetworkHandler, IPacketHeader } from 'modloader64_api/NetworkHandler';
import { GUITunnelPacket } from 'modloader64_api/GUITunnel';
import { DiscordStatus } from 'modloader64_api/Discord';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Init, Preinit, Postinit, onTick, onViUpdate, onCreateResources } from 'modloader64_api/PluginLifecycle';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { SidedProxy, ProxySide } from 'modloader64_api/SidedProxy/SidedProxy';
import { addToKillFeedQueue, changeKillfeedFont } from 'modloader64_api/Announcements';
import { rgba, xy, xywh } from 'modloader64_api/Sylvain/vec';
import { FlipFlags, Font, Texture } from 'modloader64_api/Sylvain/Gfx';
import { number_ref, string_ref } from 'modloader64_api/Sylvain/ImGui';
import { ZeldaNESStorageClient } from './ZeldaNESStorageClient';
import { ZeldaNESStorage } from './ZeldaNESStorage';

import * as API from 'libs\\ZeldaNES/cores/ZeldaNES/API/Imports'

import path from 'path';
import fs from 'fs';

export class ZeldaNESClient
{
    clientStorage!: ZeldaNESStorageClient;
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: API.ZeldaCore;

    sendPacketToPlayersInScene(packet: IPacketHeader) {
        try{
            let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this) as ZeldaNESStorage;
            this.ModLoader.clientSide.sendPacket(packet);
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
        } catch(err: any)
        {
            //Dang it
        }
    }

    @Preinit()
    preinit() {
        //this.config = this.ModLoader.config.registerConfigCategory("ZeldaNESOnline") as ZeldaNESConfigCategory;
        this.ModLoader.config.setData("ZeldaNESOnline", "syncMode", 0); // 0 is default, 1 is time sync, 2 is groundhog's-day sync
        this.ModLoader.config.setData("ZeldaNESOnline", "notifications", true);
        this.ModLoader.config.setData("ZeldaNESOnline", "nameplates", true);

    }

    @Init()
    init(): void {
        //this.clientStorage.syncMode = this.config.syncMode;
        //this.modelManager.clientStorage = this.clientStorage;
    }

    @Postinit()
    postinit() {
        //this.clientStorage.scene_keys = JSON.parse(fs.readFileSync(__dirname + '/data/scene_numbers.json').toString());
        //this.clientStorage.localization = JSON.parse(fs.readFileSync(__dirname + '/data/en_US.json').toString());
        let status: DiscordStatus = new DiscordStatus('Playing ZeldaNESOnline', 'On the title screen');
        status.smallImageKey = 'ZNESO';
        status.partyId = this.ModLoader.clientLobby;
        status.partyMax = 30;
        status.partySize = 1;
        this.ModLoader.gui.setDiscordStatus(status);
    }

    @onTick()
    onTick() {
        
    }
}
