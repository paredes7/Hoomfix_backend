import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('complete')
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: CompleteProfileDto,
  ) {
    return this.profileService.completeProfile(user.userId, dto);
  }
}
