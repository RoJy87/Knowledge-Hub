import { BadRequestException, PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Parse Int Pipe
 * Validates and transforms a value to an integer
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsedValue = parseInt(value, 10);

    if (Number.isNaN(parsedValue)) {
      throw new BadRequestException(`Validation failed: "${value}" is not a valid number`);
    }

    return parsedValue;
  }
}
