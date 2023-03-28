import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomeRequest } from '../../../types';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '1q2w3e4r',
      passReqToCallback: true,
      pass: true,
    });
  }

  validate(req: CustomeRequest, payload: any) {
    req.userId = payload;
    return 'Ok';
  }
}
