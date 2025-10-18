import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';
import { Tailwind } from "@react-email/tailwind"
import { Html } from '@react-email/html';
import * as React from 'react';

interface ResetPasswordTemplateProps {
	domain: string;
}

export function UpdatePasswordTemplate({ domain }: ResetPasswordTemplateProps) {
	const resetLink = `${domain}/auth/reset-password`;

	return (
		<Tailwind>
			<Html>
				<Body className='text-black'>
					<Heading>Изменения пароля</Heading>
					<Text>
					Здравствуйте! Пароль был успешно изменён. Если это действие совершили не вы, вы можете восстановить пароль.
					</Text>
					<Link href={resetLink}>Восстановить</Link>
				</Body>
			</Html>
		</Tailwind>
	);
}