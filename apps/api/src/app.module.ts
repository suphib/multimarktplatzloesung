import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationModule } from './classification/classification.module';
import { SearchModule } from './search/search.module';
import { DocumentationModule } from './documentation/documentation.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { ClassificationEntity } from './classification/entities/classification.entity';
import { DocumentationEntity } from './documentation/entities/documentation.entity';
import { RahmenvertragEntity } from './embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from './search/entities/framework-contract.entity';
import { ShopConfigEntity } from './admin/entities/shop-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5450),
        username: config.get('DATABASE_USERNAME', 'procurement'),
        password: config.get('DATABASE_PASSWORD', 'procurement_secret'),
        database: config.get('DATABASE_NAME', 'procurement_ai'),
        entities: [
          ClassificationEntity,
          DocumentationEntity,
          RahmenvertragEntity,
          FrameworkContractEntity,
          ShopConfigEntity,
        ],
        synchronize: true, // Nur für Entwicklung
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    ClassificationModule,
    SearchModule,
    DocumentationModule,
    EmbeddingModule,
    HealthModule,
    AiModule,
    AdminModule,
  ],
})
export class AppModule {}
