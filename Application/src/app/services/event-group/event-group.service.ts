import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { EventGroup } from '../../models/event-group';

@Injectable()
export class EventGroupService extends RestClientService<EventGroup> {
  baseUrl = 'event/eventgroup';
}
