import path from 'path';
import * as grpc from '@grpc/grpc-js';
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js"
import * as protoLoader from '@grpc/proto-loader';
import prisma from '../client/prisma.client';

const packageDefinition = protoLoader.loadSync(path.join(__dirname, './a.proto'));

const userProto = grpc.loadPackageDefinition(packageDefinition);

//@ts-ignore
const GetAllUsers = async (call: any, callback: any) => {
    console.log("sdfaf");
    try {
        const users = await prisma.user.findMany();
        callback(null, { users });
    } catch (error) {
        callback(error);
    }
};

//@ts-ignore
const GetUser = async (call, callback) => {
    try {
        const user = await prisma.user.findUnique({
            where: { user_id: call.request.user_id }
        });
        if (!user) return callback(new Error('User not found'));
        callback(null, { user });
    } catch (error) {
        callback(error);
    }
};

// Soft delete user (update isDeleted = true)
//@ts-ignore
const DeleteUser = async (call, callback) => {
    try {
        await prisma.user.update({
            where: { user_id: call.request.user_id },
            data: { isDeleted: true },
        });
        callback(null, { message: 'User deleted (soft)' });
    } catch (error) {
        callback(error);
    }
};


// Update isAdminDeleted field
//@ts-ignore
const UpdateIsAdminDeleted = async (call, callback) => {
    try {
        await prisma.user.update({
            where: { user_id: call.request.user_id },
            data: { isAdminDeleted: call.request.isAdminDeleted },
        });
        callback(null, { message: 'isAdminDeleted updated' });
    } catch (error) {
        callback(error);
    }
};



const server = new grpc.Server();

server.addService((userProto.UserService as ServiceClientConstructor).service, {
    GetAllUsers: GetAllUsers,
    GetUser: GetUser,
    DeleteUser: DeleteUser,
    UpdateIsAdminDeleted: UpdateIsAdminDeleted
});


server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
    server.start();
});