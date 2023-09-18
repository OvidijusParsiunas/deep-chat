import {Catch, ArgumentsHost} from '@nestjs/common';
import {BaseExceptionFilter} from '@nestjs/core';

@Catch()
export class StabilityAIExceptionMiddleware extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.error('Service error');
    console.log(exception.response);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    if (exception.response.data?.message) {
      return response.status(500).json({error: exception.response.data.message});
    }
    response.status(500).json({error: 'Service error'});
  }
}
