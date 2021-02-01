import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from 'modloader64_api/EventHandler';
import { ParentReference, ProxySide, SidedProxy } from 'modloader64_api/SidedProxy/SidedProxy';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { ServerNetworkHandler, IPacketHeader } from 'modloader64_api/NetworkHandler';
import { InjectCore } from 'modloader64_api/CoreInjection';
import * as API from 'libs//ZeldaNES/cores/ZeldaNES/ZeldaNES'
import ZeldaNESOnline from './ZeldaNESOnline';
import { ZeldaNESStorageClient } from './ZeldaNESStorageClient';

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

    constructor() {        
    }

}