import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export interface RequestWithCID extends Request {
  cid: string;
}

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private request: RequestWithCID | null = null;

  constructor(@Inject(REQUEST) private readonly req: RequestWithCID) {
    this.request = req;
  }

  setRequest(req: RequestWithCID) {
    this.request = req;
  }

  getRequest(): (RequestWithCID & { cid: string }) | null {
    return this.request;
  }

  getCID(): string {
    return this.request?.cid || undefined;
  }

  getRoute(): string {
    return `${this.request?.method} ${this.request?.baseUrl}${this.request?.url}`;
  }
}
