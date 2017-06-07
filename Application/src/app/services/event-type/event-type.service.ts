import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { EventType } from '../../models/event-type';

@Injectable()
export class EventTypeService extends RestClientService<EventType> {
  baseUrl = 'event/eventtype';
}
