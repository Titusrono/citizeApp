import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { IssuesModule } from './modules/issues/issues.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { VotesModule } from './modules/votes/votes.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { TownhallsModule } from './modules/townhalls/townhalls.module';
import { PetitionsModule } from './modules/petitions/petitions.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogsModule } from './modules/blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI'),
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
      }),
    }),
    UsersModule,
    AuthModule,
    IssuesModule,
    SignaturesModule,
    VotesModule,
    PoliciesModule,
    TownhallsModule,
    PetitionsModule,
    BlogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
