import { Sender } from './Sender';
import { Post } from '../models';

export class ThrottleSender implements Sender {
  constructor(
    private readonly sender: Sender,
    private readonly delay: number) { }

  private promise = Promise.resolve();

  async send(post: Post): Promise<void> {
    await this.promise;
    await this.sender.send(post);

    this.promise = new Promise<void>(resolve => setTimeout(resolve, this.delay));
  }
}
