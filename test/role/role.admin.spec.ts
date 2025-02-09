import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
    E2E_ROLE_ADMIN_ACTIVE_URL,
    E2E_ROLE_ADMIN_CREATE_URL,
    E2E_ROLE_ADMIN_DELETE_URL,
    E2E_ROLE_ADMIN_GET_BY_ID_URL,
    E2E_ROLE_ADMIN_INACTIVE_URL,
    E2E_ROLE_ADMIN_LIST_URL,
    E2E_ROLE_ADMIN_UPDATE_URL,
    E2E_ROLE_PAYLOAD_TEST,
} from './role.constant';
import { connection, Types } from 'mongoose';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/role/role.constant';
import { RouterModule } from '@nestjs/core';
import { CoreModule } from 'src/core/core.module';
import { AuthService } from 'src/auth/service/auth.service';
import { RoleService } from 'src/role/service/role.service';
import { PermissionService } from 'src/permission/service/permission.service';
import { RoleBulkService } from 'src/role/service/role.bulk.service';
import { RoleCreateValidation } from 'src/role/validation/role.create.validation';
import { ENUM_REQUEST_STATUS_CODE_ERROR } from 'src/utils/request/request.constant';
import { RouterAdminModule } from 'src/router/router.admin.module';
import { RoleDocument } from 'src/role/schema/role.schema';
import { PermissionDocument } from 'src/permission/schema/permission.schema';

