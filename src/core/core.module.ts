import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';
import { MessageModule } from 'src/message/message.module';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DebuggerModule } from 'src/debugger/debugger.module';
import Configs from 'src/config/index';
import { DATABASE_CONNECTION_NAME } from 'src/database/database.constant';
import { AuthModule } from 'src/auth/auth.module';
import { PaginationModule } from 'src/utils/pagination/pagination.module';
import { HelperModule } from 'src/utils/helper/helper.module';
import { MiddlewareModule } from 'src/utils/middleware/middleware.module';
import { DebuggerOptionService } from 'src/debugger/service/debugger.option.service';
import { DatabaseService } from 'src/database/service/database.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    controllers: [],
    providers: [],
    imports: [
        MiddlewareModule,
        ConfigModule.forRoot({
            load: Configs,
            ignoreEnvFile: false,
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
        }),
        WinstonModule.forRootAsync({
            inject: [DebuggerOptionService],
            imports: [DebuggerModule],
            useFactory: (loggerService: DebuggerOptionService) =>
                loggerService.createLogger(),
        }),
        MongooseModule.forRootAsync({
            connectionName: DATABASE_CONNECTION_NAME,
            inject: [DatabaseService],
            imports: [DatabaseModule],
            useFactory: (databaseService: DatabaseService) =>
                databaseService.createMongooseOptions(),
        }),
        MessageModule,
        PaginationModule,
        DebuggerModule,
        HelperModule,
        AuthModule,
        LoggerModule,
    ],
})
export class CoreModule {}
