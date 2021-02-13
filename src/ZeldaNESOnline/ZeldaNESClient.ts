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

import * as ZeldaPacket from './data/ZeldaNESPackets'
import * as API from 'ZeldaNES/API/Imports'
import * as CORE from 'ZeldaNES/src/Imports'

import path from 'path';
import fs from 'fs';
import { NetworkPlayer } from 'modloader64_api/ModLoaderDefaultImpls';

export class ZeldaNESClient
{
    clientStorage!: ZeldaNESStorageClient;
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: API.ZeldaCore;

    oldWorldPos: number = 0;

    once: boolean = false;

    fakeSprite: API.ISprite = new CORE.FakeSprite;

    oldRupees: number = 0;
    oldBombs: number = 0;
    oldKeys: number = 0;
    oldHeart: number = 0;
    oldPHeart: number = 0;
    oldPotion: number = 0;
    delay: number = 0;

    sendPacketToPlayersInScene(packet: IPacketHeader) {
        //this.ModLoader.logger.info("sending packet");
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
        this.ModLoader.logger.info("client pre init");
        //this.config = this.ModLoader.config.registerConfigCategory("ZeldaNESOnline") as ZeldaNESConfigCategory;
        //this.ModLoader.config.setData("ZeldaNESOnline", "syncMode", 0); // 0 is default, 1 is time sync, 2 is groundhog's-day sync
        //this.ModLoader.config.setData("ZeldaNESOnline", "notifications", true);
        //this.ModLoader.config.setData("ZeldaNESOnline", "nameplates", true);

    }

    @Init()
    init(): void {
        this.ModLoader.logger.info("client init");
        //this.clientStorage.syncMode = this.config.syncMode;
        //this.modelManager.clientStorage = this.clientStorage;
    }

    @Postinit()
    postinit() {
        this.ModLoader.logger.info("client post init");
        //this.clientStorage.scene_keys = JSON.parse(fs.readFileSync(__dirname + '/data/scene_numbers.json').toString());
        //this.clientStorage.localization = JSON.parse(fs.readFileSync(__dirname + '/data/en_US.json').toString());
        let status: DiscordStatus = new DiscordStatus('Playing ZeldaNESOnline', 'On the title screen');
        status.smallImageKey = 'ZNESO';
        status.partyId = this.ModLoader.clientLobby;
        status.partyMax = 30;
        status.partySize = 1;
        this.ModLoader.gui.setDiscordStatus(status);
        this.clientStorage.inventory = this.core.link.inventory;
    }

    roomCheck: boolean = false;
    oldUnlock: number = 0;
    @onTick()
    onTick() {
        //this.sendPacketToPlayersInScene();
        //this.core.link.inventory.refreshValues(this.ModLoader.emulator);
        if(this.core.link.scrollDirection == 0)
        {
            if(!this.core.link.getInOverworld())
            {
                let thing: number = this.oldUnlock;
                this.oldUnlock = this.core.link.rdramRead8(API.addresses.ROOM_PUZZLE);
                if(thing != this.oldUnlock)
                {
                    this.sendUnlock();
                }
            }

            if(this.core.checkRoom())
            {
                this.roomCheck = true;
            }
            if(this.roomCheck)
            {
                this.writeMapData(false);
                this.sendMapData(false);
                this.roomCheck = false;
                this.core.link.wasWorldPosChange = false;
            }
        }
        if(this.core.link.wasInventoryChanged)
        {
            if(this.oldRupees != this.core.link.inventory.rupees)
            {
                this.sendRupee();
                this.oldRupees = this.core.link.inventory.rupees;
            }
            if(this.oldBombs != this.core.link.inventory.bombs)
            {
                this.sendBomb();
                this.oldBombs = this.core.link.inventory.bombs;
            }
            if(this.oldKeys != this.core.link.inventory.keys)
            {
                this.sendKey();
                this.oldKeys = this.core.link.inventory.keys;
            }
            if(this.oldHeart != this.core.link.inventory.hearts)
            {
                this.sendHeart();
                this.oldHeart = this.core.link.inventory.hearts;
            }
            if(this.oldPHeart != this.core.link.inventory.pHeart)
            {
                this.sendPHeart();
                this.oldPHeart = this.core.link.inventory.pHeart;
            }
            this.sendInventory(true);
            this.core.link.wasInventoryChanged = false;
        }
        this.once = true;
        if(this.core.link.wasPosChanged || this.core.link.wasFrameChanged || this.core.link.wasShownChanged || this.core.link.wasWorldPosChange)
        {
            //if(this.core.link.scrollDirection == 0)
            //    this.writeMapData();
            this.sendSprite(true);
            this.core.link.wasPosChanged = false;
            this.core.link.wasFrameChanged = false;
            this.core.link.wasShownChanged = false;
            this.core.link.wasWorldPosChange = false;
        }
    }

