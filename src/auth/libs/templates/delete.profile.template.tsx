import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';
import { Tailwind } from '@react-email/tailwind';
import { Html } from '@react-email/html';
import * as React from 'react';
import { TFunction } from 'i18next';

interface ResetPasswordTemplateProps {
	token: string;
	t: TFunction;
}

export function DeleteProfileTemplate({ token, t }: ResetPasswordTemplateProps) {
	
	return (
		<Tailwind>
			<Html>
				<Body className="text-black">
					<Heading>{t('accountDeletionHTML')}</Heading>
					<Text>
						{t('accountDeletionCodeHTML')} <strong>{token}</strong>
					</Text>
					<Text>{t('pleaseEnterDeletionCodeHTML')}</Text>
					<Text>{t('unauthorizedCodeWarningHTML')}</Text>
				</Body>
			</Html>
		</Tailwind>
	);
}
