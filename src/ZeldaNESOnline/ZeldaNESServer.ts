import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from 'modloader64_api/EventHandler';
import { ParentReference, ProxySide, SidedProxy } from 'modloader64_api/SidedProxy/SidedProxy';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { ServerNetworkHandler, IPacketHeader } from 'modloader64_api/NetworkHandler';
import { InjectCore } from 'modloader64_api/CoreInjection';
import ZeldaNESOnline from './ZeldaNESOnline';
import { ZeldaNESStorageClient } from './ZeldaNESStorageClient';
import { ZeldaNESStorage } from './ZeldaNESStorage';
import { Init, onTick, Postinit } from 'modloader64_api/PluginLifecycle';

import * as ZeldaPacket from './data/ZeldaNESPackets'
import { ZeldaNES } from 'ZeldaNES/ZeldaNES'
import * as API from 'ZeldaNES/API/Imports'
import * as CORE from 'ZeldaNES/src/Imports'

export class ZeldaNESServer
{
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: ZeldaNES;
    @ParentReference()
    parent!: ZeldaNESOnline;
    clientStorage: ZeldaNESStorageClient = new ZeldaNESStorageClient();
    //@SidedProxy(ProxySide.SERVER, WorldEvents)
    //worldEvents!: WorldEvents;

    sendPacketToPlayersInScene(packet: IPacketHeader) {
        this.ModLoader.logger.info("server sending packet");
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

    @Postinit()
    postinit(){
        //this.clientStorage = new ZeldaNESStorageClient(this.core);
    }

    @EventHandler(EventsServer.ON_LOBBY_CREATE)
    onLobbyCreated(lobby: string) {
        try {
            this.ModLoader.lobbyManager.createLobbyStorage(lobby, this.parent, new ZeldaNESStorage());
        }
        catch (err) {
            this.ModLoader.logger.error(err);
        }

        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            lobby,
            this.parent
        ) as ZeldaNESStorage;

        if (storage === null) {
            return;
        }
        //this.ModLoader.logger.debug("At startup we have a value of ");
    }

    @EventHandler(EventsServer.ON_LOBBY_JOIN)
    onPlayerJoin_server(evt: EventServerJoined) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            evt.lobby,
            this.parent
        ) as ZeldaNESStorage;

        if (storage === null) {
            return;
        }
        this.ModLoader.logger.info("Lobby join");
        storage.players[evt.player.uuid] = -1;
        storage.networkPlayerInstances[evt.player.uuid] = evt.player;

        //Item type shouldn't matter
        this.ModLoader.serverSide.sendPacketToSpecificPlayer( new ZeldaPacket.ZeldaNES_Expendable(ZeldaPacket.ItemType.Rupee, 0, evt.lobby, storage.inventory), evt.player);
        this.ModLoader.serverSide.sendPacketToSpecificPlayer( new ZeldaPacket.ZeldaNES_Inventory(storage.inventory, false, evt.lobby), evt.player);
        this.ModLoader.serverSide.sendPacketToSpecificPlayer( new ZeldaPacket.ZeldaNES_WholeMap(storage.worldItems, storage.worldEnemyHealth, storage.worldEnemyAlive, evt.lobby), evt.player);
    }

    @onTick()
    onTick(evt: any)
    {
    }

    @EventHandler(EventsServer.ON_LOBBY_LEAVE)
    onPlayerLeft_server(evt: EventServerLeft) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            evt.lobby,
            this.parent
        ) as ZeldaNESStorage;

        if (storage === null) {
            return;
        }
        this.ModLoader.logger.info("Lobby left");
        delete storage.players[evt.player.uuid];
        delete storage.networkPlayerInstances[evt.player.uuid];
    }
