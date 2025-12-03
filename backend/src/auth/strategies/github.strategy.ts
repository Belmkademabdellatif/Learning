import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '@prisma/client';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: `${config.get('API_URL')}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { emails, displayName, photos } = profile;
    const [firstName, ...lastNameParts] = displayName.split(' ');

    const user = {
      email: emails[0].value,
      firstName,
      lastName: lastNameParts.join(' ') || firstName,
      picture: photos[0]?.value,
    };

    return await this.authService.handleOAuthLogin(user, AuthProvider.GITHUB);
  }
}
