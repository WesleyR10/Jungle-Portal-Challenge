import { Module, Global } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { StringValue } from "ms";

@Global()
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const pk = configService.get<string>("JWT_PRIVATE_KEY");
        const pub = configService.get<string>("JWT_PUBLIC_KEY");
        return {
          privateKey: pk?.replace(/\\n/g, "\n"),
          publicKey: pub?.replace(/\\n/g, "\n"),
          signOptions: {
            expiresIn: configService.get<string>(
              "JWT_EXPIRES_IN",
            ) as StringValue,
            algorithm: "RS256",
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtAuthGuard],
})
export class CommonAuthModule {}
