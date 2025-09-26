import { GoogleProfile } from './google-profile.interface';

export interface GoogleLoginResult {
  message: string;
  user?: GoogleProfile;
}
