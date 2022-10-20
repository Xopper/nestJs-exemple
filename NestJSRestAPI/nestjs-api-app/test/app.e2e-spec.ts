//make a database for testing !
//Everytime we run tests, clean up data
//We must call request like we do with Postman
/**
 How to open prisma studio on "TEST" database ?
 npx dotenv -e .env.test -- prisma studio
 How to open prisma studio on "DEV" database ?
 npx dotenv -e .env -- prisma studio
 */
import {Test} from '@nestjs/testing'
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {PrismaService} from '../src/prisma/prisma.service'
import * as pactum from 'pactum'

const PORT = 3002
describe('App EndToEnd tests', () => {
  let app: INestApplication
  let prismaService: PrismaService
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = appModule.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await app.listen(PORT)
    prismaService = app.get(PrismaService)
    await prismaService.cleanDatabase()
    pactum.request.setBaseUrl(`http://localhost:${PORT}`)
  })
  
  describe('Test Authentication', () => {
    describe('Register', () => {
      it('should show error with empty email', () => {
        return pactum.spec()
              .post('/auth/register')
              .withBody({
                email: '',
                password: 'a123456'
              })
              .expectStatus(400)
              //.inspect()
      })
      it('should show error with invalid email format', () => {
        return pactum.spec()
              .post('/auth/register')
              .withBody({
                email: 'hoang@gmail', //invalid email format
                password: 'a123456'
              })
              .expectStatus(400)
              //.inspect()
      })
      it('should show error IF password is empty', () => {
        return pactum.spec()
              .post('/auth/register')
              .withBody({
                email: 'hoang@gmail.com', 
                password: '' //blank password
              })
              .expectStatus(400)
              //.inspect()
      })
      //many other cases...
      it('should Register', () => {
        return pactum.spec()
              .post('/auth/register')
              .withBody({
                email: 'testemail01@gmail.com',
                password: 'a123456'
              })
              .expectStatus(201)
              //.inspect()
      })
    })
    describe('Login', () => {
      it('should Login', () => {
        return pactum.spec()
              .post('/auth/login')
              .withBody({
                email: 'testemail01@gmail.com',
                password: 'a123456'
              })
              .expectStatus(201)
              //.inspect()
              .stores('accessToken', "accessToken")
      })
    })
    describe('User', () => {
      describe('Get Detail User', () => {
        it('should get detail user', () => {
          return pactum.spec()
                .get('/users/me')   
                .withHeaders({
                  Authorization: 'Bearer $S{accessToken}',
                })             
                .expectStatus(200)
                .stores('userId', 'id')
                //.inspect()                
        })
      })        
    })
    describe('Note', () => {
      describe('Insert Note', () => {
        it('insert first note', () => {
          return pactum.spec()
                .post('/notes')   
                .withHeaders({
                  Authorization: 'Bearer $S{accessToken}',
                })             
                .expectStatus(201)
                .stores('nodeId01', 'id')
                //.inspect()                
        })
        it('insert second note', () => {
          return pactum.spec()
                .post('/notes')   
                .withHeaders({
                  Authorization: 'Bearer $S{accessToken}',
                })             
                .expectStatus(201)
                .stores('nodeId02', 'id')
                //.inspect()                
        })
        it('insert third note', () => {
          return pactum.spec()
                .post('/notes')   
                .withHeaders({
                  Authorization: 'Bearer $S{accessToken}',
                })             
                .expectStatus(201)
                .stores('nodeId03', 'id')
                //.inspect()                
        })
      })
      describe('Get all Notes', () => {
        return pactum.spec()
                .get('/notes')   
                .withHeaders({
                  Authorization: 'Bearer $S{accessToken}',
                })             
                .expectStatus(200)                                
                //.inspect()                
      })
      describe('Get Note by Id', () => {
        return pactum.spec()
                .get('/notes')   
                .withHeaders({
                  Authorization: 'Bearer $S{accessToken}',
                })             
                .expectStatus(200)                                
      })
      describe('Delete Note by Id', () => {
        
      })
    })
  })

  afterAll(async () =>{
    app.close()
  })
  it.todo('should PASS, haha 1');  
})
