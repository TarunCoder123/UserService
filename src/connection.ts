import { log } from "./utils/helper.utils";
import { EventEmitter } from "events";
import { connections } from "./utils/constant.utils";
import prisma from "./client/prisma.client";
import { env } from "./config/env";

const prismaEvent=new EventEmitter();

class DBConnectionHandler {
    DBConnectionHandler(){

    }

    constructor() {
      this._bindPrismaEvents();
    }
  
    /**
     * Connect to PostgreSQL using Prisma
     */
    public async createDBConnection(): Promise<boolean> {
      try {
        await prisma.$connect();
        prismaEvent.emit(connections.connected);
        log.green(` ${connections.connected}`);
  
        // Ensure schema exists if needed
        if (env.DB_SCHEMA) {
          await prisma.$executeRawUnsafe(
            `CREATE SCHEMA IF NOT EXISTS "${env.DB_SCHEMA}"`
          );
          log.blue(`Schema ${env.DB_SCHEMA} ensured`);
        }
  
        return true;
      } catch (err) {
        console.log("idhaar aaya hai");
        log.red(`${connections.error}`, err);
        return false;
      }
    }
  
    /**
     * Disconnect from Prisma
     */
    public async releaseDBConnection(): Promise<void> {
      await prisma.$disconnect();
      prismaEvent.emit(connections.disconnected);
      log.red(` ${connections.disconnected}`);
    }
  
    private _bindPrismaEvents(): void {
      prismaEvent.on(connections.connected, () =>
        log.green(`Prisma connected`)
      );
      prismaEvent.on(connections.disconnected, () =>
        log.red(`Prisma disconnected`)
      );
    }
  }

  export default new DBConnectionHandler();