/*
    @ServerNetworkHandler('ZeldaNES_Inventory')
    onInventory(packet: ZeldaNES_Inventory) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }
        //storage.inventory.rupees = packet.rupees;
        //setInventory(storage.inventory, this.core.link.inventory);
        this.ModLoader.logger.info("Server Storage HasSword:" + storage.inventory.sword.toString());
        this.ModLoader.logger.info("Server Packet HasSword:" + packet.inventory.sword.toString());
        this.ModLoader.serverSide.sendPacket( new ZeldaNES_Inventory(storage.inventory, packet.lobby));
    }*/
    @ServerNetworkHandler('ZeldaNES_Message')
    onMessage(packet: ZeldaPacket.ZeldaNES_Message) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }

        //this.ModLoader.logger.info("Server received " + packet.message);

        if(packet.message == 'Map')
        {
            this.ModLoader.serverSide.sendPacketToSpecificPlayer( new ZeldaPacket.ZeldaNES_WholeMap(storage.worldItems, storage.worldEnemyHealth, storage.worldEnemyAlive, packet.lobby), packet.player);
        }
    }
    @ServerNetworkHandler('ZeldaNES_Sprite')
    ZeldaNES_Sprite(packet: ZeldaPacket.ZeldaNES_Sprite) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }
        
        Object.keys(storage.players).forEach((key: string) => {
            if(key != packet.player.uuid)
            {
                this.ModLoader.serverSide.sendPacketToSpecificPlayer( new ZeldaPacket.ZeldaNES_Sprite(packet.spr, packet.worldpos, packet.returnData, packet.lobby), storage.networkPlayerInstances[key]);
            }
        });

        //this.ModLoader.logger.info("Server received " + packet.spr.xpos);
    }
    @ServerNetworkHandler('ZeldaNES_Inventory')
    ZeldaNES_Inventory(packet: ZeldaPacket.ZeldaNES_Inventory) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }

        ZeldaPacket.updateInventory(packet.inv, storage.inventory);

        Object.keys(storage.players).forEach((key: string) => {
            if(key != packet.player.uuid)
            {
                this.ModLoader.serverSide.sendPacketToSpecificPlayer( new ZeldaPacket.ZeldaNES_Inventory(storage.inventory, packet.returnData, packet.lobby), storage.networkPlayerInstances[key]);
            }
        });

        //this.ModLoader.logger.info("Server received " + packet.inv.rupees.toString());
    }
    @ServerNetworkHandler('ZeldaNES_MapPeice')
    ZeldaNES_MapPeice(packet: ZeldaPacket.ZeldaNES_MapPeice) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }

        storage.players[packet.player.uuid] = packet.worldPos;

        let updateRequired: boolean = false;
        if(storage.worldItems[packet.worldPos] == -1)
        {
            storage.worldEnemyAlive[packet.worldPos] = packet.enemyAlive;
            storage.worldEnemyHealth[packet.worldPos] = [0xFF,0XFF,0XFF,0XFF,0XFF,0XFF];

            storage.worldItems[packet.worldPos] = 0;

            //this.ModLoader.logger.debug("First time mark you!");
            //this.ModLoader.logger.debug("Sending enemy data " + storage.worldEnemyAlive[packet.worldPos]);
        } else {
            for(let n: number = 0; n < 0x06; n++)
            {
                if(storage.worldEnemyHealth[packet.worldPos][n] > packet.enemyHp[n])
                {
                    storage.worldEnemyHealth[packet.worldPos][n] = packet.enemyHp[n];
                    updateRequired = true;
                }
                if(storage.worldEnemyAlive[packet.worldPos][n] != packet.enemyAlive[n] && storage.worldEnemyAlive[packet.worldPos][n] != 0)
                {
                    storage.worldEnemyAlive[packet.worldPos][n] = packet.enemyAlive[n];
                    updateRequired = true;
                }
            }
            if(storage.worldItems[packet.worldPos] < packet.roomItem)
            {
                storage.worldItems[packet.worldPos] = packet.roomItem;
                updateRequired = true;
            }

        }/*
        this.ModLoader.logger.debug("Received data for " + packet.worldPos.toString(16));
        this.ModLoader.logger.debug("Received enemy hp " + packet.enemyHp);
        this.ModLoader.logger.debug("Received enemy data " + packet.enemyAlive);
        this.ModLoader.logger.debug("Received puzzle item " + packet.roomItem.toString(16));*/
        //this.ModLoader.logger.debug("Sending enemy data " + storage.worldEnemyAlive[packet.worldPos]);
        //this.ModLoader.logger.debug("Sending enemy data " + storage.worldEnemyAlive[packet.worldPos]);
        //this.ModLoader.logger.debug("Sending enemy data " + storage.worldEnemyAlive[packet.worldPos]);
        this.ModLoader.serverSide.sendPacket( new ZeldaPacket.ZeldaNES_MapPeice(packet.worldPos, storage.worldItems[packet.worldPos], storage.worldEnemyHealth[packet.worldPos], storage.worldEnemyAlive[packet.worldPos], packet.returnData, packet.lobby));
    }
    @ServerNetworkHandler('ZeldaNES_UnlockMe')
    ZeldaNES_UnlockMe(packet: ZeldaPacket.ZeldaNES_UnlockMe) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }
        Object.keys(storage.players).forEach((key: string) => {
            if(key != packet.player.uuid)
            {
                this.ModLoader.serverSide.sendPacketToSpecificPlayer( packet, storage.networkPlayerInstances[key]);
            }
        });
    }

    @ServerNetworkHandler('ZeldaNES_Expendable')
    ZeldaNES_Expendable(packet: ZeldaPacket.ZeldaNES_Expendable) {
        let storage: ZeldaNESStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as ZeldaNESStorage;
        if (storage === null) {
            return;
        }
        switch(packet.type)
        {
            case ZeldaPacket.ItemType.Rupee:
                storage.inventory.rupees += packet.add;
                if(storage.inventory.rupees < 0)
                    storage.inventory.rupees = 0;
                if(storage.inventory.rupees > 0xFF)
                    storage.inventory.rupees = 0xFF;
                 break;
            case ZeldaPacket.ItemType.Bomb:
                storage.inventory.bombs += packet.add;
                if(storage.inventory.bombs < 0)
                    storage.inventory.bombs = 0;
                if(storage.inventory.bombs > storage.inventory.bombBag)
                    storage.inventory.bombs = storage.inventory.bombBag;
            break;
            case ZeldaPacket.ItemType.Key:
                storage.inventory.keys += packet.add;
                if(storage.inventory.keys < 0)
                    storage.inventory.keys = 0;
                if(storage.inventory.keys > 0xFF)
                    storage.inventory.keys = 0xFF;
                break;
            case ZeldaPacket.ItemType.Heart:
                storage.inventory.hearts += packet.add;
                if(storage.inventory.hearts < 0)
                    storage.inventory.hearts = 0;
                if(storage.inventory.hearts > storage.inventory.containers)
                    storage.inventory.hearts = storage.inventory.containers;
                break;
            case ZeldaPacket.ItemType.pHeart:
                storage.inventory.pHeart += packet.add;
                if(storage.inventory.pHeart < 0)
                    storage.inventory.pHeart = 0;
                if(storage.inventory.pHeart > 0xFF)
                    storage.inventory.pHeart = 0xFF;
                break;
        case ZeldaPacket.ItemType.Potion:
                storage.inventory.potion += packet.add;
                if(storage.inventory.potion < 0)
                    storage.inventory.potion = 0;
                if(storage.inventory.potion > 0x3)
                    storage.inventory.potion = 0x3;
                break;
        }

        this.ModLoader.serverSide.sendPacket( new ZeldaPacket.ZeldaNES_Expendable(packet.type, packet.add, packet.lobby, storage.inventory));
    }

}