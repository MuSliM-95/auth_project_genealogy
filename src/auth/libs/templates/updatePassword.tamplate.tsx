import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';
import { Tailwind } from '@react-email/tailwind';
import { Html } from '@react-email/html';
import * as React from 'react';
import { TFunction } from 'i18next';

interface ResetPasswordTemplateProps {
	t: TFunction;
	resetLink: string
}

export function UpdatePasswordTemplate({ t, resetLink }: ResetPasswordTemplateProps) {
	

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
