import { ZeldaNESStorageBase } from './ZeldaNESStorageBase'
import * as API from 'libs\\ZeldaNES/cores/ZeldaNES/API/Imports'

export class ZeldaNESStorageClient extends ZeldaNESStorageBase
{
    constructor(link: API.ILink) {
        super(link);
    }
}