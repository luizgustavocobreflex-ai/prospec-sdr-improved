import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './auth/auth.guard';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

@Controller()
export class AppController {
  @Get('admin')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminRoute() {
    return { message: 'Área ADMIN liberada' };
  }

  @Get('sdr')
  @UseGuards(FirebaseAuthGuard)
  sdrRoute() {
    return { message: 'Área SDR liberada' };
  }
}