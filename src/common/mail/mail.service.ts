import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { MailConfig } from '../../configs/mail.config';
import { render } from '@react-email/render';
import { DotenvConfig } from '../../configs/dotenv.config';
import { ConfirmationTemplate } from '../../auth/libs/templates/confirmation.tamplate';
import { ResetPasswordTemplate } from '../../auth/libs/templates/reset.password.template';
import { TwoFactorAuthTemplate } from '../../auth/libs/templates/two-factor-auth.template';
import { UpdatePasswordTemplate } from '../../auth/libs/templates/updatePassword.tamplate';
import { TFunction } from 'i18next';
import { ILogger } from '../../logger/logger.interface';
import { DeleteProfileTemplate } from '../../auth/libs/templates/delete.profile.template';

@injectable()
export class MailService {
	constructor(
		@inject(TYPES.MailConfig) private mailConfig: MailConfig,
		@inject(TYPES.DotenvConfig) private dotenvConfig: DotenvConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {}

	public async sendConfirmationEmail(email: string, token: string, pathUrl: string, t: TFunction, lang: string) {
		const domain = this.dotenvConfig.get('CLIENT_URL_NAME');
		const confirmLink = `${domain}/${lang}/${pathUrl}?token=${token}`;
		try {
			const html = await render(ConfirmationTemplate({ confirmLink, t }));
			return this.sendMail(email, t('emailConfirmationHTML'), html);
		} catch (error) {
			this.logger.error(`[MailService.sendConfirmationEmail]. ${error}`);
		}
	}

	public async sendPasswordResetEmail(email: string, token: string, t: TFunction, lang: string) {
		const domain = this.dotenvConfig.get('CLIENT_URL_NAME');
		const resetLink = `${domain}/${lang}/auth/new-password?token=${token}`;
		try {
			const html = await render(ResetPasswordTemplate({ t, resetLink }));
			return this.sendMail(email, t('passwordResetHTML'), html);
		} catch (error) {
			this.logger.error(`[MailService.sendPasswordResetEmail]. ${error}`);
		}
	}


	public async sendPasswordUpdateEmail(email: string, t: TFunction, lang: string) {
		const domain = this.dotenvConfig.get('CLIENT_URL_NAME');
		const resetLink = `${domain}/${lang}/auth/reset-password`;
		try {
			const html = await render(UpdatePasswordTemplate({ t, resetLink }));
			return this.sendMail(email, t('passwordChangeHTML'), html);
		} catch (error) {
			this.logger.error(`[MailService.sendPasswordUpdateEmail]. ${error}`);
		}
	}

	public async sendTwoFactorTokenEmail(email: string, token: string, t: TFunction) {
		try {
			const html = await render(TwoFactorAuthTemplate({ token, t }));
			return this.sendMail(email, t('identityConfirmationHTML'), html);
		} catch (error) {
			this.logger.error(`[MailService.sendTwoFactorTokenEmail]. ${error}`);
		}
	}

	public async sendDeleteProfileCode(email: string, token: string, t: TFunction) {
		try {
			 const html = await render(DeleteProfileTemplate({token, t}))
			 return this.sendMail(email, t('accountDeletionHTML'), html);
		} catch (error) {
			this.logger.error(`[MailService.sendDeleteProfileCode]. ${error}`);
		}
	}

	private sendMail(email: string, subject: string, html: string): Promise<unknown> {
		return this.mailConfig.transporter.sendMail({
			from: `Genealogy ${this.dotenvConfig.get('MAIL_LOGIN')}`,
			to: email,
			subject,
			html,
		});
	}


}
