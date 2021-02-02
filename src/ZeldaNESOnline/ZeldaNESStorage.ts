import { ZeldaNESStorageBase } from './ZeldaNESStorageBase';
import * as API from 'ZeldaNES/API/Imports'
//import { NUM_SCHEDULE_TICKS, NUM_SCHEDULE_RECORD_TICKS, PlayerScheduleData, PlayerSchedule } from './data/MMOPlayerSchedule'

export class ZeldaNESStorage extends ZeldaNESStorageBase {
  networkPlayerInstances: any = {};
  players: any = {};
  saveGameSetup = false;
  constructor(link: API.ILink) {
    super(link);
  }
}