import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuthController } from 'src/auth/auth.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HealthController } from 'src/health/health.controller';
import { HealthModule } from 'src/health/health.module';
import { LoggerModule } from 'src/logger/logger.module';
import { PermissionModule } from 'src/permission/permission.module';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';

@Module({
    controllers: [AuthController, HealthController],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        AuthModule,
        RoleModule,
        LoggerModule,
        PermissionModule,
        TerminusModule,
        HttpModule,
        HealthModule,
    ],
})
export class RouterCommonModule {}
