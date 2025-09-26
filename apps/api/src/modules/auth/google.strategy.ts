import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleProfile } from './interfaces/google-profile.interface';
import { RawGoogleProfile } from './interfaces/raw-google-profile.interface';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:8000/auth/google-redirect',
      scope: ['email', 'profile'],
    });
  }
  validate(
    accessToken: string,
    refreshToken: string,
    profile: RawGoogleProfile,
    done: VerifyCallback,
  ) {
    try {
      // Dùng interface GoogleProfile
      const googleProfile: GoogleProfile = {
        googleId: profile.id,
        email: profile.emails?.[0]?.value || profile._json?.email || '',
        emailVerified: profile._json?.email_verified ?? true,
        name: profile.displayName || profile._json?.name || '',
        givenName: profile._json?.given_name || profile.name?.givenName || '',
        avatar: profile.photos?.[0]?.value || profile._json?.picture || '',
        provider: profile.provider,
      };

      // Save user to DB and generate JWT
      const result = this.authService.handleGoogleLogin({
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.avatar,
        provider: googleProfile.provider,
        emailVerified: googleProfile.emailVerified,
      });

      // Return the result which includes access_token and account info
      done(null, result);
    } catch (error) {
      done(error, false);
    }
  }
}
