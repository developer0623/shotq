import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { SentCorrespondence } from '../../models/sentcorrespondence';

@Injectable()
export class SentCorrespondenceService extends RestClientService<SentCorrespondence> {
  baseUrl = 'correspondence/sentcorrespondence';
}