    sendMessage(message: string) {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Message(message, this.ModLoader.clientLobby));
    }

    overWorldCheck(): boolean {
        return true;
    }

    oldEnemyState: number = 0;

    underWorldCheck(): boolean {
        let thing: number = this.oldEnemyState;
        this.oldEnemyState = this.core.getEnemyState(0);
        if((this.core.link.wasWorldPosChange && thing != this.oldEnemyState && this.oldEnemyState == 1) || ((this.roomCheck && (this.ModLoader.emulator.rdramRead8(0x34D) > 0x10 || this.ModLoader.emulator.rdramRead8(0x420) > 0x10)) && this.core.link.scrollDirection == 0))
        {
            return true;
        }
        return false;
    }

    writeMapData(network: boolean): void {
        let pos = this.core.link.getWorldPos() + ((this.core.link.getInOverworld() ? 0 : 1) * 0x80);        

        if(this.clientStorage.worldItems[pos] == -1 || !network)
        {
            this.clientStorage.worldEnemyHealth[pos] = this.core.currentEnemyHp;
            this.clientStorage.worldEnemyAlive[pos] = this.core.currentEnemyAlive;
            if(pos >= 0x80)
                this.clientStorage.worldItems[pos] = this.core.item[pos-0x80];
            else
                this.clientStorage.worldItems[pos] = 0;
            this.roomCheck = false;
            this.core.writeRoom();
            return;
        }
        this.core.currentEnemyHp = this.clientStorage.worldEnemyHealth[pos];
        this.core.currentEnemyAlive = this.clientStorage.worldEnemyAlive[pos];
        if(pos>=0x80)
            this.core.item[pos-0x80] = this.clientStorage.worldItems[pos];
        
        for(let n: number = 0; n < 6; n++)
            if(this.core.link.rdramRead8(API.addresses.ENEMY_ALIVE + n) != 0x60)
                this.core.currentEnemyAlive[n] = this.clientStorage.worldEnemyAlive[pos][n];
            else
                this.core.currentEnemyAlive[n] = 0x60;
        
        //this.core.resetItemTimer();
        this.core.writeRoom();
    }
    sendMapData(flag: boolean) {
        let pos = this.core.link.getWorldPos() + ((this.core.link.getInOverworld() ? 0 : 1) * 0x80);
        for(let n: number = 0; n < 6; n++)
            if(this.clientStorage.worldEnemyAlive[pos][n] == 0x60)
                this.clientStorage.worldEnemyAlive[pos][n] = 0;
        //this.ModLoader.logger.debug("World Position: " + pos.toString(16));
        //this.ModLoader.logger.debug("Should key respawn value: " + this.clientStorage.worldItems[pos].toString(16));
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_MapPeice(pos, this.clientStorage.worldItems[pos], this.clientStorage.worldEnemyHealth[pos], this.clientStorage.worldEnemyAlive[pos], flag, this.ModLoader.clientLobby));
    }

    sendSprite(flag: boolean) {
        this.fakeSprite = this.core.link.sprite;
        if(this.core.link.scrollDirection != 0)
        {
            this.fakeSprite.shown = false;
        }

        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Sprite(this.fakeSprite, this.core.link.getWorldPos() + (this.core.link.getInOverworld() ? 0 : 1) * 0x80, flag, this.ModLoader.clientLobby));
    }

    sendInventory(flag: boolean) {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Inventory(this.core.link.inventory, flag, this.ModLoader.clientLobby));
    }

    sendRupee() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Rupee(this.core.link.inventory.rupees - this.oldRupees, this.ModLoader.clientLobby));
    }
    sendUnlock() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_UnlockMe(this.core.link.rdramRead8(API.addresses.ROOM_PUZZLE), this.core.link.getWorldPos(), this.ModLoader.clientLobby));
    }
    sendKey() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Key(this.core.link.inventory.keys - this.oldKeys, this.ModLoader.clientLobby));
    }
    sendBomb() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Bomb(this.core.link.inventory.bombs - this.oldBombs, this.ModLoader.clientLobby));
    }
    sendHeart() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Heart(this.core.link.inventory.hearts - this.oldHeart, this.ModLoader.clientLobby));
    }
    sendPHeart() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_pHeart(this.core.link.inventory.pHeart - this.oldPHeart, this.ModLoader.clientLobby));
    }
    sendPotion() {
        this.ModLoader.clientSide.sendPacket(new ZeldaPacket.ZeldaNES_Potion(this.core.link.inventory.potion - this.oldPotion, this.ModLoader.clientLobby));
    }

    @NetworkHandler('ZeldaNES_Message')
    onMessage(packet: ZeldaPacket.ZeldaNES_Message) {
        //this.ModLoader.logger.info("Client received " + packet.message);
    }

    @NetworkHandler('ZeldaNES_WholeMap')
    onWholeMap(packet: ZeldaPacket.ZeldaNES_WholeMap) {
        for(let n: number = 0; n < 0x180; n++)
            if(this.clientStorage.worldItems[n] < packet.roomItem[n])
                this.clientStorage.worldItems[n] = packet.roomItem[n];
        for(let n: number = 0; n < 0x180; n++)
        {
            for(let i: number = 0; i < 0x06; i++)
            {
                if(this.clientStorage.worldEnemyAlive[n][i] != packet.enemyAlive[n][i] && this.clientStorage.worldEnemyAlive[n][i] != 0)
                    this.clientStorage.worldEnemyAlive[n][i] = packet.enemyAlive[n][i];
                if(this.clientStorage.worldEnemyHealth[n][i] > packet.enemyHp[n][i])
                    this.clientStorage.worldEnemyHealth[n][i] = packet.enemyHp[n][i];
            }
        }
        //this.ModLoader.logger.info('Updated entire map');
    }

    @NetworkHandler('ZeldaNES_MapPeice')
    onMapPeice(packet: ZeldaPacket.ZeldaNES_MapPeice) {
        if(this.clientStorage.worldItems[packet.worldPos] < packet.roomItem)
            this.clientStorage.worldItems[packet.worldPos] = packet.roomItem;
        
        for(let n: number = 0; n < 0x06; n++)
        {
            if(this.clientStorage.worldEnemyAlive[packet.worldPos][n] != packet.enemyAlive[n] && this.clientStorage.worldEnemyAlive[packet.worldPos][n] != 0)
                this.clientStorage.worldEnemyAlive[packet.worldPos][n] = packet.enemyAlive[n];
            if(this.clientStorage.worldEnemyHealth[packet.worldPos][n] > packet.enemyHp[n])
                this.clientStorage.worldEnemyHealth[packet.worldPos][n] = packet.enemyHp[n];
        }
        //this.ModLoader.logger.info('Receiving data ' + packet.worldPos.toString(16));
        //this.ModLoader.logger.info('Receiving hp ' + packet.enemyHp);
        //this.roomCheck = true;
        this.writeMapData(true);
    }

    @NetworkHandler('ZeldaNES_Expendable')
    onExpendable(packet: ZeldaPacket.ZeldaNES_Expendable) {
        if(packet.inv !== null)
        {
            ZeldaPacket.updateChangeableInventory(packet.inv, this.core.link.inventory);
            this.oldBombs = packet.inv.bombs;
            this.oldRupees = packet.inv.rupees;
            this.oldKeys = packet.inv.keys;
            this.oldPHeart = packet.inv.pHeart;
            this.oldHeart = packet.inv.hearts;
            this.oldPotion = packet.inv.potion;
            //this.ModLoader.logger.debug('Received packet ' + packet.inv.pHeart.toString(16) + ' ' + packet.type);
        }
        this.core.link.rewriteInventory();
    }
    @NetworkHandler('ZeldaNES_Sprite')
    onSprite(packet: ZeldaPacket.ZeldaNES_Sprite) {
        if(this.clientStorage.sprites[packet.packet_id] == undefined)
        {
            this.clientStorage.sprites[packet.packet_id] = new CORE.Sprite("mods/link.bmp", 16, 16, 4, 8);
            this.clientStorage.sprites[packet.packet_id].showSprite(false);
        }
        let spr: API.ISprite = this.clientStorage.sprites[packet.packet_id];
        this.clientStorage.worldpos = packet.worldpos;

        if(packet.worldpos != this.core.link.getWorldPos() + (this.core.link.getInOverworld() ? 0 : 1) * 0x80 || !this.fakeSprite.shown || this.core.link.scrollDirection != 0)
        {
            if(spr.shown)
            {
                spr.showSprite(false);
                if(packet.returnData)
                    this.sendSprite(false);
            }
            return;
        }

        if(spr.shown != packet.spr.shown)
            spr.showSprite(packet.spr.shown);
        if(spr.shown)
        {
            if(spr.xpos != packet.spr.xpos || spr.ypos != packet.spr.ypos)
            {
                spr.setPos(packet.spr.xpos, packet.spr.ypos);
                if(spr.clipX != packet.spr.clipX || spr.clipY != packet.spr.clipY || spr.clipW != packet.spr.clipW || spr.clipH != packet.spr.clipH)
                    spr.clip(packet.spr.clipX, packet.spr.clipY, packet.spr.clipW, packet.spr.clipH);
            }
            if(this.once 
            && spr.xpos+spr.w > this.core.link.sprite.xpos
            && spr.ypos+spr.h > this.core.link.sprite.ypos
            && spr.xpos < this.core.link.sprite.xpos + this.core.link.sprite.w
            && spr.ypos < this.core.link.sprite.ypos + this.core.link.sprite.h)
            {
                this.once = false;
                let moveX: number = 0, moveY: number = 0;
                if     (this.core.link.sprite.xpos - spr.xpos > 0)
                    moveX = 1;
                else if(this.core.link.sprite.xpos - spr.xpos < 0)
                    moveX = -1;
                if(this.core.link.sprite.ypos - spr.ypos > 0)
                    moveY = 1;
                else if(this.core.link.sprite.ypos - spr.ypos < 0)
                    moveY = -1;

                this.core.link.move(moveX, moveY);
            }
        }
        if(spr.frame != packet.spr.frame)
            spr.setFrame(packet.spr.frame);
        
        if(packet.returnData)
            this.sendSprite(false);
        
    }

    @NetworkHandler('ZeldaNES_UnlockMe')
    onUnlockMe(packet: ZeldaPacket.ZeldaNES_UnlockMe){
        if(this.core.link.getWorldPos() == packet.worldpos)
        {
            this.core.link.rdramWrite8(API.addresses.ROOM_PUZZLE, packet.keycode);
        }
    }

    @NetworkHandler('ZeldaNES_Inventory')
    onInventory(packet: ZeldaPacket.ZeldaNES_Inventory)
    {
        ZeldaPacket.updateInventory(packet.inv, this.core.link.inventory);
        this.core.link.rewriteInventory();
        if(packet.returnData)
            this.sendInventory(false);
    } 
/*
    @NetworkHandler('ZeldaNES_Inventory')
    onInventory(packet: ZeldaNES_Inventory) {
        if(packet.inventory === null)
            return;
        //setInventory(packet.inventory, this.core.link.inventory);
        //this.core.link.inventory.rewriteValues(this.ModLoader.emulator);
        //mergeStrayData(this.clientStorage.strayStorage, packet.stray);
        //mergeStrayData(this.clientStorage.strayStorage, stray);
        //applyStrayToContext(this.clientStorage.strayStorage, this.core.save.stray);
    }*/
}
