import {
  type ChannelsNode,
  createChannelsNode,
} from '@limitless-angular/sanity/channels';
import { type VisualEditingConnectionIds } from '@limitless-angular/sanity/visual-editing-helpers';

import type {
  VisualEditingChannelReceives as Receives,
  VisualEditingChannelSends as Sends,
} from '../types';

export function injectChannel(): ChannelsNode<Sends, Receives> {
  return createChannelsNode<VisualEditingConnectionIds, Sends, Receives>({
    id: 'overlays',
    connectTo: 'presentation',
  });
}
