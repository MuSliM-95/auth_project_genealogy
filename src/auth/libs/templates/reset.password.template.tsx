import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';
import { Tailwind } from '@react-email/tailwind';
import { Html } from '@react-email/html';
import * as React from 'react';
import { TFunction } from 'i18next';

interface ResetPasswordTemplateProps {
	domain: string;
	token: string;
	t: TFunction;
}

export function ResetPasswordTemplate({ domain, token, t }: ResetPasswordTemplateProps) {
	const resetLink = `${domain}/auth/new-password?token=${token}`;

	return (
		<Tailwind>
			<Html>
				<Body className="text-black">
					<Heading>{t('passwordResetHTML')}</Heading>
					<Text>{t('passwordResetInstructionsHTML')}</Text>
					<Link href={resetLink}>{t('confirmPasswordResetHTML')}</Link>
					<Text>{t('linkValidityNoticeHTML')}</Text>
				</Body>
			</Html>
		</Tailwind>
	);
}
