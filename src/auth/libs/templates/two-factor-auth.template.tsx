import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import * as React from 'react'

interface TwoFactorAuthTemplateProps {
	token: string;
}

export function TwoFactorAuthTemplate({ token }: TwoFactorAuthTemplateProps) {
	return (
		<Tailwind>
			<Html>
				<Body className='text-black'>
					<Heading>Двухфакторная аутентификация</Heading>
					<Text>Ваш код двухфакторной аутентификации: <strong>{token}</strong></Text>
					<Text>
						Пожалуйста, введите этот код в приложении для завершения процесса аутентификации.
					</Text>
					<Text>
						Если вы не запрашивали этот код, просто проигнорируйте это сообщение.
					</Text>
				</Body>
			</Html>
		</Tailwind>
	);
}