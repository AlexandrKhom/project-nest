import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailAdd(user: string) {
    try {
      await this.mailerService.sendMail({
        to: user,
        from: 'noreply@gmail.com',
        subject: `Title`,
        text: `Hello. You have new notification`
      });
    } catch (e) {
      console.log(e);
    }
  }
}