describe('E2E Role Admin', () => {
    let app: INestApplication;
    let authService: AuthService;
    let roleService: RoleService;
    let permissionService: PermissionService;
    let roleBulkService: RoleBulkService;

    let role: RoleDocument;
    let roleUpdate: RoleDocument;

    let accessToken: string;

    let successData: RoleCreateValidation;
    let updateData: RoleCreateValidation;
    let existData: RoleCreateValidation;

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [
                CoreModule,
                RouterAdminModule,
                RouterModule.register([
                    {
                        path: '/admin',
                        module: RouterAdminModule,
                    },
                ]),
            ],
        }).compile();

        app = modRef.createNestApplication();
        authService = app.get(AuthService);
        roleService = app.get(RoleService);
        roleBulkService = app.get(RoleBulkService);
        permissionService = app.get(PermissionService);

        const permissions: PermissionDocument[] =
            await permissionService.findAll();

        successData = {
            name: 'testRole1',
            permissions: permissions.map((val) => `${val._id}`),
            isAdmin: true,
        };

        roleUpdate = await roleService.create({
            name: 'testRole2',
            permissions: permissions.map((val) => `${val._id}`),
            isAdmin: true,
        });

        updateData = {
            name: 'testRole3',
            permissions: permissions.map((val) => `${val._id}`),
            isAdmin: true,
        };

        existData = {
            name: 'testRole',
            permissions: permissions.map((val) => `${val._id}`),
            isAdmin: true,
        };

        role = await roleService.create(existData as RoleCreateValidation);

        accessToken = await authService.createAccessToken({
            ...E2E_ROLE_PAYLOAD_TEST,
            loginDate: new Date(),
            rememberMe: false,
        });

        await app.init();
    });

    it(`GET ${E2E_ROLE_ADMIN_LIST_URL} List Success`, async () => {
        const response = await request(app.getHttpServer())
            .get(E2E_ROLE_ADMIN_LIST_URL)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);

        return;
    });

    it(`GET ${E2E_ROLE_ADMIN_GET_BY_ID_URL} Get Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .get(
                E2E_ROLE_ADMIN_GET_BY_ID_URL.replace(
                    ':_id',
                    `${new Types.ObjectId()}`
                )
            )
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR
        );

        return;
    });

    it(`GET ${E2E_ROLE_ADMIN_GET_BY_ID_URL} Get Success`, async () => {
        const response = await request(app.getHttpServer())
            .get(E2E_ROLE_ADMIN_GET_BY_ID_URL.replace(':_id', role._id))
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);

        return;
    });

    it(`POST ${E2E_ROLE_ADMIN_CREATE_URL} Create Error Request`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_ROLE_ADMIN_CREATE_URL)
            .send({
                name: 123123,
            })
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.statusCode).toEqual(
            ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR
        );

        return;
    });

    it(`POST ${E2E_ROLE_ADMIN_CREATE_URL} Create Exist`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_ROLE_ADMIN_CREATE_URL)
            .send(existData)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR
        );

        return;
    });

    it(`POST ${E2E_ROLE_ADMIN_CREATE_URL} Create Success`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_ROLE_ADMIN_CREATE_URL)
            .send(successData)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(response.body.statusCode).toEqual(HttpStatus.CREATED);

        return;
    });

    it(`PUT ${E2E_ROLE_ADMIN_UPDATE_URL} Update Error Request`, async () => {
        const response = await request(app.getHttpServer())
            .put(E2E_ROLE_ADMIN_UPDATE_URL.replace(':_id', roleUpdate._id))
            .send({
                name: [231231],
            })
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.statusCode).toEqual(
            ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR
        );

        return;
    });

    it(`PUT ${E2E_ROLE_ADMIN_UPDATE_URL} Update Not found`, async () => {
        const response = await request(app.getHttpServer())
            .put(
                E2E_ROLE_ADMIN_UPDATE_URL.replace(
                    ':_id',
                    `${new Types.ObjectId()}`
                )
            )
            .send(updateData)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR
        );

        return;
    });

    it(`PUT ${E2E_ROLE_ADMIN_UPDATE_URL} Update Exist`, async () => {
        const response = await request(app.getHttpServer())
            .put(E2E_ROLE_ADMIN_UPDATE_URL.replace(':_id', roleUpdate._id))
            .send(existData)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR
        );

        return;
    });

    it(`PUT ${E2E_ROLE_ADMIN_UPDATE_URL} Update Success`, async () => {
        const response = await request(app.getHttpServer())
            .put(E2E_ROLE_ADMIN_UPDATE_URL.replace(':_id', roleUpdate._id))
            .send(updateData)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);

        return;
    });

    it(`PATCH ${E2E_ROLE_ADMIN_INACTIVE_URL} Inactive, Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .patch(
                E2E_ROLE_ADMIN_INACTIVE_URL.replace(
                    ':_id',
                    `${new Types.ObjectId()}`
                )
            )
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR
        );

        return;
    });

    it(`PATCH ${E2E_ROLE_ADMIN_INACTIVE_URL} Inactive, success`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_ROLE_ADMIN_INACTIVE_URL.replace(':_id', roleUpdate._id))
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);

        return;
    });

    it(`PATCH ${E2E_ROLE_ADMIN_INACTIVE_URL} Inactive, already inactive`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_ROLE_ADMIN_INACTIVE_URL.replace(':_id', roleUpdate._id))
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_ACTIVE_ERROR
        );

        return;
    });

    it(`PATCH ${E2E_ROLE_ADMIN_ACTIVE_URL} Active, Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .patch(
                E2E_ROLE_ADMIN_ACTIVE_URL.replace(
                    ':_id',
                    `${new Types.ObjectId()}`
                )
            )
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR
        );

        return;
    });

    it(`PATCH ${E2E_ROLE_ADMIN_ACTIVE_URL} Active, success`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_ROLE_ADMIN_ACTIVE_URL.replace(':_id', roleUpdate._id))
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);

        return;
    });

    it(`PATCH ${E2E_ROLE_ADMIN_ACTIVE_URL} Active, already active`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_ROLE_ADMIN_ACTIVE_URL.replace(':_id', roleUpdate._id))
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_ACTIVE_ERROR
        );

        return;
    });

    it(`DELETE ${E2E_ROLE_ADMIN_DELETE_URL} Delete Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .delete(
                E2E_ROLE_ADMIN_DELETE_URL.replace(
                    ':_id',
                    `${new Types.ObjectId()}`
                )
            )
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR
        );

        return;
    });

    it(`DELETE ${E2E_ROLE_ADMIN_DELETE_URL} Delete Success`, async () => {
        const response = await request(app.getHttpServer())
            .delete(E2E_ROLE_ADMIN_DELETE_URL.replace(':_id', role._id))
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);

        return;
    });

    afterAll(async () => {
        try {
            await roleService.deleteOneById(role._id);
            await roleService.deleteOneById(roleUpdate._id);
            await roleBulkService.deleteMany({
                name: successData.name,
            });
            await roleBulkService.deleteMany({
                name: updateData.name,
            });
        } catch (e) {
            console.error(e);
        }

        connection.close();
        await app.close();
    });
});
