import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as CompanyEmailValidator from 'company-email-validator';

export function IsCompanyEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCompanyEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(email: any, args: ValidationArguments) {
          return CompanyEmailValidator.isCompanyEmail(email);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid company email`;
        },
      },
    });
  };
}
