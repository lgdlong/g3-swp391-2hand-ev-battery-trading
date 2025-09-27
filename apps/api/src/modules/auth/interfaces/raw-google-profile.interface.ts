export interface RawGoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName?: string;
    givenName?: string;
  };
  emails: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
  provider: string;
  _json: {
    sub: string;
    name: string;
    given_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
}
