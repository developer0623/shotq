export class SocialNetwork {
  id: number;
  network: string;
  network_id: string;
  visible: boolean;
  person: number;
  isLoading: boolean; // virtual field for contact edit

  constructor() {
    this.isLoading = false;
  }
}
