import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
  } from 'class-validator';
  import { UpdatePasswordDto } from '../dto/update.password.dto';
  
  @ValidatorConstraint({ name: 'IsNewPasswordDifferent', async: false })
  export class ValidateNewAndOldPasswords implements ValidatorConstraintInterface {
	public validate(password: string, args: ValidationArguments): boolean {
	  const obj = args.object as UpdatePasswordDto;
	  return  password !== obj.oldPassword;
	}
  
	public defaultMessage(args?: ValidationArguments): string {
	  return 'Новый пароль не должен совпадать со старым.';
	}
  }
  