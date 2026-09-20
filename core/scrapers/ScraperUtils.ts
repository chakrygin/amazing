import * as core from '@actions/core';

import { Post } from '../models';

export function mergePost(post: Post, patch: Partial<Post>): Post {
  const result: Post = {
    image: patch.image ?? post.image,
    title: patch.title ?? post.title,
    href: patch.href ?? post.href,
    categories: mergeArray(post.categories, patch.categories),
    author: patch.author ?? post.author,
    date: patch.date ?? post.date,
    description: mergeArray(post.description, patch.description),
    links: mergeArray(post.links, patch.links),
    tags: mergeArray(post.tags, patch.tags),
  };

  return result;
}

function mergeArray<T>(array: T[] | undefined, patch: T[] | undefined): T[] {
  if (!array || array.length == 0) {
    return patch ?? [];
  }

  if (!patch || patch.length == 0) {
    return array;
  }

  return [...array, ...patch];
}

export function printPost(post: Post) {
  const json = JSON.stringify(post, null, 2);
  core.info('JSON: ' + json);
}
