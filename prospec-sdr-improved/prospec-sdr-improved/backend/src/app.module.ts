import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseAuthGuard } from './auth/auth.guard';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FirebaseService, FirebaseAuthGuard],
  exports: [FirebaseService, FirebaseAuthGuard],
})
export class AppModule {}
