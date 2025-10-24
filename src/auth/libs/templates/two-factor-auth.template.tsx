import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import * as React from 'react'
import { TFunction } from 'i18next';

interface TwoFactorAuthTemplateProps {
	token: string;
	t: TFunction
}

export function TwoFactorAuthTemplate({ token, t }: TwoFactorAuthTemplateProps) {
	return (
		<Tailwind>
			<Html>
				<Body className='text-black'>
					<Heading>{t('twoFactorAuthenticationHTML')}</Heading>
					<Text>{t('yourTwoFactorCodeHTML')} <strong>{token}</strong></Text>
					<Text>
						{t('enterCodeToCompleteHTML')}
					</Text>
					<Text>
						{t('ignoreIfNotRequestedHTML')}
					</Text>
				</Body>
			</Html>
		</Tailwind>
	);
}