import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';

@Controller('auth/google')
export class GoogleOauthController {

  @Get()
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() _req) {}

  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: ExpressRequestInterface, @Res() res: Response) {

    console.log(req.user);  // user data from google

    res.redirect('http://localhost:3000/api');
  }
}
