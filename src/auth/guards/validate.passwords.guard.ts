import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RegisterDto } from '../dto/users.register.dto';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class ValidatePasswords implements ValidatorConstraintInterface {
	public validate(passwordRepeat: string, validationArguments: ValidationArguments): boolean {
		const obj = validationArguments.object as RegisterDto;
		return obj.password === passwordRepeat;
	}

	public defaultMessage(validationArguments?: ValidationArguments | undefined): string {
		return 'Пароли не совпадают.';
	}
}
