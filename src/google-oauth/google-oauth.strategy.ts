import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: '158577913184-i6pak7nuubqk2llt847hcmojdju1uus9.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/auth/google/redirect',
      scope: ['email', 'profile']
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile
  ) {
    const { id, name, emails } = profile;

    // Here a custom User object is returned. In the the repo I'm using a UsersService with repository pattern
    return {
      provider: 'google',
      providerId: id,
      name: name.givenName,
      username: emails[0].value
    };
  }
}

