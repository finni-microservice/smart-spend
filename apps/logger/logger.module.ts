import { Global, Module } from '@nestjs/common';
import { AxiomLoggerService } from './axiom-logger.service';

@Global()
@Module({
  providers: [AxiomLoggerService],
  exports: [AxiomLoggerService],
})
export class LoggerModule {}
