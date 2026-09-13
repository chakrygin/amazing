import * as core from '@actions/core';
import * as github from '@actions/github';

import axios from 'axios';
import axiosRetry from 'axios-retry';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import path from 'path';

import 'dayjs/locale/ru.js';

import { Telegram } from 'telegraf';

import { AppConfig } from './AppConfig';

import { NormalizeSender, Sender, TelegramSender, ThrottleSender, ValidateSender } from './senders';

export function initialize(): void {
  // Setup default axios retries.
  axiosRetry(axios, {
    retryDelay: retryNumber => axiosRetry.exponentialDelay(retryNumber),
  });

  // Setup default moment locale.
  dayjs.locale('en');
  dayjs.extend(localizedFormat);
}

export function createConfig(): AppConfig {
  const config: AppConfig = {
    path: path.join(process.cwd(), 'data'),
    debug: github.context.ref !== 'refs/heads/main',
    manual: github.context.eventName !== 'schedule',
  };

  return config;
}

export function createTelegram(): Telegram {
  const token = getInput('AMAZING_TOKEN');
  const telegram = new Telegram(token);

  return telegram;
}

export function createSender(telegram: Telegram, category: string): Sender {
  const chatId = getInput(
    `AMAZING_${category.toUpperCase()}_CHAT_ID`,
    'AMAZING_PRIVATE_CHAT_ID');

  let sender: Sender;
  sender = new TelegramSender(telegram, chatId);
  sender = new ThrottleSender(sender, 5000);
  sender = new ValidateSender(sender);
  sender = new NormalizeSender(sender);

  return sender;
}

export function createStorage<T>(storage: new (path: string) => T, ...paths: string[]): T {
  return new storage(
    path.join(...paths));
}

export function getInput(...names: string[]): string {
  for (const name of names) {
    const value = process.env.CI
      ? core.getInput(name)
      : process.env[name];

    if (value) {
      return value;
    }
  }

  throw process.env.CI
    ? new Error('Value is missing in action inputs: ' + names.join(', '))
    : new Error('Value is missing in environment variables: ' + names.join(', '));
}
