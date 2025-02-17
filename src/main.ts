import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger
  const DOCS_PATH = 'docs'

  const config = new DocumentBuilder()
    .setTitle('S3 Bundling Demo')
    .setDescription(`
    \nA companion project for a Medium article.`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCS_PATH, app, document);
  // Swagger end


  await app.listen(4000);
}
bootstrap();
