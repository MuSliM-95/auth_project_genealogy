import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';
import { Html } from '@react-email/html';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';
import { TFunction } from 'i18next';

interface ConfirmationTemplateProps {
	confirmLink: string;
	t: TFunction;
}

export function ConfirmationTemplate({ confirmLink, t }: ConfirmationTemplateProps) {
	return (
		<Tailwind>
			<Html>
				<Body className="text-black">
					<Heading>{t('emailConfirmationHTML')}</Heading>
					<Text>{t('emailConfirmationInstructionsHTML')}</Text>
					<Link href={confirmLink}>{t('confirmEmailHTML')}</Link>
					<Text>{t('emailLinkValidityNoticeHTML')}</Text>
				</Body>
			</Html>
		</Tailwind>
	);
}
