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
	t: TFunction;
}

export function UpdatePasswordTemplate({ domain, t }: ResetPasswordTemplateProps) {
	const resetLink = `${domain}/auth/reset-password`;

	return (
		<Tailwind>
			<Html>
				<Body className="text-black">
					<Heading>{t('passwordChanged')}</Heading>
					<Text>{t('passwordChangedNotificationHTML')}</Text>
					<Link href={resetLink}>{t('recoverHTML')}</Link>
				</Body>
			</Html>
		</Tailwind>
	);
}
