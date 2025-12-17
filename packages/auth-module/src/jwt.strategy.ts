import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const publicKey =
      process.env.JWT_PUBLIC_KEY || configService.get<string>("JWT_PUBLIC_KEY");
    if (!publicKey) {
      throw new Error("JWT_PUBLIC_KEY is not defined");
    }
    const normalized = publicKey.replace(/\\n/g, "\n");
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: normalized,
      algorithms: ["RS256"],
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
