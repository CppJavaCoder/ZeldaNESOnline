import { ZeldaNESStorageBase } from './ZeldaNESStorageBase'
import * as API from 'ZeldaNES/API/Imports'
import { ZeldaNES } from 'ZeldaNES/ZeldaNES'

export class ZeldaNESStorageClient extends ZeldaNESStorageBase
{
    sprites: any = {};
    worldpos: any = {};
}