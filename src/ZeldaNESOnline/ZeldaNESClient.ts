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

import path from 'path';
import fs from 'fs';

export class ZeldaNESClient
{
    clientStorage!: ZeldaNESStorageClient;

}
