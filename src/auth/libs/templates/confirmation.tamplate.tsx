import { Body } from '@react-email/body';
import { Heading } from '@react-email/heading';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';
import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import * as React from 'react'

interface ConfirmationTemplateProps {
	confirmLink: string
}

export function ConfirmationTemplate({
	confirmLink
}: ConfirmationTemplateProps) {


	return (
		<Tailwind>
			<Html>
				<Body className='text-black'>
					<Heading>Подтверждение почты</Heading>
					<Text>
						Привет! Чтобы подтвердить свой адрес электронной почты, пожалуйста, перейдите по следующей ссылке:
					</Text>
					<Link href={confirmLink}>Подтвердить почту</Link>
					<Text>
						Эта ссылка действительна в течение 1 часа. Если вы не запрашивали подтверждение, просто проигнорируйте это сообщение.
					</Text>
				</Body>
			</Html>
		</Tailwind>
	)
}
