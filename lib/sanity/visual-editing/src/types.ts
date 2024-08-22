import type { SanityNode, SanityStegaNode } from '@sanity/visual-editing';

import { type ChannelsNode } from '@limitless-angular/sanity/channels';
import type {
  VisualEditingMsg,
  PresentationMsg,
} from '@limitless-angular/sanity/visual-editing-helpers';

/**
 * An element that is safe to parse
 * @internal
 */
export type ElementNode = HTMLElement | SVGElement;

/**
 * Object returned by node traversal
 * @internal
 */
export interface SanityNodeElements {
  element: ElementNode;
  measureElement: ElementNode;
}

/**
 * Object returned by node traversal
 * @internal
 */
export interface ResolvedElement {
  elements: SanityNodeElements;
  sanity: SanityNode | SanityStegaNode;
}

/**
 * Element data stored in controller state
 * @internal
 */
export interface OverlayElement {
  id: string;
  elements: SanityNodeElements;
  handlers: EventHandlers;
  sanity: SanityNode | SanityStegaNode;
}

/**
 * Event handlers attached to each element
 * @internal
 */
export interface EventHandlers {
  click: (event: Event) => void;
  mousedown: (event: Event) => void;
  mouseenter: (event: Event) => void;
  mouseleave: (event: Event) => void;
  mousemove: (event: Event) => void;
}

/**
 * @internal
 */
export type VisualEditingChannelSends = VisualEditingMsg;

/**
 * @internal
 */
export type VisualEditingChannelReceives = PresentationMsg;

/**
 * @internal
 */
export type VisualEditingChannel = ChannelsNode<
  VisualEditingChannelSends,
  VisualEditingChannelReceives
>;
