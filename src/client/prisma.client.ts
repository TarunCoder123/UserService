import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default prisma;

/**
 * This is the document for the CRUD using the prisma client
 * 
 * 1) Create ->
 * 
 * 
 *  prisma.user.create({
 * data :{
 *    email:"sdfsfds",
 *     name:"taunr",
 * },
 * })
 * 
 * let user: Prisma.UserCreateInput  // generate type
 * 
 * Bulk Insert
 * 
 * prisma.user.createMany({
 *  data:[
 *  { name: 'Bob', email: 'bob@prisma.io' },
 * { name: 'Bobo', email: 'bob@prisma.io' }, // Duplicate unique key!
 * { name: 'Yewande', email: 'yewande@prisma.io' },
 * { name: 'Angelique', email: 'angelique@prisma.io' },
 * ],
 * skipDulicates:true,
 * })  
 * 
 * count -> 3
 * 
 * createManyAndReturn  -> create many and return all of them
 * 
 * 
 * 2) Read  ->  findMany,findUnique,findFirst
 * 
 * findUnique({
 * where:{email:"7tarun7singh@gmail.com"}
 * });
 * 
 * findMany()
 * 
 * return the most recently created user with atleast one post that more than 100 likes
 * 
 * const findUser=await prisma.user.findfirst({
 * where: {
 * posts:{
 * some:{
 * likes:{
 * gt: 100,
 * }
 * }}},
 * orderBy: {
 * id: 'desc',
 * },
 * });
 * 
 * const users=await prisma.user.findMany({
 * where:{
 *   email: {
 *     endsWith: 'prisma.io',
 * }
 * }})
 * 
//  * const users = await prisma.user.findMany({
//   where: {
//     OR: [
//       {
//         AND: [
//           { profileViews: { gt: 5 } },
//           { role: 'ADMIN' },
//         ],
//       },
//       {
//         NOT: {
//           email: {
//             contains: '@spam.com',
//           },
//         },
//       },
//     ],
//   },
// });
 * 
 *
 * const user=await prisma.user.findUnique({
 * where:{email:"7tarun7singh@gmail.com",},
 * select:{
 * email:true,  // it will only show me the email and name
 * name:true,
 * },
 * })
 * 
 * some other kind of the select
 * 
 * select: {
 * email: true,
 * posts: {
 *    select: {
 *   likes:true,
 * },
 * },
 * },
 * 
 * 
 */
